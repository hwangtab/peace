/**
 * Event Type System for Multi-Event Platform
 * Supports camps and album projects across different years
 */

export type EventType = 'camp' | 'album';

export interface BaseEvent {
  id: string;
  eventType: EventType;
  year: number;
  title: string;
  description: string;
  date?: string; // ISO date string
}

export interface Event extends BaseEvent {
  imageUrl?: string;
  location?: string;
}
