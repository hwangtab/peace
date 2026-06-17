import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from './supabaseConfig';
import type {
  ArchiveGalleryImageRow,
  ArchivePressItemRow,
  ArchiveVideoRow,
  CmsContentBlock,
} from '@/types/cms';
import type { GalleryImage } from '@/types/gallery';
import type { PressItem } from '@/types/press';
import type { VideoItem } from '@/types/video';
import { loadGalleryImages, loadLocalizedData } from '@/utils/dataLoader';
import {
  mapGalleryRowToItem,
  mapPressRowToItem,
  mapVideoRowToItem,
  toContentMap,
} from './adminArchive';
import type { SiteContentMap } from '@/types/cms';

export type ArchiveSource = 'cms' | 'static';

export interface ArchiveLoadResult<T> {
  source: ArchiveSource;
  items: T[];
}

let publicClient: SupabaseClient | null | undefined;

const getPublicClient = (): SupabaseClient | null => {
  if (publicClient !== undefined) return publicClient;

  const config = getSupabasePublicConfig();
  publicClient = config
    ? createClient(config.url, config.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
  return publicClient;
};

const isMissingTableError = (error: { code?: string; message?: string } | null) =>
  !!error &&
  (error.code === '42P01' ||
    error.message?.includes('does not exist') ||
    error.message?.includes('Could not find the table') ||
    error.message?.includes('schema cache'));

export const loadPublishedVideos = async (locale = 'ko'): Promise<ArchiveLoadResult<VideoItem>> => {
  const client = getPublicClient();
  if (client) {
    const { data, error } = await client
      .from('archive_videos')
      .select('*')
      .eq('status', 'published')
      .eq('locale', locale)
      .order('sort_order', { ascending: true })
      .order('date', { ascending: false });

    if (!error && data && data.length > 0) {
      return { source: 'cms', items: (data as ArchiveVideoRow[]).map(mapVideoRowToItem) };
    }

    if (error && !isMissingTableError(error)) {
      console.warn('[archive-cms] video fetch failed:', error.message);
    }
  }

  return {
    source: 'static',
    items: loadLocalizedData<VideoItem>(locale, 'videos.json'),
  };
};

export const loadPublishedPress = async (locale = 'ko'): Promise<ArchiveLoadResult<PressItem>> => {
  const client = getPublicClient();
  if (client) {
    const { data, error } = await client
      .from('archive_press_items')
      .select('*')
      .eq('status', 'published')
      .eq('locale', locale)
      .order('sort_order', { ascending: true })
      .order('date', { ascending: false });

    if (!error && data && data.length > 0) {
      return { source: 'cms', items: (data as ArchivePressItemRow[]).map(mapPressRowToItem) };
    }

    if (error && !isMissingTableError(error)) {
      console.warn('[archive-cms] press fetch failed:', error.message);
    }
  }

  return {
    source: 'static',
    items: loadLocalizedData<PressItem>(locale, 'press.json'),
  };
};

export const loadPublishedGallery = async (
  locale = 'ko'
): Promise<ArchiveLoadResult<GalleryImage>> => {
  const client = getPublicClient();
  if (client) {
    const { data, error } = await client
      .from('archive_gallery_images')
      .select('*')
      .eq('status', 'published')
      .eq('locale', locale)
      .order('sort_order', { ascending: true })
      .order('event_year', { ascending: false });

    if (!error && data && data.length > 0) {
      return { source: 'cms', items: (data as ArchiveGalleryImageRow[]).map(mapGalleryRowToItem) };
    }

    if (error && !isMissingTableError(error)) {
      console.warn('[archive-cms] gallery fetch failed:', error.message);
    }
  }

  return {
    source: 'static',
    items: loadGalleryImages<GalleryImage>(),
  };
};

export const loadSiteContentMap = async (
  locale: string,
  routePath: string
): Promise<SiteContentMap> => {
  const client = getPublicClient();
  if (!client) return {};

  const { data, error } = await client
    .from('cms_content_blocks')
    .select('*')
    .eq('status', 'published')
    .eq('locale', locale)
    .eq('route_path', routePath)
    .order('sort_order', { ascending: true });

  if (error) {
    if (!isMissingTableError(error)) {
      console.warn('[archive-cms] content fetch failed:', error.message);
    }
    return {};
  }

  return toContentMap((data ?? []) as CmsContentBlock[]);
};
