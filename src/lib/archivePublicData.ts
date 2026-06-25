import type { ArchivePressItemRow, ArchiveVideoRow } from '@/types/cms';
import type { GalleryImage } from '@/types/gallery';
import type { PressItem } from '@/types/press';
import type { VideoItem } from '@/types/video';
import { loadGalleryImages, loadLocalizedData } from '@/utils/dataLoader';
import { mapPressRowToItem, mapVideoRowToItem } from './adminArchive';
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
  _locale = 'ko'
): Promise<ArchiveLoadResult<GalleryImage>> => {
  // 갤러리는 정적 json(public/data/gallery/*, 이미지 폴더 스캔으로 자동 생성)을
  // 단일 출처(SSOT)로 사용한다. CMS(archive_gallery_images)는 정적의 부분집합이라
  // 고유 데이터가 없고(stale), public_id 합성값이 런타임 merge 의 원본 id 와
  // 영원히 불일치해 같은 이미지가 중복 노출(React key 충돌)되던 원인이었다.
  // → CMS 갤러리 레이어 제거. videos/press 는 기존 CMS 병합 유지.
  return {
    source: 'static',
    items: loadGalleryImages<GalleryImage>(),
  };
};
