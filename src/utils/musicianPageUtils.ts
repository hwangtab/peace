import { Musician } from '@/types/musician';
import { VideoItem } from '@/types/video';
import { loadLocalizedData } from '@/utils/dataLoader';
import { seededHash } from '@/utils/hash';

/**
 * Load related videos for a musician.
 * Uses KO videos.json for musicianIds matching (en subset may lack musicianIds),
 * then overlays localized video data.
 */
export function loadRelatedVideos(
  musicianId: number,
  locale: string,
  options?: { includeEventVideos?: boolean; events?: string[] }
): VideoItem[] {
  const koVideos = loadLocalizedData<VideoItem>('ko', 'videos.json');
  const localizedVideos = loadLocalizedData<VideoItem>(locale, 'videos.json');
  const localizedVideoMap = new Map(localizedVideos.map((v) => [v.id, v]));

  const directVideos = koVideos.filter((v) => v.musicianIds?.includes(musicianId));

  let eventVideos: VideoItem[] = [];
  if (options?.includeEventVideos && options.events?.length) {
    eventVideos = koVideos.filter(
      (v) =>
        v.eventType &&
        v.eventYear &&
        options.events!.includes(`${v.eventType}-${v.eventYear}`) &&
        !directVideos.some((dv) => dv.id === v.id)
    );
  }

  return [...directVideos, ...eventVideos].map(
    (v) => localizedVideoMap.get(v.id) ?? v
  );
}

/**
 * Select other musicians using seeded hash shuffle.
 * Callers must pre-filter candidates to exclude the current musician.
 */
export function selectOtherMusicians(
  currentId: number,
  candidates: Musician[],
  count = 6
): Musician[] {
  return [...candidates]
    .sort((a, b) => seededHash(a.id, currentId) - seededHash(b.id, currentId))
    .slice(0, count);
}
