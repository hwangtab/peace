import { ADMIN_COLLECTION_CONFIGS } from '@/lib/adminArchive';
import { buildAdminFormState } from './adminCollectionForm';

test('buildAdminFormState creates operator-friendly defaults for a new archive row', () => {
  const state = buildAdminFormState(ADMIN_COLLECTION_CONFIGS.videos, null, 'en');

  expect(state).toMatchObject({
    locale: 'en',
    status: 'draft',
    event_type: 'camp',
    sort_order: '0',
  });
});

test('buildAdminFormState normalizes saved row values for editable form fields', () => {
  const state = buildAdminFormState(
    ADMIN_COLLECTION_CONFIGS.videos,
    {
      id: 'row-id',
      public_id: 12,
      locale: 'ko',
      title: '영상',
      musician_ids: [3, 11],
      status: 'published',
    } as never,
    'ko'
  );

  expect(state.id).toBe('row-id');
  expect(state.public_id).toBe('12');
  expect(state.musician_ids).toBe('3, 11');
  expect(state.status).toBe('published');
});
