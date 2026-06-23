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
import { mergeArchiveRowsWithStatic } from './archiveContract';
import { getSupabasePublicClient } from './supabasePublicClient';
import type { SiteContentMap } from '@/types/cms';

export type ArchiveSource = 'cms' | 'static';

export interface ArchiveLoadResult<T> {
  source: ArchiveSource;
  items: T[];
}

const isMissingTableError = (error: { code?: string; message?: string } | null) =>
  !!error &&
  (error.code === '42P01' ||
    error.message?.includes('does not exist') ||
    error.message?.includes('Could not find the table') ||
    error.message?.includes('schema cache'));

export const loadPublishedVideos = async (locale = 'ko'): Promise<ArchiveLoadResult<VideoItem>> => {
  const staticItems = loadLocalizedData<VideoItem>(locale, 'videos.json', { mergeByIdKey: 'id' });
  const client = getSupabasePublicClient();
  if (client) {
    const { data, error } = await client
      .from('archive_videos')
      .select('*')
      .eq('locale', locale)
      .order('sort_order', { ascending: true })
      .order('date', { ascending: false });

    if (!error && data && data.length > 0) {
      return {
        source: 'cms',
        items: mergeArchiveRowsWithStatic(
          data as ArchiveVideoRow[],
          staticItems,
          mapVideoRowToItem,
          (item) => item.id
        ),
      };
    }

    if (error && !isMissingTableError(error)) {
      console.warn('[archive-cms] video fetch failed:', error.message);
    }
  }

  return {
    source: 'static',
    items: staticItems,
  };
};

export const loadPublishedPress = async (locale = 'ko'): Promise<ArchiveLoadResult<PressItem>> => {
  const staticItems = loadLocalizedData<PressItem>(locale, 'press.json');
  const client = getSupabasePublicClient();
  if (client) {
    const { data, error } = await client
      .from('archive_press_items')
      .select('*')
      .eq('locale', locale)
      .order('sort_order', { ascending: true })
      .order('date', { ascending: false });

    if (!error && data && data.length > 0) {
      return {
        source: 'cms',
        items: mergeArchiveRowsWithStatic(
          data as ArchivePressItemRow[],
          staticItems,
          mapPressRowToItem,
          (item) => item.id
        ),
      };
    }

    if (error && !isMissingTableError(error)) {
      console.warn('[archive-cms] press fetch failed:', error.message);
    }
  }

  return {
    source: 'static',
    items: staticItems,
  };
};

export const loadPublishedGallery = async (
  locale = 'ko'
): Promise<ArchiveLoadResult<GalleryImage>> => {
  const staticItems = loadGalleryImages<GalleryImage>();
  const client = getSupabasePublicClient();
  if (client) {
    const { data, error } = await client
      .from('archive_gallery_images')
      .select('*')
      .eq('locale', locale)
      .order('sort_order', { ascending: true })
      .order('event_year', { ascending: false });

    if (!error && data && data.length > 0) {
      return {
        source: 'cms',
        items: mergeArchiveRowsWithStatic(
          data as ArchiveGalleryImageRow[],
          staticItems,
          mapGalleryRowToItem,
          (item) => item.id
        ),
      };
    }

    if (error && !isMissingTableError(error)) {
      console.warn('[archive-cms] gallery fetch failed:', error.message);
    }
  }

  return {
    source: 'static',
    items: staticItems,
  };
};

export const loadSiteContentMap = async (
  locale: string,
  routePath: string
): Promise<SiteContentMap> => {
  const client = getSupabasePublicClient();
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
