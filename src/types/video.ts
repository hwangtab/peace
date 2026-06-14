import { EventType } from './event';

export interface VideoItem {
  id: number;
  title: string;
  description: string;
  youtubeUrl: string;
  date: string;
  location: string;
  eventType?: EventType;
  eventYear?: number;
  thumbnailUrl?: string;
  duration?: string;
  musicianIds?: number[];
  /** 영상 감독(연출) 뮤지션 id — 출연(musicianIds)과 별개로 제작 크레딧 */
  directorMusicianId?: number;
}
