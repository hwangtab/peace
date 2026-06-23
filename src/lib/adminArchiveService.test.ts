import {
  ADMIN_COLLECTION_CONFIGS,
  ADMIN_COLLECTION_PAGE_SIZE,
  type AdminCollectionConfig,
} from './adminArchive';
import { getAdminArchiveLocaleStatuses, listAdminArchiveRows } from './adminArchiveService';

const videosConfig = ADMIN_COLLECTION_CONFIGS.videos;

const buildListClient = (result: { data: unknown[]; error: null; count: number | null }) => {
  const query = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    order: jest.fn(() => query),
    range: jest.fn(() => Promise.resolve(result)),
  };

  return {
    client: { from: jest.fn(() => query) },
    query,
  };
};

test('listAdminArchiveRows returns bounded pagination metadata', async () => {
  const rows = [{ id: 'row-1' }, { id: 'row-2' }];
  const { client, query } = buildListClient({ data: rows, error: null, count: 5 });

  const result = await listAdminArchiveRows({
    supabase: client as never,
    config: videosConfig,
    locale: 'en',
    offset: 0,
    limit: ADMIN_COLLECTION_PAGE_SIZE,
  });

  expect(client.from).toHaveBeenCalledWith('archive_videos');
  expect(query.select).toHaveBeenCalledWith('*', { count: 'exact' });
  expect(query.eq).toHaveBeenCalledWith('locale', 'en');
  expect(query.range).toHaveBeenCalledWith(0, ADMIN_COLLECTION_PAGE_SIZE - 1);
  expect(result).toEqual({
    items: rows,
    totalCount: 5,
    nextOffset: 2,
    hasMore: true,
  });
});

const buildLocaleStatusClient = (
  config: AdminCollectionConfig,
  currentRow: Record<string, unknown>,
  relatedRows: unknown[]
) => {
  const currentQuery = {
    select: jest.fn(() => currentQuery),
    eq: jest.fn(() => currentQuery),
    maybeSingle: jest.fn(() => Promise.resolve({ data: currentRow, error: null })),
  };
  const relatedQuery = {
    select: jest.fn(() => relatedQuery),
    order: jest.fn(() => relatedQuery),
    eq: jest.fn(() => Promise.resolve({ data: relatedRows, error: null })),
  };
  const from = jest.fn((table: string) => {
    if (table !== config.table) throw new Error(`Unexpected table ${table}`);
    return from.mock.calls.length === 1 ? currentQuery : relatedQuery;
  });

  return { client: { from }, currentQuery, relatedQuery };
};

test('getAdminArchiveLocaleStatuses groups archive rows by public_id', async () => {
  const { client, relatedQuery } = buildLocaleStatusClient(
    videosConfig,
    { id: '11111111-1111-4111-8111-111111111111', public_id: 42 },
    [{ id: '22222222-2222-4222-8222-222222222222', locale: 'en', status: 'published' }]
  );

  const statuses = await getAdminArchiveLocaleStatuses({
    supabase: client as never,
    config: videosConfig,
    id: '11111111-1111-4111-8111-111111111111',
  });

  expect(relatedQuery.eq).toHaveBeenCalledWith('public_id', 42);
  expect(statuses.find((item) => item.locale === 'en')?.status).toBe('published');
  expect(statuses.find((item) => item.locale === 'ko')?.status).toBe('missing');
});

test('getAdminArchiveLocaleStatuses groups content rows by key', async () => {
  const contentConfig = ADMIN_COLLECTION_CONFIGS.content;
  const { client, relatedQuery } = buildLocaleStatusClient(
    contentConfig,
    { id: '11111111-1111-4111-8111-111111111111', key: 'videos.hero.title' },
    [{ id: '22222222-2222-4222-8222-222222222222', locale: 'ko', status: 'draft' }]
  );

  const statuses = await getAdminArchiveLocaleStatuses({
    supabase: client as never,
    config: contentConfig,
    id: '11111111-1111-4111-8111-111111111111',
  });

  expect(relatedQuery.eq).toHaveBeenCalledWith('key', 'videos.hero.title');
  expect(statuses.find((item) => item.locale === 'ko')?.status).toBe('draft');
});
