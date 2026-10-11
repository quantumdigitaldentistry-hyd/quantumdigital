-- Quantum Digital Dentistry: team accounts, appointments, site content and media.
--
-- Security model
--   * Accounts are invite-only (public sign-up is off in config.toml). A team_members row
--     is what grants access; no row = no access, even with a valid login.
--   * Roles: super_admin (the clinic account), doctor, staff. Roles are only ever written
--     by SECURITY DEFINER functions or the service role (Edge Functions), never directly
--     by a client, so nobody can promote themselves.
--   * Every table has RLS. The public (anon) role can read published content and the two
--     public site settings, and nothing else. Website bookings are inserted by the
--     book-appointment Edge Function with the service role, after validation and rate
--     limiting, so anon has no insert rights on appointments.

create extension if not exists btree_gist with schema extensions;

-- ---------------------------------------------------------------------------------------
-- Team
-- ---------------------------------------------------------------------------------------
create type public.team_role as enum ('super_admin', 'doctor', 'staff');

create table public.team_members (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '' check (char_length(full_name) <= 80),
  role public.team_role not null default 'staff',
  -- Links a doctor account to the public profile on the website (content/clinic.ts).
  doctor_slug text check (doctor_slug is null or doctor_slug ~ '^[a-z0-9-]{1,60}$'),
  phone text check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$'),
  -- Calendar colour for this doctor (hex).
  colour text not null default '#1a5bc4' check (colour ~ '^#[0-9a-fA-F]{6}$'),
  active boolean not null default true,
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
comment on table public.team_members is 'Who may sign in to the staff area, and as what.';

-- Role of the signed-in user, or null if they are not an active team member.
create function public.my_role()
returns public.team_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.team_members where id = (select auth.uid()) and active
$$;

create function public.is_team()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.team_members where id = (select auth.uid()) and active)
$$;

-- Doctors and the super admin manage the team.
create function public.can_manage_team()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.my_role() in ('super_admin', 'doctor'), false)
$$;

revoke all on function public.my_role(), public.is_team(), public.can_manage_team() from public, anon;
grant execute on function public.my_role(), public.is_team(), public.can_manage_team() to authenticated;
-- Content policies ask "published, or is this the team?" for visitors too; for them it is false.
grant execute on function public.is_team() to anon;

alter table public.team_members enable row level security;

create policy "team can see the team"
  on public.team_members for select to authenticated
  using ((select public.is_team()));

-- Members may edit only their own name, phone and colour (column grants below); role,
-- active and doctor_slug go through set_team_member().
create policy "members update their own profile"
  on public.team_members for update to authenticated
  using (id = (select auth.uid()) and (select public.is_team()))
  with check (id = (select auth.uid()));

revoke all on public.team_members from anon, authenticated;
grant select on public.team_members to authenticated;
grant update (full_name, phone, colour) on public.team_members to authenticated;

-- Change a member's role, status or doctor link. Doctors cannot touch the super admin or
-- create one; nobody can change their own role or deactivate themselves.
create function public.set_team_member(
  member uuid,
  new_role public.team_role,
  new_active boolean,
  new_doctor_slug text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller public.team_role := public.my_role();
  target public.team_role;
begin
  if caller is null or caller not in ('super_admin', 'doctor') then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  if member = (select auth.uid()) then
    raise exception 'You cannot change your own role or status' using errcode = '42501';
  end if;
  select role into target from public.team_members where id = member;
  if target is null then
    raise exception 'No such team member' using errcode = 'P0002';
  end if;
  if caller <> 'super_admin' and (target = 'super_admin' or new_role = 'super_admin') then
    raise exception 'Only the clinic account can manage the super admin role' using errcode = '42501';
  end if;
  update public.team_members
     set role = new_role, active = new_active, doctor_slug = new_doctor_slug
   where id = member;
end;
$$;
revoke all on function public.set_team_member(uuid, public.team_role, boolean, text) from public, anon;
grant execute on function public.set_team_member(uuid, public.team_role, boolean, text) to authenticated;

-- The clinic's own account becomes the super admin when it is created. Every other
-- account gets its team row from the team-invite Edge Function.
create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(new.email) = 'quantumdigitaldentistry@gmail.com' then
    insert into public.team_members (id, email, full_name, role)
    values (new.id, lower(new.email), 'Quantum Digital Dentistry', 'super_admin')
    on conflict (id) do update set role = 'super_admin', active = true;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------------------
-- Appointments
-- ---------------------------------------------------------------------------------------
create type public.appointment_status as enum (
  'requested', 'confirmed', 'completed', 'cancelled', 'no_show'
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null default 'appointment' check (kind in ('appointment', 'callback')),
  source text not null default 'website' check (source in ('website', 'staff')),
  patient_name text not null check (char_length(btrim(patient_name)) between 2 and 80),
  patient_phone text not null check (patient_phone ~ '^\+91[6-9][0-9]{9}$'),
  treatment_slug text check (treatment_slug is null or treatment_slug ~ '^[a-z0-9-]{1,60}$'),
  preferred_date date,
  preferred_time text check (preferred_time is null or preferred_time in ('morning', 'afternoon', 'evening')),
  message text check (message is null or char_length(message) <= 500),
  status public.appointment_status not null default 'requested',
  doctor_id uuid references public.team_members (id) on delete set null,
  starts_at timestamptz,
  ends_at timestamptz,
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 2000),
  updated_by uuid references auth.users (id) on delete set null,
  constraint appointment_time_order check (ends_at is null or starts_at is null or ends_at > starts_at),
  constraint confirmed_needs_slot check (
    status <> 'confirmed' or (doctor_id is not null and starts_at is not null and ends_at is not null)
  ),
  -- A doctor can't have two confirmed appointments at the same time.
  constraint no_double_booking exclude using gist (
    doctor_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status = 'confirmed')
);
create index appointments_starts_at on public.appointments (starts_at);
create index appointments_doctor on public.appointments (doctor_id, starts_at);
create index appointments_status on public.appointments (status, created_at desc);

