import type { Database } from '@quantam/supabase';
import { useQuery } from '@tanstack/react-query';

import type { ResultCase } from '@/content/clinic';
import type { Photo } from '@/content/photos';
import { supabase } from '@/lib/supabase';

/**
 * Content the clinic team publishes from the staff area (articles, before/after cases,
 * gallery photos). Public, read-only queries; RLS only returns published rows. Each
 * hook returns an empty list without a backend, and pages fall back to their defaults.
 */

export type Article = Database['public']['Tables']['articles']['Row'];

const publicUrl = (path: string) =>
  supabase ? supabase.storage.from('media').getPublicUrl(path).data.publicUrl : '';

/** A stored image as a Photo (single WebP; no AVIF variant). */
export const storedPhoto = (path: string, alt: string, width = 1600, height = 1200): Photo => ({
  avif: '',
  webp: publicUrl(path),
  fallback: publicUrl(path),
  width,
  height,
  alt,
});

export function useArticles() {
  return useQuery({
    queryKey: ['articles', 'list'],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from('articles')
        .select('id, slug, kind, title, excerpt, cover_path, cover_alt, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useArticle(slug: string | undefined) {
  return useQuery({
    queryKey: ['articles', 'one', slug],
    enabled: !!supabase && !!slug,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from('articles')
        .select('*')
        .eq('slug', slug!)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** Published before/after cases (optionally for one treatment), as ResultCases. */
export function useLiveResults(treatment?: string) {
  return useQuery({
    queryKey: ['results', treatment ?? 'all'],
    enabled: !!supabase,
    queryFn: async (): Promise<ResultCase[]> => {
      let query = supabase!
        .from('result_cases')
        .select('id, treatment_slug, title, before_path, after_path')
        .eq('published', true)
        .order('sort')
        .order('created_at', { ascending: false });
      if (treatment) query = query.eq('treatment_slug', treatment);
      const { data, error } = await query;
      if (error) throw error;
      return data.map((row) => ({
        id: row.id,
        treatment: row.treatment_slug,
        title: row.title,
        photo: storedPhoto(row.after_path, `After: ${row.title}`),
        before: storedPhoto(row.before_path, `Before: ${row.title}`),
        beforeFilter: '',
        demo: false,
      }));
    },
  });
}

/** Published gallery photos, in the team's order. */
export function useLiveGallery() {
  return useQuery({
    queryKey: ['gallery'],
    enabled: !!supabase,
    queryFn: async (): Promise<Photo[]> => {
      const { data, error } = await supabase!
        .from('gallery_items')
        .select('id, image_path, alt, width, height')
        .eq('published', true)
        .order('sort')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map((row) =>
        storedPhoto(row.image_path, row.alt, row.width ?? 1600, row.height ?? 1200),
      );
    },
  });
}
