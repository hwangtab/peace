import { EventType } from './event';

export interface GalleryImage {
  id: number;
  url: string;
  description?: string;
  eventType?: EventType; // 'camp' or 'album'
  eventYear?: number; // 2023, 2024, 2025, etc.
}

export type GalleryImages = GalleryImage[];
