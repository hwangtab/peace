import {
  getAdminPreviewUrl,
  getAdminCollectionConfig,
  mapGalleryRowToItem,
  mapPressRowToItem,
  mapVideoRowToItem,
  makePublishedAt,
  sanitizeAdminPayload,
  toContentMap,
} from './adminArchive';
import type {
  ArchiveGalleryImageRow,
  ArchivePressItemRow,
  ArchiveVideoRow,
  CmsContentBlock,
} from '@/types/cms';

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

test('content blocks become placement keyed page overrides', () => {
  const rows = [
    {
      id: '00000000-0000-0000-0000-000000000004',
      key: '/videos.hero.title',
      locale: 'ko',
      route_path: '/videos',
      placement: 'hero.title',
      label: '히어로 제목',
      value: '현장의 영상',
      description: null,
      status: 'published',
      sort_order: 0,
      ...baseDates,
    },
  ] satisfies CmsContentBlock[];

  expect(toContentMap(rows)).toEqual({ 'hero.title': '현장의 영상' });
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
  const content = getAdminCollectionConfig('content');

  expect(videos && getAdminPreviewUrl(videos, { public_id: 12, locale: 'en' })).toBe(
    '/en/videos/12'
  );
  expect(gallery && getAdminPreviewUrl(gallery, { public_id: 34, locale: 'ko' })).toBe(
    '/ko/gallery'
  );
  expect(press && getAdminPreviewUrl(press, { public_id: 56, locale: 'fr' })).toBe('/fr/press');
  expect(content && getAdminPreviewUrl(content, { route_path: '/album/about', locale: 'ja' })).toBe(
    '/ja/album/about'
  );
  expect(content && getAdminPreviewUrl(content, { route_path: 'bad', locale: 'ja' })).toBeNull();
});
