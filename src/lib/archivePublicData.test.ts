const buildSupabaseQuery = (result: { data: unknown[]; error: null }) => {
  const query = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    order: jest.fn(() => (query.order.mock.calls.length >= 2 ? Promise.resolve(result) : query)),
  };

  return query;
};

const buildVideoRow = (overrides: Record<string, unknown> = {}) => ({
  id: '11111111-1111-4111-8111-111111111111',
  public_id: 1,
  locale: 'en',
  title: 'CMS English Video',
  description: 'CMS English description',
  youtube_url: 'https://www.youtube.com/watch?v=cms-video',
  date: '2024-11-02',
  location: 'CMS venue',
  event_type: 'album',
  event_year: 2024,
  thumbnail_url: null,
  duration: null,
  musician_ids: [],
  director_musician_id: null,
  status: 'published',
  sort_order: 0,
  published_at: '2026-01-01T00:00:00.000Z',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

test('loads only the requested locale from CMS before falling back to static data', async () => {
  jest.resetModules();

  const query = buildSupabaseQuery({ data: [], error: null });
  const from = jest.fn(() => query);

  jest.doMock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({ from })),
  }));
  jest.doMock('./supabaseConfig', () => ({
    getSupabasePublicConfig: () => ({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
    }),
  }));

  const { loadPublishedVideos } = await import('./archivePublicData');
  const result = await loadPublishedVideos('en');

  expect(from).toHaveBeenCalledWith('archive_videos');
  expect(query.eq).toHaveBeenCalledWith('locale', 'en');
  expect(result.source).toBe('static');
  expect(result.items[0]?.title).toContain('Kim Dongsan');
});

test('preserves full static video archive coverage for partially translated locales', async () => {
  jest.resetModules();

  jest.doMock('./supabaseConfig', () => ({
    getSupabasePublicConfig: () => null,
  }));

  const { loadPublishedVideos } = await import('./archivePublicData');
  const koResult = await loadPublishedVideos('ko');
  const enResult = await loadPublishedVideos('en');

  expect(enResult.source).toBe('static');
  expect(enResult.items).toHaveLength(koResult.items.length);
  expect(enResult.items.find((video) => video.id === 1)?.title).toContain('Kim Dongsan');
  expect(enResult.items.find((video) => video.id === 203)?.title).toContain('강가히말라야');
});

test('merges partial CMS video rows over static fallback without shrinking the archive', async () => {
  jest.resetModules();

  const from = jest.fn(() => buildSupabaseQuery({ data: [buildVideoRow()], error: null }));

  jest.doMock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({ from })),
  }));
  jest.doMock('./supabaseConfig', () => ({
    getSupabasePublicConfig: () => ({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
    }),
  }));

  const { loadPublishedVideos } = await import('./archivePublicData');
  const enResult = await loadPublishedVideos('en');

  expect(enResult.source).toBe('cms');
  expect(enResult.items.length).toBeGreaterThan(20);
  expect(enResult.items.find((video) => video.id === 1)?.title).toBe('CMS English Video');
  expect(enResult.items.find((video) => video.id === 203)?.title).toContain('강가히말라야');
});
