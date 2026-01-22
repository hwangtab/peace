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
}
