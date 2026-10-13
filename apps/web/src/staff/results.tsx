import type { Database } from '@quantam/supabase';
import { TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Field, SelectField } from '@/components/ui/field';
import { treatments } from '@/content/clinic';

import { treatmentName } from './appointments-data';
import { useStaffDocument } from './document';
import { backend, errorMessage } from './session';
import { Empty, Notice, Panel, Pill, StaffPage, Toggle } from './ui';
import { MediaImg } from './media-img';
import { removeImage, uploadImage } from './upload';

type ResultCase = Database['public']['Tables']['result_cases']['Row'];

function PhotoInput({
  label,
  path,
  onFile,
}: {
  label: string;
  path: string | null;
  onFile: (file: File) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col gap-2">
      <span className="text-label font-medium">{label}</span>
      <span className="grid aspect-4/3 place-items-center overflow-hidden rounded-2xl border border-dashed border-line-strong bg-sunken">
        {path ? (
          <MediaImg path={path} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-small text-ink-muted">
            <UploadSimpleIcon size={24} aria-hidden />
            Choose photo
          </span>
        )}
      </span>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </label>
  );
}

function NewCase({ onDone }: { onDone: () => void }) {
  const [treatment, setTreatment] = useState(treatments[0]!.slug);
  const [title, setTitle] = useState('');
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [publish, setPublish] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File, setter: (path: string) => void) => {
    setBusy(true);
    setError('');
    try {
      setter((await uploadImage(file, 'results')).path);
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    }
    setBusy(false);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!backend) return;
    if (!before || !after) return setError('Add both the before and the after photo.');
    if (title.trim().length < 2)
      return setError('Give the case a short title, e.g. “Upper front veneers”.');
    if (publish && !consent) return setError('Confirm the patient agreed before publishing.');
    setBusy(true);
    const { error: insertError } = await backend.from('result_cases').insert({
      treatment_slug: treatment,
      title: title.trim(),
      before_path: before,
      after_path: after,
      consent_confirmed: consent,
      published: publish && consent,
    });
    setBusy(false);
    if (insertError) return setError(errorMessage(insertError));
    onDone();
    setTitle('');
    setBefore(null);
    setAfter(null);
    setConsent(false);
  };

  return (
    <Panel>
      <form onSubmit={save} className="flex flex-col gap-4">
        <h2 className="font-display text-heading font-semibold">Add a before & after</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Treatment"
            options={treatments.map((item) => ({ value: item.slug, label: item.name }))}
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
          />
          <Field
            label="Title"
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <PhotoInput
            label="Before"
            path={before}
            onFile={(file) => void upload(file, setBefore)}
          />
          <PhotoInput label="After" path={after} onFile={(file) => void upload(file, setAfter)} />
        </div>
        <p className="text-caption text-ink-muted">
          Use the same angle and framing for both. Photos are resized and their location data
          removed before upload.
        </p>
        <Toggle
          label="The patient gave written consent to show these photos"
          hint="Required before a case can be published."
          checked={consent}
          onChange={setConsent}
        />
        <Toggle label="Publish on the website" checked={publish} onChange={setPublish} />
        {error ? <Notice tone="error">{error}</Notice> : null}
        <Button type="submit" loading={busy} className="self-start">
          Save case
        </Button>
      </form>
    </Panel>
  );
}

export default function ResultsPage() {
  useStaffDocument('Before & after');
  const queryClient = useQueryClient();
  const cases = useQuery({
    queryKey: ['staff-results'],
    enabled: !!backend,
    queryFn: async () => {
      const { data, error } = await backend!
        .from('result_cases')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['staff-results'] });
    void queryClient.invalidateQueries({ queryKey: ['results'] });
  };

  const togglePublished = async (item: ResultCase) => {
    if (!backend) return;
    if (!item.published && !item.consent_confirmed) {
      if (!window.confirm('Confirm the patient gave written consent to publish these photos.'))
        return;
      await backend
        .from('result_cases')
        .update({ consent_confirmed: true, published: true })
        .eq('id', item.id);
    } else {
      await backend.from('result_cases').update({ published: !item.published }).eq('id', item.id);
    }
    refresh();
  };

  const remove = async (item: ResultCase) => {
    if (!backend || !window.confirm(`Delete “${item.title}”?`)) return;
    const { error } = await backend.from('result_cases').delete().eq('id', item.id);
    if (!error) await Promise.all([removeImage(item.before_path), removeImage(item.after_path)]);
    refresh();
  };

  return (
    <StaffPage
      title="Before & after"
      description="Real cases shown in the Results section and on each treatment page. Published cases replace the demo images."
    >
      <NewCase onDone={refresh} />
      {cases.data?.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cases.data.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-3"
            >
              <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl">
                <MediaImg
                  path={item.before_path}
                  alt="Before"
                  className="aspect-square object-cover"
                />
                <MediaImg
                  path={item.after_path}
                  alt="After"
                  className="aspect-square object-cover"
                />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-caption text-ink-muted">
                    {treatmentName(item.treatment_slug)}
                  </span>
                </div>
                <Pill
                  className={
                    item.published ? 'bg-success-soft text-success' : 'bg-sunken text-ink-muted'
                  }
                >
                  {item.published ? 'Live' : 'Hidden'}
                </Pill>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="min-h-9 px-3 text-small"
                  onClick={() => void togglePublished(item)}
                >
                  {item.published ? 'Hide' : 'Publish'}
                </Button>
                <button
                  type="button"
                  aria-label={`Delete ${item.title}`}
                  onClick={() => void remove(item)}
                  className="grid size-9 place-items-center rounded-full text-ink-muted hover:bg-sunken hover:text-danger"
                >
                  <TrashIcon size={18} aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : cases.isPending ? null : (
        <Empty>
          No cases yet. Until you add some, the website shows clearly-labelled demo images.
        </Empty>
      )}
    </StaffPage>
  );
}
