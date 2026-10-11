-- Gallery videos: besides uploaded photos, the team can add a YouTube video or a Google
-- Drive file (shared "Anyone with the link"). Only the video's ID is stored, never the
-- pasted URL; the website builds the embed address itself from a fixed template, so a
-- row can't point an iframe at any other site.

alter table public.gallery_items
  add column kind text not null default 'photo' check (kind in ('photo', 'youtube', 'drive')),
  add column video_id text,
  alter column image_path drop not null,
  add constraint gallery_media check (
    (kind = 'photo' and image_path is not null and video_id is null)
    or (kind = 'youtube' and image_path is null and video_id is not null and video_id ~ '^[A-Za-z0-9_-]{11}$')
    or (kind = 'drive' and image_path is null and video_id is not null and video_id ~ '^[A-Za-z0-9_-]{20,100}$')
  );
