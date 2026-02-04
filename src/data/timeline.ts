export interface TimelineEvent {
  id: string;
  year: number;
  month?: number;
  date?: string;
  titleKey: string;
  descriptionKey: string;
  locationKey?: string;
  eventType: 'camp' | 'album' | 'milestone';
  imageUrl?: string;
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'camp-2023',
    year: 2023,
    month: 6,
    date: '2023-06-10',
    titleKey: 'timeline.events.camp_2023.title',
    descriptionKey: 'timeline.events.camp_2023.desc',
    locationKey: 'timeline.events.camp_2023.location',
    eventType: 'camp'
  },
  {
    id: 'album-2024',
    year: 2024,
    month: 11,
    date: '2024-11-02',
    titleKey: 'timeline.events.album_2024.title',
    descriptionKey: 'timeline.events.album_2024.desc',
    locationKey: 'timeline.events.album_2024.location',
    eventType: 'album'
  },
  {
    id: 'camp-2025',
    year: 2025,
    month: 6,
    date: '2025-06-14',
    titleKey: 'timeline.events.camp_2025.title',
    descriptionKey: 'timeline.events.camp_2025.desc',
    locationKey: 'timeline.events.camp_2025.location',
    eventType: 'camp'
  },
  {
    id: 'camp-2026',
    year: 2026,
    month: 6,
    titleKey: 'timeline.events.camp_2026.title',
    descriptionKey: 'timeline.events.camp_2026.desc',
    locationKey: 'timeline.events.camp_2026.location',
    eventType: 'camp'
  }
];