create function public.touch_updated()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce((select auth.uid()), new.updated_by);
  return new;
end;
$$;

create trigger appointments_touch
  before update on public.appointments
  for each row execute function public.touch_updated();

alter table public.appointments enable row level security;
revoke all on public.appointments from anon, authenticated;
grant select, insert, update on public.appointments to authenticated;
grant delete on public.appointments to authenticated;

create policy "team reads appointments" on public.appointments
  for select to authenticated using ((select public.is_team()));
create policy "team adds appointments" on public.appointments
  for insert to authenticated with check ((select public.is_team()));
create policy "team updates appointments" on public.appointments
  for update to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "managers delete appointments" on public.appointments
  for delete to authenticated using ((select public.can_manage_team()));

-- Messages sent (or opened on a staff phone) for an appointment: an audit trail.
create table public.appointment_messages (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  channel text not null check (channel in ('sms', 'whatsapp_device', 'sms_device')),
  to_phone text not null check (to_phone ~ '^\+[1-9][0-9]{7,14}$'),
  body text not null check (char_length(body) between 1 and 1000),
  status text not null default 'sent' check (status in ('sent', 'failed', 'opened_on_device')),
  provider_ref text,
  sent_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index appointment_messages_appointment on public.appointment_messages (appointment_id, created_at);

alter table public.appointment_messages enable row level security;
revoke all on public.appointment_messages from anon, authenticated;
grant select, insert on public.appointment_messages to authenticated;
create policy "team reads messages" on public.appointment_messages
  for select to authenticated using ((select public.is_team()));
create policy "team logs messages" on public.appointment_messages
  for insert to authenticated
  with check ((select public.is_team()) and sent_by = (select auth.uid()));

-- Live updates for the shared calendar (RLS still applies to what each client receives).
alter publication supabase_realtime add table public.appointments;

-- ---------------------------------------------------------------------------------------
-- Site settings: festival theme and opening hours (publicly readable)
-- ---------------------------------------------------------------------------------------
create table public.site_settings (
  key text primary key check (key in ('festival', 'clinic_hours')),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create function public.validate_site_setting()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.key = 'festival' then
    -- { "theme": "<festival id>" | null }
    if jsonb_typeof(new.value) <> 'object'
       or not (new.value ? 'theme')
       or not (jsonb_typeof(new.value -> 'theme') in ('null', 'string'))
       or (jsonb_typeof(new.value -> 'theme') = 'string'
           and (new.value ->> 'theme') !~ '^[a-z]{2,20}$') then
      raise exception 'festival must be {"theme": "<id>" | null}';
    end if;
    -- Optional offer shown on the festival banner and popup:
    -- { "title": text<=60, "discount": text<=20, "details": text<=200,
    --   "validUntil": "YYYY-MM-DD" | null, "popup": boolean }
    if new.value ? 'offer' and jsonb_typeof(new.value -> 'offer') <> 'null' then
      if jsonb_typeof(new.value -> 'offer') <> 'object'
         or char_length(coalesce(new.value #>> '{offer,title}', '')) > 60
         or char_length(coalesce(new.value #>> '{offer,discount}', '')) > 20
         or char_length(coalesce(new.value #>> '{offer,details}', '')) > 200
         or coalesce(new.value #>> '{offer,validUntil}', '') !~ '^(\d{4}-\d{2}-\d{2})?$'
         or (new.value #> '{offer,popup}' is not null
             and jsonb_typeof(new.value #> '{offer,popup}') <> 'boolean') then
        raise exception 'festival offer is not valid';
      end if;
    end if;
  elsif new.key = 'clinic_hours' then
    -- Seven entries, Sunday first: null, "closed", or {"open":"HH:MM","close":"HH:MM"}
    if jsonb_typeof(new.value) <> 'array' or jsonb_array_length(new.value) <> 7 then
      raise exception 'clinic_hours must be an array of 7 days';
    end if;
  end if;
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

create trigger site_settings_validate
  before insert or update on public.site_settings
  for each row execute function public.validate_site_setting();

alter table public.site_settings enable row level security;
revoke all on public.site_settings from anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
create policy "anyone reads site settings" on public.site_settings
  for select to anon, authenticated using (true);
create policy "team writes site settings" on public.site_settings
  for insert to authenticated with check ((select public.is_team()));
create policy "team updates site settings" on public.site_settings
  for update to authenticated using ((select public.is_team())) with check ((select public.is_team()));

insert into public.site_settings (key, value) values
  ('festival', '{"theme": null}'::jsonb),
  ('clinic_hours', '[null, {"open":"09:30","close":"21:00"}, {"open":"09:30","close":"21:00"}, {"open":"09:30","close":"21:00"}, {"open":"09:30","close":"21:00"}, {"open":"09:30","close":"21:00"}, {"open":"09:30","close":"21:00"}]'::jsonb);

-- ---------------------------------------------------------------------------------------
-- Content: dental knowledge articles, before/after cases, gallery
-- ---------------------------------------------------------------------------------------
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  kind text not null default 'article' check (kind in ('article', 'blog')),
  title text not null check (char_length(btrim(title)) between 3 and 140),
  excerpt text not null default '' check (char_length(excerpt) <= 300),
  body text not null default '' check (char_length(body) <= 60000),
  cover_path text,
  cover_alt text not null default '' check (char_length(cover_alt) <= 200),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
create index articles_published on public.articles (status, published_at desc);

create function public.stamp_published()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;
create trigger articles_touch before update on public.articles
  for each row execute function public.touch_updated();
create trigger articles_publish before insert or update on public.articles
  for each row execute function public.stamp_published();

create table public.result_cases (
  id uuid primary key default gen_random_uuid(),
  treatment_slug text not null check (treatment_slug ~ '^[a-z0-9-]{1,60}$'),
  title text not null check (char_length(btrim(title)) between 2 and 80),
  before_path text not null,
  after_path text not null,
  -- The patient agreed to these photos being shown. Required to publish.
  consent_confirmed boolean not null default false,
  published boolean not null default false,
  sort integer not null default 0,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint publish_needs_consent check (not published or consent_confirmed)
);
create trigger result_cases_touch before update on public.result_cases
  for each row execute function public.touch_updated();

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  alt text not null check (char_length(btrim(alt)) between 3 and 200),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  published boolean not null default true,
  sort integer not null default 0,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
create trigger gallery_items_touch before update on public.gallery_items
  for each row execute function public.touch_updated();

alter table public.articles enable row level security;
alter table public.result_cases enable row level security;
alter table public.gallery_items enable row level security;
revoke all on public.articles, public.result_cases, public.gallery_items from anon, authenticated;
grant select on public.articles, public.result_cases, public.gallery_items to anon, authenticated;
grant insert, update, delete on public.articles, public.result_cases, public.gallery_items to authenticated;

create policy "public reads published articles" on public.articles
  for select to anon, authenticated using (status = 'published' or (select public.is_team()));
create policy "team writes articles" on public.articles
  for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));

create policy "public reads published results" on public.result_cases
  for select to anon, authenticated using (published or (select public.is_team()));
create policy "team writes results" on public.result_cases
  for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));

create policy "public reads published gallery" on public.gallery_items
  for select to anon, authenticated using (published or (select public.is_team()));
create policy "team writes gallery" on public.gallery_items
  for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));

-- ---------------------------------------------------------------------------------------
-- Media storage: public read, team-only writes, images only, 8 MB max
-- ---------------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "team uploads media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_team()));
create policy "team updates media" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_team()))
  with check (bucket_id = 'media' and (select public.is_team()));
create policy "team deletes media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_team()));

-- ---------------------------------------------------------------------------------------
-- Private: rate limiting for public booking (used by the Edge Function, service role)
-- ---------------------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.booking_attempts (
  id bigint generated always as identity primary key,
  client_hash text not null,
  created_at timestamptz not null default now()
);
create index booking_attempts_recent on private.booking_attempts (client_hash, created_at desc);

-- True if this client may book now (at most `max_per_window` in `window_minutes`), and
-- records the attempt. Old rows are pruned as it goes.
create function public.allow_booking(hash text, max_per_window int default 5, window_minutes int default 30)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent int;
begin
  delete from private.booking_attempts where created_at < now() - interval '1 day';
  select count(*) into recent from private.booking_attempts
   where client_hash = hash and created_at > now() - make_interval(mins => window_minutes);
  if recent >= max_per_window then
    return false;
  end if;
  insert into private.booking_attempts (client_hash) values (hash);
  return true;
end;
$$;
-- In public (so the API can reach it) but executable by the service role only.
revoke all on function public.allow_booking(text, int, int) from public, anon, authenticated;
grant execute on function public.allow_booking(text, int, int) to service_role;
