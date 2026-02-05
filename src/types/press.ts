import { EventType } from './event';

export interface PressItem {
  id: number;
  title: string;
  publisher: string;
  date: string;
  url: string;
  description: string;
  imageUrl?: string;
  eventType?: EventType;
  eventYear?: number;
}
