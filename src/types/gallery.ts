import { EventType } from './event';

export interface GalleryImage {
  id: number;
  url: string;
  description?: string;
  eventType: EventType; // 'camp' or 'album'
  eventYear: number; // 2023, 2024, 2025, etc.
  /** 촬영 작가 slug — src/data/photographers.ts 의 Photographer.slug 와 매칭 */
  photographer?: string;
}

export type GalleryImages = GalleryImage[];
