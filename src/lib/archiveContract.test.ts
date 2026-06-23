import { mergeArchiveRowsWithStatic } from './archiveContract';

describe('archive public contract', () => {
  const mapRow = (row: {
    public_id: number;
    status: 'draft' | 'published' | 'hidden';
    title: string;
  }) => ({
    id: row.public_id,
    title: row.title,
  });

  it('overlays published CMS rows over static rows without shrinking the archive', () => {
    const merged = mergeArchiveRowsWithStatic(
      [{ public_id: 1, status: 'published', title: 'CMS title' }],
      [
        { id: 1, title: 'Static title' },
        { id: 2, title: 'Static only' },
      ],
      mapRow,
      (item) => item.id
    );

    expect(merged).toEqual([
      { id: 1, title: 'CMS title' },
      { id: 2, title: 'Static only' },
    ]);
  });

  it('treats hidden CMS rows as tombstones for static fallback rows', () => {
    const merged = mergeArchiveRowsWithStatic(
      [{ public_id: 2, status: 'hidden', title: 'Hidden CMS title' }],
      [
        { id: 1, title: 'Static visible' },
        { id: 2, title: 'Static hidden fallback' },
      ],
      mapRow,
      (item) => item.id
    );

    expect(merged).toEqual([{ id: 1, title: 'Static visible' }]);
  });
});
