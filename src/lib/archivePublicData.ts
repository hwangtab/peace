import type { GalleryImage } from '@/types/gallery';
import type { PressItem } from '@/types/press';
import type { VideoItem } from '@/types/video';
import { loadGalleryImages, loadLocalizedData } from '@/utils/dataLoader';

export type ArchiveSource = 'cms' | 'static';

export interface ArchiveLoadResult<T> {
  source: ArchiveSource;
  items: T[];
}

// videos/press/gallery 는 모두 정적 json(public/data/**)을 단일 출처(SSOT)로 사용한다.
// 과거엔 요청/ISR 재생성마다 Supabase(archive_videos·archive_press_items)를 조회해
// 전체 목록을 병합했는데, /videos/[id](~1,870개 변형)·사이트맵 크롤링이 이 조회를
// 백만 건 단위로 반복해 무료티어 egress 를 소진(사이트 402 장애)시켰다. CMS 레이어를
// 제거해 런타임 Supabase 조회를 없앤다(egress 0). 콘텐츠 갱신은 정적 json 을 수정·커밋
// (또는 CMS→정적 재동기화 스크립트)으로 반영한다. 관리자 CMS 편집은 공개 사이트에
// 더는 자동 반영되지 않는다. 참조: [[project_supabase_egress]] [[project_gallery_static_ssot]]

export const loadPublishedVideos = async (locale = 'ko'): Promise<ArchiveLoadResult<VideoItem>> => ({
  source: 'static',
  items: loadLocalizedData<VideoItem>(locale, 'videos.json', { mergeByIdKey: 'id' }),
});

export const loadPublishedPress = async (locale = 'ko'): Promise<ArchiveLoadResult<PressItem>> => ({
  source: 'static',
  items: loadLocalizedData<PressItem>(locale, 'press.json'),
});

export const loadPublishedGallery = async (
  _locale = 'ko'
): Promise<ArchiveLoadResult<GalleryImage>> => ({
  source: 'static',
  items: loadGalleryImages<GalleryImage>(),
});
