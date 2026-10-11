import type { Database } from '@quantam/supabase';
import {
  CheckCircleIcon,
  LinkSimpleIcon,
  PlayIcon,
  TrashIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { cx } from '@/lib/cx';
import {
  embedUrl,
  parseVideoLink,
  providerLabel,
  thumbnailUrl,
  type VideoRef,
} from '@/lib/video-links';

import { useStaffDocument } from './document';
import { backend, errorMessage } from './session';
import { Empty, Notice, Panel, Pill, StaffPage } from './ui';
import { mediaUrl, removeImage, uploadImage } from './upload';

type GalleryItem = Database['public']['Tables']['gallery_items']['Row'];

const videoOf = (item: GalleryItem): VideoRef | null =>
  (item.kind === 'youtube' || item.kind === 'drive') && item.video_id
    ? { provider: item.kind, id: item.video_id }
    : null;

function VideoStill({ video, className }: { video: VideoRef; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={cx(
        'relative grid aspect-video place-items-center overflow-hidden bg-sunken',
        className,
      )}
    >
      {failed ? (
        <span className="px-4 text-center text-caption text-ink-muted">
          No preview. For Drive, share the file as “Anyone with the link”.
        </span>
      ) : (
        <img
          src={thumbnailUrl(video)}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <span className="relative grid size-11 place-items-center rounded-full bg-surface/90 text-ink shadow">
        <PlayIcon size={20} weight="fill" aria-hidden />
      </span>
    </span>
  );
}

function ItemRow({ item, onChange }: { item: GalleryItem; onChange: () => void }) {
  const [alt, setAlt] = useState(item.alt);
  const video = videoOf(item);
  const [error, setError] = useState('');

  const update = async (patch: Partial<GalleryItem>) => {
    if (!backend) return;
    const { error: updateError } = await backend
      .from('gallery_items')
      .update(patch)
      .eq('id', item.id);
    if (updateError) setError(errorMessage(updateError));
    else onChange();
  };

  const remove = async () => {
    if (!backend || !window.confirm(video ? 'Remove this video?' : 'Delete this photo?')) return;
    const { error: deleteError } = await backend.from('gallery_items').delete().eq('id', item.id);
    if (!deleteError && item.image_path) await removeImage(item.image_path);
    onChange();
  };

  return (
    <li className="flex flex-col gap-2 rounded-3xl border border-line bg-surface p-3">
      {video ? (
        <a
          href={embedUrl(video)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Play ${item.alt} (opens in a new tab)`}
          className="block"
        >
          <VideoStill video={video} className="w-full rounded-2xl" />
        </a>
      ) : item.image_path ? (
        <img
          src={mediaUrl(item.image_path)}
          alt={item.alt}
          className="aspect-4/3 w-full rounded-2xl object-cover"
        />
      ) : null}
      <label className="flex flex-col gap-1 text-caption">
        {video ? 'Title (shown under the video)' : 'Description (for screen readers)'}
        <input
          value={alt}
          maxLength={200}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={() =>
            alt.trim() !== item.alt && alt.trim().length >= 3 && void update({ alt: alt.trim() })
          }
          className="min-h-10 rounded-control border border-line-strong bg-surface px-3 text-small"
        />
      </label>
      <div className="flex items-center justify-between gap-2">
        <span className="flex flex-wrap gap-1">
          <Pill
            className={item.published ? 'bg-success-soft text-success' : 'bg-sunken text-ink-muted'}
          >
            {item.published ? 'Live' : 'Hidden'}
          </Pill>
          {video ? (
            <Pill className="bg-brand-soft text-brand">{providerLabel(video.provider)}</Pill>
          ) : null}
        </span>
        <div className="flex gap-1">
          <Button
            variant="secondary"
            className="min-h-9 px-3 text-small"
            onClick={() => void update({ published: !item.published })}
          >
            {item.published ? 'Hide' : 'Show'}
          </Button>
          <button
            type="button"
            aria-label={video ? 'Remove video' : 'Delete photo'}
            onClick={() => void remove()}
            className="grid size-9 place-items-center rounded-full text-ink-muted hover:bg-sunken hover:text-danger"
          >
            <TrashIcon size={18} aria-hidden />
          </button>
        </div>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
    </li>
  );
}

/** Paste a YouTube or Google Drive link; only the checked video ID is saved. */
function AddVideoLink({ onAdded }: { onAdded: () => void }) {
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const parsed = link.trim() ? parseVideoLink(link) : null;
  const video = parsed && 'provider' in parsed ? parsed : null;
  const input = 'min-h-11 rounded-control border border-line-strong bg-surface px-3 text-body';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!backend || !video) return;
    const name = title.trim();
    if (name.length < 3) {
      return setMessage({ tone: 'error', text: 'Give the video a title (3 or more characters).' });
    }
    setSaving(true);
    setMessage(null);
    const { error } = await backend.from('gallery_items').insert({
      kind: video.provider,
      video_id: video.id,
      image_path: null,
      alt: name.slice(0, 200),
    });
    setSaving(false);
    if (error) return setMessage({ tone: 'error', text: errorMessage(error) });
    setLink('');
    setTitle('');
    setMessage({ tone: 'success', text: 'Video added to the gallery.' });
    onAdded();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-line p-4">
      <div className="flex items-center gap-2">
        <LinkSimpleIcon size={22} className="text-brand" aria-hidden />
        <h2 className="font-medium">Add a video link</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_16rem]">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-label font-medium">
            YouTube or Google Drive link
            <input
              type="text"
              inputMode="url"
              className={input}
              placeholder="https://youtu.be/… or https://drive.google.com/file/d/…"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                setMessage(null);
              }}
              aria-invalid={!!parsed && !video}
              aria-describedby="video-link-hint"
            />
          </label>
          <p id="video-link-hint" className="text-caption text-ink-muted" aria-live="polite">
            {parsed && 'error' in parsed ? (
              <span className="text-danger">{parsed.error}</span>
            ) : video ? (
              <span className="inline-flex items-center gap-1 text-success">
                <CheckCircleIcon size={16} weight="fill" aria-hidden />
                {providerLabel(video.provider)} video found.
              </span>
            ) : (
              'For Google Drive, set the file’s sharing to “Anyone with the link” first, or visitors won’t be able to play it.'
            )}
          </p>
          <label className="flex flex-col gap-1 text-label font-medium">
            Title
            <input
              className={input}
              maxLength={200}
              placeholder="e.g. A walk through our implant studio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <Button type="submit" className="self-start" loading={saving} disabled={!video}>
            Add video
          </Button>
        </div>
        {video ? (
          <VideoStill key={video.id} video={video} className="self-start rounded-2xl" />
        ) : (
          <span className="hidden aspect-video place-items-center rounded-2xl border border-dashed border-line-strong text-caption text-ink-muted md:grid">
            Preview
          </span>
        )}
      </div>
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
    </form>
  );
}

export default function GalleryPage() {
  useStaffDocument('Gallery');
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const items = useQuery({
    queryKey: ['staff-gallery'],
    enabled: !!backend,
    queryFn: async () => {
      const { data, error: loadError } = await backend!
        .from('gallery_items')
        .select('*')
        .order('sort')
        .order('created_at', { ascending: false });
      if (loadError) throw loadError;
      return data;
    },
  });
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['staff-gallery'] });
    void queryClient.invalidateQueries({ queryKey: ['gallery'] });
  };

  const upload = async (files: FileList | null) => {
    if (!backend || !files?.length) return;
    setBusy(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        const { path, width, height } = await uploadImage(file, 'gallery');
        const alt =
          file.name
            .replace(/\.[^.]+$/, '')
            .replace(/[-_]+/g, ' ')
            .trim() || 'Clinic photo';
        const { error: insertError } = await backend.from('gallery_items').insert({
          image_path: path,
          alt: alt.length >= 3 ? alt.slice(0, 200) : 'Clinic photo',
          width,
          height,
        });
        if (insertError) throw insertError;
      }
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    }
    setBusy(false);
    refresh();
  };

  return (
    <StaffPage
      title="Gallery"
      description="Clinic photos and videos for the Gallery page and the home page preview."
    >
      <Panel className="flex flex-col gap-3">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-line-strong p-8 text-center hover:border-brand">
          <UploadSimpleIcon size={28} className="text-brand" aria-hidden />
          <span className="font-medium">{busy ? 'Uploading…' : 'Add photos'}</span>
          <span className="text-caption text-ink-muted">
            JPG, PNG or WebP. Resized for the web; location data removed. Add a description to each
            after upload.
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            className="sr-only"
            onChange={(e) => void upload(e.target.files)}
          />
        </label>
        {error ? <Notice tone="error">{error}</Notice> : null}
        <AddVideoLink onAdded={refresh} />
      </Panel>
      {items.data?.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.data.map((item) => (
            <ItemRow key={item.id} item={item} onChange={refresh} />
          ))}
        </ul>
      ) : items.isPending ? null : (
        <Empty>No photos or videos yet. Until you add some, the website shows stock photos.</Empty>
      )}
    </StaffPage>
  );
}
