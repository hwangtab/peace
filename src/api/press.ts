import { fetchLocalizedData } from './client';
import { PressItem } from '../types/press';

// Default event year for items without a specified year
// Set to 2024 as the project start year
const DEFAULT_EVENT_YEAR = 2024;

export const normalizePressItems = (items: PressItem[]): PressItem[] =>
  items.map((item) => ({
    ...item,
    eventType: item.eventType ?? 'album',
    eventYear: item.eventYear ?? DEFAULT_EVENT_YEAR,
  }));

export async function getPressItems(language?: string): Promise<PressItem[]> {
  const items = await fetchLocalizedData<PressItem>('/data/press.json', language);
  return normalizePressItems(items);
}
