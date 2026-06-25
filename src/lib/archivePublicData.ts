import type { ArchiveGalleryImageRow, ArchivePressItemRow, ArchiveVideoRow } from '@/types/cms';
import type { GalleryImage } from '@/types/gallery';
import type { PressItem } from '@/types/press';
import type { VideoItem } from '@/types/video';
import { loadGalleryImages, loadLocalizedData } from '@/utils/dataLoader';
import { mapGalleryRowToItem, mapPressRowToItem, mapVideoRowToItem } from './adminArchive';
import { mergeArchiveRowsWithStatic } from './archiveContract';
import { getSupabasePublicClient } from './supabasePublicClient';

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
      const merged = mergeArchiveRowsWithStatic(
        data as ArchiveGalleryImageRow[],
        staticItems,
        mapGalleryRowToItem,
        (item) => item.id
      );
      // CMS 와 정적 데이터에 같은 이미지가 서로 다른 id 로 중복 등록되어 있어도
      // merge 는 id 기준으로만 dedup 한다. 갤러리는 url 이 실질 식별자이므로
      // 같은 url 은 한 번만 노출하도록 추가로 dedup 한다(화면 중복·React key 충돌 방지).
      const seenUrls = new Set<string>();
      const items = merged.filter((item) => {
        if (!item.url) return true;
        if (seenUrls.has(item.url)) return false;
        seenUrls.add(item.url);
        return true;
      });
      return { source: 'cms', items };
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
