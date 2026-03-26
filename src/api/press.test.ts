import { PressItem } from '@/types/press';
import { normalizePressItems } from './press';

describe('normalizePressItems', () => {
  test('fills missing event metadata with album 2024 defaults', () => {
    const input: PressItem[] = [
      {
        id: 1,
        title: 'Article',
        publisher: 'Publisher',
        date: '2024-10-10',
        url: 'https://example.com',
        description: 'Description',
      },
    ];

    const [item] = normalizePressItems(input);

    expect(item?.eventType).toBe('album');
    expect(item?.eventYear).toBe(2024);
  });

  test('preserves explicit event metadata when present', () => {
    const input: PressItem[] = [
      {
        id: 30,
        title: 'Camp Article',
        publisher: 'Publisher',
        date: '2025-06-13',
        url: 'https://example.com/camp',
        description: 'Description',
        eventType: 'camp',
        eventYear: 2025,
      },
    ];

    const [item] = normalizePressItems(input);

    expect(item?.eventType).toBe('camp');
    expect(item?.eventYear).toBe(2025);
  });
});
