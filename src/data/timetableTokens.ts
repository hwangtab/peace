import type { Weekday } from '@/components/camp/timetable/types';

/**
 * Per-weekday visual tokens for the timetable.
 *
 * Each weekday carries its own "mood" — Friday evening ocean, Saturday high
 * ocean, Sunday sunset — and these tokens drive:
 *  - the active tab gradient
 *  - the vertical rail next to act cards
 *  - the subtle panel tint behind the day view
 *  - the accent color of time text inside each act card
 *  - the hairline rule between start/end times on each act card
 *
 * Keeping them here (instead of inside `<CampTimetable>`) means future
 * camp years can reuse the same palette without copying the object.
 *
 * NOTE: class strings must be spelled out literally — Tailwind's JIT
 * compiler cannot infer classes from dynamic string concatenation.
 */
export interface DayMood {
  /** Gradient for the currently-selected day tab */
  activeTab: string;
  /** Vertical rail running next to the day's act cards */
  rail: string;
  /** Soft tint painted behind the day view */
  panelTint: string;
  /** Start/end time color inside each act card */
  accentTime: string;
  /** Hairline between start and end times inside each act card */
  accentRule: string;
}

export const DAY_MOOD: Record<Weekday, DayMood> = {
  fri: {
    activeTab: 'bg-gradient-to-br from-jeju-ocean to-deep-ocean text-white',
    rail: 'bg-gradient-to-b from-jeju-ocean to-deep-ocean',
    panelTint: 'bg-gradient-to-b from-seafoam/10 via-transparent to-transparent',
    accentTime: 'text-jeju-ocean',
    accentRule: 'bg-jeju-ocean/30',
  },
  sat: {
    activeTab: 'bg-ocean-gradient text-white',
    rail: 'bg-ocean-gradient',
    panelTint: 'bg-gradient-to-b from-seafoam/20 via-transparent to-transparent',
    accentTime: 'text-ocean-mist',
    accentRule: 'bg-ocean-mist/30',
  },
  sun: {
    activeTab: 'bg-sunset-gradient text-white',
    rail: 'bg-sunset-gradient',
    panelTint: 'bg-gradient-to-b from-golden-sun/10 via-transparent to-transparent',
    accentTime: 'text-sunset-coral',
    accentRule: 'bg-sunset-coral/30',
  },
};
