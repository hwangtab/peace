import {
  buildAdminLocaleStatuses,
  filterAdminRows,
  getAdminPaginationRange,
  getAdminPreviewUrl,
  getAdminCollectionConfig,
  mapGalleryRowToItem,
  mergeAdminRowsById,
  mapPressRowToItem,
  mapVideoRowToItem,
  makePublishedAt,
  prepareAdminMissingLocaleClonePayloads,
  prepareAdminLocaleClonePayload,
  sanitizeAdminPayload,
  parseIsoDuration,
  composeIsoDuration,
  buildArchiveFilters,
  buildArchiveFacetOptions,
} from './adminArchive';
import type { AdminCollectionRow } from './adminArchive';
import type { ArchiveGalleryImageRow, ArchivePressItemRow, ArchiveVideoRow } from '@/types/cms';

const baseDates = {
  created_at: '2026-06-17T00:00:00.000Z',
  updated_at: '2026-06-17T00:00:00.000Z',
  published_at: '2026-06-17T00:00:00.000Z',
} as const;

test('normalizes admin video payload values from form strings', () => {
  const payload = sanitizeAdminPayload('videos', {
    public_id: '3001',
    locale: 'ko',
    title: '새 영상',
    description: '설명',
    youtube_url: 'https://www.youtube.com/watch?v=test',
    date: '2026-06-05',
    location: '강정',
    event_type: 'camp',
    event_year: '2026',
    musician_ids: '3, 11, 59',
    director_musician_id: '',
    status: 'published',
    sort_order: '',
  });

  expect(payload).toMatchObject({
    public_id: 3001,
    event_year: 2026,
    musician_ids: [3, 11, 59],
    director_musician_id: null,
    sort_order: 0,
  });
});

test('rejects unsupported locale, invalid dates, and invalid URLs', () => {
  expect(() =>
    sanitizeAdminPayload('videos', {
      public_id: '3001',
      locale: 'xx',
      title: '새 영상',
      youtube_url: 'https://www.youtube.com/watch?v=test',
      date: '2026-06-05',
      event_type: 'camp',
      event_year: '2026',
      status: 'published',
      sort_order: '0',
    })
  ).toThrow();

  expect(() =>
    sanitizeAdminPayload('press', {
      public_id: '10',
      locale: 'ko',
      title: '기사',
      publisher: '신문',
      date: '2026/06/05',
      source_url: 'not-a-url',
      event_type: 'camp',
      event_year: '2026',
      status: 'published',
      sort_order: '0',
    })
  ).toThrow();
});

test('maps archive rows to public page item contracts', () => {
  const video = mapVideoRowToItem({
    id: '00000000-0000-0000-0000-000000000001',
    public_id: 3001,
    locale: 'ko',
    title: '영상',
    description: '설명',
    youtube_url: 'https://www.youtube.com/embed/test',
    date: '2026-06-05',
    location: '강정',
    event_type: 'camp',
    event_year: 2026,
    thumbnail_url: null,
    duration: null,
    musician_ids: [1, 2],
    director_musician_id: null,
    status: 'published',
    sort_order: 0,
    ...baseDates,
  } satisfies ArchiveVideoRow);

  const gallery = mapGalleryRowToItem({
    id: '00000000-0000-0000-0000-000000000002',
    public_id: 2601,
    locale: 'ko',
    image_url: '/images-webp/camps/2026/photo.webp',
    description: null,
    event_type: 'camp',
    event_year: 2026,
    photographer: 'kdh',
    status: 'published',
    sort_order: 0,
    ...baseDates,
  } satisfies ArchiveGalleryImageRow);

  const press = mapPressRowToItem({
    id: '00000000-0000-0000-0000-000000000003',
    public_id: 100,
    locale: 'ko',
    title: '기사',
    publisher: '신문',
    date: '2026-06-10',
    source_url: 'https://example.com/article',
    description: '요약',
    image_url: null,
    event_type: 'camp',
    event_year: 2026,
    status: 'published',
    sort_order: 0,
    ...baseDates,
  } satisfies ArchivePressItemRow);

  expect(video).toMatchObject({ id: 3001, youtubeUrl: 'https://www.youtube.com/embed/test' });
  expect(gallery).toMatchObject({ id: 2601, url: '/images-webp/camps/2026/photo.webp' });
  expect(press).toMatchObject({ id: 100, url: 'https://example.com/article' });
  expect(Object.values(video).includes(undefined)).toBe(false);
  expect(Object.values(gallery).includes(undefined)).toBe(false);
  expect(Object.values(press).includes(undefined)).toBe(false);
});

