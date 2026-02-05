import { fetchLocalizedData } from './client';
import { PressItem } from '../types/press';

const applyDefaults = (items: PressItem[]) =>
  items.map((item) => ({
    ...item,
    eventType: item.eventType ?? 'album',
    eventYear: item.eventYear ?? 2024,
  }));

export async function getPressItems(language?: string): Promise<PressItem[]> {
  const items = await fetchLocalizedData<PressItem>('/data/press.json', language);
  return applyDefaults(items);
}
