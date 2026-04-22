export type ActType = 'performance' | 'transition';
export type Scale = 'solo' | 'band' | 'big-band' | 'ensemble';

export interface TimetableAct {
  order: number | null;
  start: string;
  end: string;
  type: ActType;
  name: string;
  scale?: Scale;
  musicianIds?: number[];
  transitionMinutes?: number;
  nextActName?: string;
}

export type Weekday = 'fri' | 'sat' | 'sun';

export interface TimetableDay {
  date: string;
  dayLabel: string;
  weekday: Weekday;
  teamCount: number;
  startTime: string;
  endTime: string;
  acts: TimetableAct[];
}

export interface Timetable {
  year: number;
  days: TimetableDay[];
}
