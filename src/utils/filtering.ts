type EventType = 'album' | 'camp';

interface FilterableItem {
  eventType?: EventType | string;
  eventYear?: number;
}

type FilterId = 'all' | 'album-2024' | 'camp-2023' | 'camp-2025';

export const VALID_FILTERS: FilterId[] = ['all', 'album-2024', 'camp-2023', 'camp-2025'];

const filterMap: Record<string, { type: string; year: number }> = {
  'album-2024': { type: 'album', year: 2024 },
  'camp-2023': { type: 'camp', year: 2023 },
  'camp-2025': { type: 'camp', year: 2025 },
};

/**
 * 이벤트 타입과 연도로 아이템 필터링
 * @param items 필터링할 아이템 배열
 * @param filter 필터 ID ('all', 'album-2024', 'camp-2023', 'camp-2025')
 * @returns 필터링된 아이템 배열
 */
export const filterByEvent = <T extends FilterableItem>(
  items: T[],
  filter: string
): T[] => {
  if (filter === 'all') return items;

  const config = filterMap[filter];
  if (!config) return items;

  return items.filter(
    item => item.eventType === config.type && item.eventYear === config.year
  );
};

/**
 * 유효한 필터 ID인지 검증
 * @param filter 검증할 필터 문자열
 * @returns 유효한 필터 ID인 경우 true
 */
export const isValidFilter = (filter: string): filter is FilterId => {
  return VALID_FILTERS.includes(filter as FilterId);
};
