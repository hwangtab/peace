/**
 * Camp-specific types for Peace & Music Camp events
 */

import { Event } from './event';

export interface CampEvent extends Event {
  eventType: 'camp';
  location: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  slogan?: string;
  participants?: string[]; // musician names
  images: string[]; // image URLs
  description: string;
  shortDescription?: string;
}

export type CampEvents = CampEvent[];
