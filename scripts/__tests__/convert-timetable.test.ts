import {
  mapScale,
  normalizeName,
  parseTransitionMinutes,
  parseRow,
} from '../convert-timetable';

describe('mapScale', () => {
  test.each([
    ['솔로/듀오', 'solo'],
    ['밴드(1인)', 'solo'],
    ['밴드(2인)', 'solo'],
    ['밴드(3-4인)', 'band'],
    ['밴드(5인+)', 'big-band'],
    ['밴드(다수)', 'ensemble'],
  ])('maps %s to %s', (input, expected) => {
    expect(mapScale(input)).toBe(expected);
  });

  test('returns undefined for unknown', () => {
    expect(mapScale('모름')).toBeUndefined();
  });
});

describe('normalizeName', () => {
  test('trims and removes extra spaces', () => {
    expect(normalizeName('  윤선애  ')).toBe('윤선애');
    expect(normalizeName('블로꾸  자파리')).toBe('블로꾸 자파리');
  });

  test('preserves unicode', () => {
    expect(normalizeName('최상돈 × 김강곤')).toBe('최상돈 × 김강곤');
  });
});

describe('parseTransitionMinutes', () => {
  test('extracts minutes from transition label', () => {
    expect(parseTransitionMinutes('⟶ 5분 (다음: ...)')).toBe(5);
    expect(parseTransitionMinutes('⟶ 10분 (다음: ...)')).toBe(10);
  });

  test('returns null when no pattern', () => {
    expect(parseTransitionMinutes('something else')).toBeNull();
  });
});

describe('parseRow', () => {
  const lookup = new Map<string, number>([
    ['윤선애', 40],
    ['최상돈 × 김강곤', 48],
  ]);

  test('parses a performance row', () => {
    const row = ['6/5(금)', 3, '18:00', '18:25', '공연', '윤선애', 'rider', '솔로/듀오', 1, 'note'];
    expect(parseRow(row, lookup)).toEqual({
      order: 3,
      start: '18:00',
      end: '18:25',
      type: 'performance',
      name: '윤선애',
      scale: 'solo',
      musicianIds: [40],
    });
  });

  test('parses a transition row', () => {
    const row = ['6/5(금)', null, '18:25', '18:30', '전환', '⟶ 5분 (다음: HANASH - 솔로/듀오)', null, null, null, null];
    expect(parseRow(row, lookup)).toEqual({
      order: null,
      start: '18:25',
      end: '18:30',
      type: 'transition',
      name: '⟶ 5분 (다음: HANASH - 솔로/듀오)',
      transitionMinutes: 5,
      nextActName: 'HANASH',
    });
  });

  test('returns null for empty rows', () => {
    expect(parseRow([null, null, null, null, null, null, null, null, null, null], lookup)).toBeNull();
  });

  test('performance row with unknown name has no musicianIds', () => {
    const row = ['6/5(금)', 5, '13:00', '13:25', '공연', '불가사리 즉흥세션', 'X', '솔로/듀오', 0, ''];
    const result = parseRow(row, lookup);
    expect(result?.musicianIds).toBeUndefined();
  });
});
