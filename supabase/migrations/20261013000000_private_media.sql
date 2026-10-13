-- Private media: patient before/after photos (and all other uploads) are no longer
-- reachable at a permanent public address.
--
--   * The `media` bucket becomes private. Files are served only through signed URLs,
--     which the website requests and which expire after an hour.
--   * A signed URL can be created only for a file that belongs to something published:
--     a published before/after case, a published gallery photo or a published article's
--     cover. Unpublished or withdrawn cases can't be fetched, even with the exact path.
--   * Signed-in team members can read every file (the staff area previews drafts).
--
-- Uploading, replacing and deleting stay team-only (policies in the first migration).

update storage.buckets set public = false where id = 'media';

create policy "read published media" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'media'
    and (
      (select public.is_team())
      or exists (
        select 1 from public.result_cases r
        where r.published and storage.objects.name in (r.before_path, r.after_path)
      )
      or exists (
        select 1 from public.gallery_items g
        where g.published and g.image_path = storage.objects.name
      )
      or exists (
        select 1 from public.articles a
        where a.status = 'published' and a.cover_path = storage.objects.name
      )
    )
  );
