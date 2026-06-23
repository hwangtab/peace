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
  /** 뮤지션이 아닌 외부 영상감독 이름 — directorMusicianId가 없을 때 이름만 크레딧 표시 */
  directorName?: string;
}
