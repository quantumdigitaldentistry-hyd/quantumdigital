import type { Database } from '@quantam/supabase';
import { TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { useStaffDocument } from './document';
import { backend, errorMessage } from './session';
import { Empty, Notice, Panel, Pill, StaffPage } from './ui';
import { mediaUrl, removeImage, uploadImage } from './upload';

type GalleryItem = Database['public']['Tables']['gallery_items']['Row'];

function ItemRow({ item, onChange }: { item: GalleryItem; onChange: () => void }) {
  const [alt, setAlt] = useState(item.alt);
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
    if (!backend || !window.confirm('Delete this photo?')) return;
    const { error: deleteError } = await backend.from('gallery_items').delete().eq('id', item.id);
    if (!deleteError) await removeImage(item.image_path);
    onChange();
  };

  return (
    <li className="flex flex-col gap-2 rounded-3xl border border-line bg-surface p-3">
      <img
        src={mediaUrl(item.image_path)}
        alt={item.alt}
        className="aspect-4/3 w-full rounded-2xl object-cover"
      />
      <label className="flex flex-col gap-1 text-caption">
        Description (for screen readers)
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
        <Pill
          className={item.published ? 'bg-success-soft text-success' : 'bg-sunken text-ink-muted'}
        >
          {item.published ? 'Live' : 'Hidden'}
        </Pill>
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
            aria-label="Delete photo"
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
      description="Clinic photos for the Gallery page and the home page preview."
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
      </Panel>
      {items.data?.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.data.map((item) => (
            <ItemRow key={item.id} item={item} onChange={refresh} />
          ))}
        </ul>
      ) : items.isPending ? null : (
        <Empty>No photos yet. Until you add some, the website shows stock photos.</Empty>
      )}
    </StaffPage>
  );
}
