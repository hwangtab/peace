test('loads videos from static JSON without querying Supabase, even when CMS config is present', async () => {
  jest.resetModules();

  const from = jest.fn();
  const createClient = jest.fn(() => ({ from }));

  jest.doMock('@supabase/supabase-js', () => ({ createClient }));
  jest.doMock('./supabaseConfig', () => ({
    getSupabasePublicConfig: () => ({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
    }),
  }));

  const { loadPublishedVideos } = await import('./archivePublicData');
  const result = await loadPublishedVideos('en');

  // egress 회귀 가드: CMS 설정이 있어도 런타임 Supabase 조회는 일어나지 않는다.
  expect(createClient).not.toHaveBeenCalled();
  expect(from).not.toHaveBeenCalled();
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

test('serves the full static video archive without shrinking, regardless of CMS availability', async () => {
  jest.resetModules();

  const from = jest.fn();

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

  // CMS 병합이 사라져도 아카이브는 줄어들지 않는다: en 번역본 + ko 폴백을 id 로 병합.
  expect(from).not.toHaveBeenCalled();
  expect(enResult.source).toBe('static');
  expect(enResult.items.length).toBeGreaterThan(20);
  // en 번역이 있는 항목은 영어 제목을 사용한다.
  expect(enResult.items.find((video) => video.id === 1)?.title).toBe(
    "Kim Dongsan & Blueeewoot - To You in a Distant Place Whose Name I Don't Know (Seoul Showcase)"
  );
  // en 번역이 없는 항목은 ko 로 폴백해 여전히 노출된다.
  expect(enResult.items.find((video) => video.id === 203)?.title).toContain('강가히말라야');
});
