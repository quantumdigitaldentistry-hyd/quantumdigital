import type { Database } from '@quantam/supabase';
import { useQuery } from '@tanstack/react-query';

import type { GalleryEntry } from '@/components/gallery/photo-gallery';
import type { ResultCase } from '@/content/clinic';
import type { Photo } from '@/content/photos';
import { getSupabase, hasBackend, MEDIA_LINK_SECONDS } from '@/lib/backend';
import { thumbnailUrl } from '@/lib/video-links';

/**
 * Content the clinic team publishes from the staff area (articles, before/after cases,
 * gallery photos and videos). Public, read-only queries; RLS only returns published rows. Each
 * hook returns an empty list without a backend, and pages fall back to their defaults.
 */

export type Article = Database['public']['Tables']['articles']['Row'];

type Client = NonNullable<Awaited<ReturnType<typeof getSupabase>>>;

/**
 * Signed, expiring links for stored media (the bucket is private). The server only signs
 * files that belong to published content, so drafts and withdrawn cases stay unreachable.
 * Missing or refused paths map to ''.
 */
async function signMedia(supabase: Client, paths: (string | null | undefined)[]) {
  const wanted = [...new Set(paths.filter((path): path is string => !!path))];
  const links = new Map<string, string>();
  if (!wanted.length) return links;
  const { data } = await supabase.storage
    .from('media')
    .createSignedUrls(wanted, MEDIA_LINK_SECONDS);
  for (const item of data ?? [])
    if (item.path && item.signedUrl) links.set(item.path, item.signedUrl);
  return links;
}

/** Refetch a little before signed links expire, so images never break mid-visit. */
const MEDIA_STALE_MS = (MEDIA_LINK_SECONDS - 10 * 60) * 1000;

/** A stored image (already signed) as a Photo (single WebP; no AVIF variant). */
export const storedPhoto = (link: string, alt: string, width = 1600, height = 1200): Photo => ({
  avif: '',
  webp: link,
  fallback: link,
  width,
  height,
  alt,
});

export function useArticles() {
  return useQuery({
    queryKey: ['articles', 'list'],
    enabled: hasBackend,
    staleTime: MEDIA_STALE_MS,
    refetchInterval: MEDIA_STALE_MS,
    queryFn: async () => {
      const supabase = (await getSupabase())!;
      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, kind, title, excerpt, cover_path, cover_alt, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      const links = await signMedia(
        supabase,
        data.map((row) => row.cover_path),
      );
      return data.map((row) => ({ ...row, cover_url: links.get(row.cover_path ?? '') ?? '' }));
    },
  });
}

export function useArticle(slug: string | undefined) {
  return useQuery({
    queryKey: ['articles', 'one', slug],
    enabled: hasBackend && !!slug,
    staleTime: MEDIA_STALE_MS,
    refetchInterval: MEDIA_STALE_MS,
    queryFn: async () => {
      const supabase = (await getSupabase())!;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug!)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw error;
      if (!data) return data;
      const links = await signMedia(supabase, [data.cover_path]);
      return { ...data, cover_url: links.get(data.cover_path ?? '') ?? '' };
    },
  });
}

/** Published before/after cases (optionally for one treatment), as ResultCases. */
export function useLiveResults(treatment?: string) {
  return useQuery({
    queryKey: ['results', treatment ?? 'all'],
    enabled: hasBackend,
    staleTime: MEDIA_STALE_MS,
    refetchInterval: MEDIA_STALE_MS,
    queryFn: async (): Promise<ResultCase[]> => {
      const supabase = (await getSupabase())!;
      let query = supabase
        .from('result_cases')
        .select('id, treatment_slug, title, before_path, after_path')
        .eq('published', true)
        .order('sort')
        .order('created_at', { ascending: false });
      if (treatment) query = query.eq('treatment_slug', treatment);
      const { data, error } = await query;
      if (error) throw error;
      const links = await signMedia(
        supabase,
        data.flatMap((row) => [row.before_path, row.after_path]),
      );
      // A case shows only when both of its photos could be signed.
      return data
        .filter((row) => links.has(row.before_path) && links.has(row.after_path))
        .map((row) => ({
          id: row.id,
          treatment: row.treatment_slug,
          title: row.title,
          photo: storedPhoto(links.get(row.after_path)!, `After: ${row.title}`),
          before: storedPhoto(links.get(row.before_path)!, `Before: ${row.title}`),
          beforeFilter: '',
          demo: false,
        }));
    },
  });
}

/** Published gallery photos and videos, in the team's order. */
export function useLiveGallery() {
  return useQuery({
    queryKey: ['gallery'],
    enabled: hasBackend,
    staleTime: MEDIA_STALE_MS,
    refetchInterval: MEDIA_STALE_MS,
    queryFn: async (): Promise<GalleryEntry[]> => {
      const supabase = (await getSupabase())!;
      const { data, error } = await supabase
        .from('gallery_items')
        .select('id, kind, image_path, video_id, alt, width, height')
        .eq('published', true)
        .order('sort')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const links = await signMedia(
        supabase,
        data.map((row) => row.image_path),
      );
      return data.flatMap((row): GalleryEntry[] => {
        if ((row.kind === 'youtube' || row.kind === 'drive') && row.video_id) {
          const video = { provider: row.kind, id: row.video_id } as const;
          const still = thumbnailUrl(video);
          return [
            {
              avif: '',
              webp: still,
              fallback: still,
              width: 1600,
              height: 900,
              alt: row.alt,
              video,
            },
          ];
        }
        const link = row.image_path ? links.get(row.image_path) : undefined;
        return link ? [storedPhoto(link, row.alt, row.width ?? 1600, row.height ?? 1200)] : [];
      });
    },
  });
}