test('published_at is preserved while an item remains published', () => {
  const previous = '2026-06-17T00:00:00.000Z';

  expect(makePublishedAt('published', previous)).toBe(previous);
  expect(makePublishedAt('draft', previous)).toBeNull();
  expect(makePublishedAt('hidden', previous)).toBeNull();
  expect(makePublishedAt('published', null)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
});

test('builds saved item preview urls for admin review', () => {
  const videos = getAdminCollectionConfig('videos');
  const gallery = getAdminCollectionConfig('gallery');
  const press = getAdminCollectionConfig('press');

  expect(videos && getAdminPreviewUrl(videos, { public_id: 12, locale: 'en' })).toBe(
    '/en/videos/12'
  );
  expect(gallery && getAdminPreviewUrl(gallery, { public_id: 34, locale: 'ko' })).toBe(
    '/ko/gallery'
  );
  expect(press && getAdminPreviewUrl(press, { public_id: 56, locale: 'fr' })).toBe('/fr/press');
  expect(videos && getAdminPreviewUrl(videos, { public_id: -1, locale: 'en' })).toBeNull();
});

test('filters admin rows by search query and status', () => {
  const videos = getAdminCollectionConfig('videos');
  expect(videos).not.toBeNull();
  if (!videos) return;

  const rows = [
    {
      id: '00000000-0000-0000-0000-000000000101',
      public_id: 101,
      title: '강정 평화 라이브',
      description: '캠프 현장 영상',
      status: 'published',
    },
    {
      id: '00000000-0000-0000-0000-000000000102',
      public_id: 102,
      title: 'Archive Draft',
      description: 'internal note',
      status: 'draft',
    },
    {
      id: '00000000-0000-0000-0000-000000000103',
      public_id: 103,
      title: 'Hidden Interview',
      description: 'private',
      status: 'hidden',
    },
  ] as unknown as AdminCollectionRow[];

  expect(filterAdminRows(rows, videos, { query: '평화', status: 'all' })).toHaveLength(1);
  expect(filterAdminRows(rows, videos, { query: '102', status: 'all' })).toHaveLength(1);
  expect(filterAdminRows(rows, videos, { query: '', status: 'draft' })).toEqual([rows[1]]);
  expect(filterAdminRows(rows, videos, { query: 'archive', status: 'published' })).toEqual([]);
});

test('prepares a draft clone payload for another locale without carrying row identity', () => {
  const videos = getAdminCollectionConfig('videos');
  expect(videos).not.toBeNull();
  if (!videos) return;

  const payload = prepareAdminLocaleClonePayload(
    videos,
    {
      id: '00000000-0000-0000-0000-000000000201',
      public_id: 201,
      locale: 'ko',
      title: '원본 제목',
      description: '원본 설명',
      youtube_url: 'https://www.youtube.com/watch?v=test',
      date: '2026-06-05',
      location: '강정',
      event_type: 'camp',
      event_year: 2026,
      thumbnail_url: null,
      duration: null,
      musician_ids: [1, 2],
      director_musician_id: null,
      status: 'published',
      sort_order: 0,
      created_at: '2026-06-17T00:00:00.000Z',
      updated_at: '2026-06-17T00:00:00.000Z',
      published_at: '2026-06-17T00:00:00.000Z',
    } satisfies ArchiveVideoRow,
    'en'
  );

  expect(payload).toMatchObject({
    public_id: 201,
    locale: 'en',
    title: '원본 제목',
    status: 'draft',
  });
  expect(payload).not.toHaveProperty('id');
  expect(payload).not.toHaveProperty('created_at');
  expect(payload).not.toHaveProperty('updated_at');
  expect(payload).not.toHaveProperty('published_at');
});

test('builds bounded admin pagination ranges', () => {
  expect(getAdminPaginationRange({ offset: 0, limit: 200 })).toEqual({
    from: 0,
    to: 199,
    limit: 200,
  });
  expect(getAdminPaginationRange({ offset: -10, limit: 0 })).toEqual({
    from: 0,
    to: 199,
    limit: 200,
  });
  expect(getAdminPaginationRange({ offset: 1000, limit: 5000 })).toEqual({
    from: 1000,
    to: 1999,
    limit: 1000,
  });
});

test('builds locale status coverage with missing locales', () => {
  const statuses = buildAdminLocaleStatuses([
    {
      id: '00000000-0000-0000-0000-000000000301',
      locale: 'ko',
      status: 'published',
      updated_at: '2026-06-17T00:00:00.000Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000302',
      locale: 'en',
      status: 'draft',
      updated_at: '2026-06-17T00:01:00.000Z',
    },
  ]);

  expect(statuses.find((item) => item.locale === 'ko')).toMatchObject({
    locale: 'ko',
    status: 'published',
    id: '00000000-0000-0000-0000-000000000301',
  });
  expect(statuses.find((item) => item.locale === 'en')).toMatchObject({
    locale: 'en',
    status: 'draft',
  });
  expect(statuses.find((item) => item.locale === 'ja')).toMatchObject({
    locale: 'ja',
    status: 'missing',
  });
});

test('prepares draft clone payloads only for missing locale statuses', () => {
  const videos = getAdminCollectionConfig('videos');
  expect(videos).not.toBeNull();
  if (!videos) return;

  const source = {
    id: '00000000-0000-0000-0000-000000000401',
    public_id: 401,
    locale: 'ko',
    title: '원본 제목',
    description: '원본 설명',
    youtube_url: 'https://www.youtube.com/watch?v=test',
    date: '2026-06-05',
    location: '강정',
    event_type: 'camp',
    event_year: 2026,
    thumbnail_url: null,
    duration: null,
    musician_ids: [1, 2],
    director_musician_id: null,
    status: 'published',
    sort_order: 0,
    created_at: '2026-06-17T00:00:00.000Z',
    updated_at: '2026-06-17T00:00:00.000Z',
    published_at: '2026-06-17T00:00:00.000Z',
  } satisfies ArchiveVideoRow;

  const payloads = prepareAdminMissingLocaleClonePayloads(videos, source, [
    {
      locale: 'ko',
      status: 'published',
      id: source.id,
      updated_at: source.updated_at,
      published_at: source.published_at,
    },
    {
      locale: 'en',
      status: 'draft',
      id: '00000000-0000-0000-0000-000000000402',
      updated_at: source.updated_at,
      published_at: null,
    },
    { locale: 'ja', status: 'missing', id: null, updated_at: null, published_at: null },
    { locale: 'fr', status: 'missing', id: null, updated_at: null, published_at: null },
  ]);

  expect(payloads).toHaveLength(2);
  expect(payloads.map((payload) => payload.locale)).toEqual(['ja', 'fr']);
  expect(payloads.every((payload) => payload.status === 'draft')).toBe(true);
  expect(payloads.every((payload) => !('id' in payload))).toBe(true);
});

test('merges admin rows by id while preserving first occurrence order', () => {
  const rows = [
    { id: 'a', title: 'A' },
    { id: 'b', title: 'B' },
  ] as unknown as AdminCollectionRow[];
  const nextRows = [
    { id: 'b', title: 'B duplicate' },
    { id: 'c', title: 'C' },
  ] as unknown as AdminCollectionRow[];

  expect(mergeAdminRowsById(rows, nextRows)).toEqual([rows[0], rows[1], nextRows[1]]);
});

test('parses and composes ISO 8601 durations for the minute/second inputs', () => {
  expect(parseIsoDuration('PT3M20S')).toEqual({ minutes: '3', seconds: '20' });
  expect(parseIsoDuration('PT45S')).toEqual({ minutes: '', seconds: '45' });
  expect(parseIsoDuration('PT2M')).toEqual({ minutes: '2', seconds: '' });
  expect(parseIsoDuration('')).toEqual({ minutes: '', seconds: '' });
  expect(parseIsoDuration('garbage')).toEqual({ minutes: '', seconds: '' });

  expect(composeIsoDuration('3', '20')).toBe('PT3M20S');
  expect(composeIsoDuration('', '45')).toBe('PT45S');
  expect(composeIsoDuration('2', '')).toBe('PT2M');
  expect(composeIsoDuration('', '')).toBe('');
  expect(composeIsoDuration('0', '0')).toBe('');
});

test('leaves public_id null when omitted so the server can auto-number it', () => {
  const payload = sanitizeAdminPayload('videos', {
    locale: 'ko',
    title: '자동 채번 영상',
    youtube_url: 'https://www.youtube.com/watch?v=test',
    date: '2026-06-05',
    event_year: '2026',
    status: 'draft',
    sort_order: '',
  });
  expect(payload.public_id).toBeNull();
});

test('buildArchiveFilters는 값이 있는 축만 eq 필터로 만든다', () => {
  expect(buildArchiveFilters({ type: 'camp', year: '2026' })).toEqual({
    event_type: 'camp',
    event_year: '2026',
  });
  expect(buildArchiveFilters({ type: 'live' })).toEqual({ event_type: 'live' });
  expect(buildArchiveFilters({ year: '2024' })).toEqual({ event_year: '2024' });
  expect(buildArchiveFilters({})).toEqual({});
  expect(buildArchiveFilters({ type: '', year: '' })).toEqual({});
});

test('buildArchiveFacetOptions는 존재하는 유형·연도만 라벨·정렬해 전체 선두로 만든다', () => {
  const rows = [
    { event_type: 'camp', event_year: 2026 },
    { event_type: 'camp', event_year: 2023 },
    { event_type: 'live', event_year: 2024 },
    { event_type: 'camp', event_year: 2026 },
    { event_type: null, event_year: null },
  ];
  const { typeOptions, yearOptions } = buildArchiveFacetOptions(rows);
  // 유형: EVENT_TYPE_OPTIONS 순서(camp, album, live, ...) 중 존재하는 것만 + 전체 선두
  expect(typeOptions).toEqual([
    { label: '전체', value: '' },
    { label: '캠프', value: 'camp' },
    { label: '라이브', value: 'live' },
  ]);
  // 연도: 내림차순 + 전체 선두
  expect(yearOptions).toEqual([
    { label: '전체', value: '' },
    { label: '2026', value: '2026' },
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
  ]);
});
