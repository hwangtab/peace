import { createChangeLogPayload, getRestorablePayload, insertChangeLogs } from './adminChangeLogs';
import { getAdminCollectionConfig } from './adminArchive';
import type { AdminSession } from './adminAuth';

const session = {
  member: {
    id: '00000000-0000-0000-0000-000000000001',
    user_id: null,
    email: 'hwangtab@gmail.com',
    display_name: 'hwangtab',
    role: 'owner',
    active: true,
    created_at: '2026-06-17T00:00:00.000Z',
    updated_at: '2026-06-17T00:00:00.000Z',
  },
} as AdminSession;

test('creates change log payloads with target and admin metadata', () => {
  const config = getAdminCollectionConfig('videos');
  expect(config).not.toBeNull();
  if (!config) return;

  const before = {
    id: '10000000-0000-0000-0000-000000000001',
    public_id: 42,
    locale: 'en',
    title: 'Before title',
  };
  const after = { ...before, title: 'After title' };

  expect(
    createChangeLogPayload({
      config,
      action: 'update',
      before,
      after,
      session,
    })
  ).toMatchObject({
    collection: 'videos',
    table_name: 'archive_videos',
    row_id: before.id,
    public_id: 42,
    locale: 'en',
    action: 'update',
    primary_label: 'After title',
    before_data: before,
    after_data: after,
    admin_member_id: session.member.id,
    admin_email: session.member.email,
  });
});

test('builds restore payloads from editable fields only', () => {
  const config = getAdminCollectionConfig('press');
  expect(config).not.toBeNull();
  if (!config) return;

  const payload = getRestorablePayload(config, {
    id: '10000000-0000-0000-0000-000000000001',
    public_id: 10,
    locale: 'ko',
    title: '기사',
    publisher: '신문',
    date: '2026-06-17',
    source_url: 'https://example.com',
    description: '설명',
    image_url: null,
    event_type: 'camp',
    event_year: 2026,
    status: 'published',
    sort_order: 0,
    published_at: '2026-06-17T00:00:00.000Z',
    created_at: '2026-06-17T00:00:00.000Z',
    updated_at: '2026-06-17T00:00:00.000Z',
  });

  expect(payload).toMatchObject({
    public_id: 10,
    locale: 'ko',
    title: '기사',
    published_at: '2026-06-17T00:00:00.000Z',
  });
  expect(payload).not.toHaveProperty('id');
  expect(payload).not.toHaveProperty('created_at');
  expect(payload).not.toHaveProperty('updated_at');
});

test('inserts change logs through the provided client', async () => {
  const insert = jest.fn().mockResolvedValue({ error: null });
  const from = jest.fn(() => ({ insert }));

  await expect(insertChangeLogs({ from }, [{ action: 'create' } as never])).resolves.toBeNull();
  expect(from).toHaveBeenCalledWith('cms_change_logs');
  expect(insert).toHaveBeenCalledWith([{ action: 'create' }]);
});
