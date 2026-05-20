import { fetchLocalData, fetchLocalizedData } from './client';

const makeMockResponse = (body: string, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body),
  } as Response);

describe('fetchLocalData', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('정상 JSON 배열 응답 → 데이터 반환', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeMockResponse('[{"id":1}]'));
    const data = await fetchLocalData<{ id: number }>('/data/items.json');
    expect(data).toEqual([{ id: 1 }]);
  });

  it('빈 배열 응답 → 빈 배열 반환', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeMockResponse('[]'));
    const data = await fetchLocalData('/data/items.json');
    expect(data).toEqual([]);
  });

  it('404 응답 → 빈 배열 반환 (not_found)', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeMockResponse('Not Found', 404));
    const data = await fetchLocalData('/data/missing.json');
    expect(data).toEqual([]);
  });

  it('500 응답 → Error throw', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeMockResponse('Error', 500));
    await expect(fetchLocalData('/data/items.json')).rejects.toThrow('HTTP 500');
  });

  it('잘못된 JSON 응답 → Error throw', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeMockResponse('{bad json}'));
    await expect(fetchLocalData('/data/items.json')).rejects.toThrow();
  });

  it('AbortError → timeout 에러 throw', async () => {
    const abortError = new Error('The user aborted a request.');
    abortError.name = 'AbortError';
    global.fetch = jest.fn().mockRejectedValue(abortError);
    await expect(fetchLocalData('/data/items.json')).rejects.toThrow('timeout');
  });

  it('네트워크 에러 → Network error throw', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network failure'));
    await expect(fetchLocalData('/data/items.json')).rejects.toThrow('Network error');
  });
});

describe('fetchLocalizedData', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('/data/ 경로가 아니면 단일 path 그대로 사용', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeMockResponse('[{"id":1}]'));
    const data = await fetchLocalizedData<{ id: number }>('/other/path.json', 'en');
    expect(data).toEqual([{ id: 1 }]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('ko locale → /data/ 경로를 localize 없이 사용', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeMockResponse('[{"id":2}]'));
    const data = await fetchLocalizedData<{ id: number }>('/data/items.json', 'ko');
    expect(data).toEqual([{ id: 2 }]);
    expect(global.fetch).toHaveBeenCalledWith('/data/items.json', expect.any(Object));
  });

  it('en locale → /data/en/ 경로 먼저 시도, 없으면 /data/ fallback', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(makeMockResponse('Not Found', 404))
      .mockResolvedValueOnce(makeMockResponse('[{"id":3}]'));
    const data = await fetchLocalizedData<{ id: number }>('/data/items.json', 'en');
    expect(data).toEqual([{ id: 3 }]);
    expect(global.fetch).toHaveBeenNthCalledWith(1, '/data/en/items.json', expect.any(Object));
    expect(global.fetch).toHaveBeenNthCalledWith(2, '/data/items.json', expect.any(Object));
  });

  it('en locale → en 경로에 데이터 있으면 바로 반환', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeMockResponse('[{"id":4}]'));
    const data = await fetchLocalizedData<{ id: number }>('/data/items.json', 'en');
    expect(data).toEqual([{ id: 4 }]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('모든 경로 404 → Error throw', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeMockResponse('Not Found', 404));
    await expect(fetchLocalizedData('/data/items.json', 'en')).rejects.toThrow();
  });

  it('mergeByIdKey 옵션 → id 기준 중복 제거 후 병합', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(makeMockResponse('[{"id":1,"lang":"en"}]'))
      .mockResolvedValueOnce(makeMockResponse('[{"id":1,"lang":"ko"},{"id":2,"lang":"ko"}]'));
    const data = await fetchLocalizedData<{ id: number; lang: string }>(
      '/data/items.json',
      'en',
      { mergeByIdKey: 'id' },
    );
    expect(data).toHaveLength(2);
    expect(data[0]).toEqual({ id: 1, lang: 'en' });
    expect(data[1]).toEqual({ id: 2, lang: 'ko' });
  });
});
