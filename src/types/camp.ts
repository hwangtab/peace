/**
 * Camp-specific types for Peace & Music Camp events
 */

import { Event } from './event';

export interface Participant {
  name: string;
  musicianId?: number;
}

export interface StaffSection {
  role: string;
  members: string[];
}

export interface CampEvent extends Event {
  eventType: 'camp';
  location: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  slogan?: string;
  participants?: (string | Participant)[]; // musician names or objects
  staff?: StaffSection[]; // staff information by role
  collaborators?: string[]; // collaborating organizations
  images: string[]; // image URLs
  description: string;
  shortDescription?: string;
}

export type CampEvents = CampEvent[];
