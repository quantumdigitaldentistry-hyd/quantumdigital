import type { Database } from '@quantam/supabase';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field, SelectField, TextAreaField } from '@/components/ui/field';
import { Markdown } from '@/lib/markdown';
import { cx } from '@/lib/cx';

import { useStaffDocument } from './document';
import { backend, errorMessage } from './session';
import { timeAgo } from './time';
import { Empty, Notice, Pill, StaffPage, Toggle } from './ui';
import { MediaImg } from './media-img';
import { removeImage, uploadImage } from './upload';

type Article = Database['public']['Tables']['articles']['Row'];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, 80);

const EXAMPLE = `## Why it matters

Write in short paragraphs. Use **bold** for key points.

- Bullet points work
- So do [links](https://example.com)

> Tip: keep it practical and friendly.`;

function useArticles() {
  return useQuery({
    queryKey: ['staff-articles'],
    enabled: !!backend,
    queryFn: async () => {
      const { data, error } = await backend!
        .from('articles')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

function Editor({ article, onClose }: { article: Article | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(article?.title ?? '');
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(!!article);
  const [kind, setKind] = useState(article?.kind ?? 'article');
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');
  const [body, setBody] = useState(article?.body ?? EXAMPLE);
  const [published, setPublished] = useState(article?.status === 'published');
  const [cover, setCover] = useState<string | null>(article?.cover_path ?? null);
  const [coverAlt, setCoverAlt] = useState(article?.cover_alt ?? '');
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onCover = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const uploaded = await uploadImage(file, 'articles');
      setCover(uploaded.path);
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    }
    setBusy(false);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!backend) return;
    if (title.trim().length < 3) return setError('Add a title.');
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
      return setError('The web address can use lower-case letters, numbers and dashes.');
    if (cover && coverAlt.trim().length < 3)
      return setError('Describe the cover image for screen readers.');
    setBusy(true);
    setError('');
    const row = {
      title: title.trim(),
      slug,
      kind,
      excerpt: excerpt.trim(),
      body,
      status: published ? 'published' : 'draft',
      cover_path: cover,
      cover_alt: coverAlt.trim(),
    };
    const result = article
      ? await backend.from('articles').update(row).eq('id', article.id)
      : await backend.from('articles').insert(row);
    setBusy(false);
    if (result.error) return setError(errorMessage(result.error));
    if (article?.cover_path && article.cover_path !== cover) await removeImage(article.cover_path);
    void queryClient.invalidateQueries({ queryKey: ['staff-articles'] });
    void queryClient.invalidateQueries({ queryKey: ['articles'] });
    onClose();
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Title"
          value={title}
          maxLength={140}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
        <Field
          label="Web address"
          prefix="/dental-knowledge/"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
        />
        <SelectField
          label="Type"
          options={[
            { value: 'article', label: 'Article (guide)' },
            { value: 'blog', label: 'Blog post' },
          ]}
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-label font-medium">Cover image (optional)</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => void onCover(e.target.files?.[0])}
            className="text-small"
          />
        </div>
      </div>
      {cover ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <MediaImg
            path={cover}
            alt=""
            className="aspect-video w-full rounded-2xl object-cover sm:w-56"
          />
          <div className="flex flex-1 flex-col gap-2">
            <Field
              label="Describe the image"
              value={coverAlt}
              maxLength={200}
              onChange={(e) => setCoverAlt(e.target.value)}
            />
            <button
              type="button"
              className="self-start text-small font-medium text-danger"
              onClick={() => setCover(null)}
            >
              Remove cover
            </button>
          </div>
        </div>
      ) : null}
      <TextAreaField
        label="Summary (shown on the list)"
        rows={2}
        maxLength={300}
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-label font-medium">Article</span>
          <div className="flex gap-1 rounded-full bg-sunken p-1 text-small">
            {['Write', 'Preview'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setPreview(label === 'Preview')}
                className={cx(
                  'rounded-full px-3 py-1',
                  (label === 'Preview') === preview && 'bg-surface font-semibold shadow-sm',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {preview ? (
          <div className="min-h-64 rounded-control border border-line p-4">
            <Markdown source={body} />
          </div>
        ) : (
          <TextAreaField
            label="Body (Markdown)"
            hint="## Heading, **bold**, *italic*, - bullet, 1. numbered, > quote, [link](https://…)"
            rows={14}
            maxLength={60000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        )}
      </div>
      <Toggle
        label="Published"
        hint="Visible on the Dental Knowledge page."
        checked={published}
        onChange={setPublished}
      />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button type="submit" loading={busy} className="self-start">
        {article ? 'Save changes' : 'Create'}
      </Button>
    </form>
  );
}

export default function ArticlesPage() {
  useStaffDocument('Dental knowledge');
  const articles = useArticles();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Article | null | 'new'>(null);

  const remove = async (article: Article) => {
    if (!backend || !window.confirm(`Delete “${article.title}”?`)) return;
    const { error } = await backend.from('articles').delete().eq('id', article.id);
    if (!error) await removeImage(article.cover_path);
    void queryClient.invalidateQueries({ queryKey: ['staff-articles'] });
  };

  return (
    <StaffPage
      title="Dental knowledge"
      description="Articles and blog posts for the Dental Knowledge page. Drafts stay private until published."
      actions={
        <Button onClick={() => setEditing('new')}>
          <PlusIcon size={18} aria-hidden /> New article
        </Button>
      }
    >
      {articles.isError ? <Notice tone="error">Could not load articles.</Notice> : null}
      {articles.data?.length ? (
        <ul className="flex flex-col gap-2">
          {articles.data.map((article) => (
            <li
              key={article.id}
              className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-3"
            >
              {article.cover_path ? (
                <MediaImg
                  path={article.cover_path}
                  alt=""
                  className="size-14 shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <span className="size-14 shrink-0 rounded-2xl bg-sunken" />
              )}
              <button
                type="button"
                onClick={() => setEditing(article)}
                className="flex min-w-0 flex-1 flex-col text-left"
              >
                <span className="truncate font-medium">{article.title}</span>
                <span className="text-caption text-ink-muted">
                  {article.kind === 'blog' ? 'Blog' : 'Article'} · updated{' '}
                  {timeAgo(article.updated_at)}
                </span>
              </button>
              <Pill
                className={
                  article.status === 'published'
                    ? 'bg-success-soft text-success'
                    : 'bg-sunken text-ink-muted'
                }
              >
                {article.status === 'published' ? 'Published' : 'Draft'}
              </Pill>
              <button
                type="button"
                aria-label={`Delete ${article.title}`}
                onClick={() => void remove(article)}
                className="grid size-10 place-items-center rounded-full text-ink-muted hover:bg-sunken hover:text-danger"
              >
                <TrashIcon size={18} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : articles.isPending ? (
        <p className="text-small text-ink-muted">Loading…</p>
      ) : (
        <Empty>No articles yet. Write the first one for patients.</Empty>
      )}
      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        variant="drawer"
        className="w-[min(46rem,100vw)]!"
        title={editing === 'new' ? 'New article' : 'Edit article'}
      >
        {editing !== null ? (
          <Editor
            key={editing === 'new' ? 'new' : editing.id}
            article={editing === 'new' ? null : editing}
            onClose={() => setEditing(null)}
          />
        ) : null}
      </Dialog>
    </StaffPage>
  );
}
