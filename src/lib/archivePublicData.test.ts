const buildSupabaseQuery = (result: { data: unknown[]; error: null }) => {
  const query = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    order: jest.fn(() => (query.order.mock.calls.length >= 2 ? Promise.resolve(result) : query)),
  };

  return query;
};

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
  expect(query.eq).toHaveBeenCalledWith('status', 'published');
  expect(query.eq).toHaveBeenCalledWith('locale', 'en');
  expect(result.source).toBe('static');
  expect(result.items[0]?.title).toContain('Kim Dongsan');
});
