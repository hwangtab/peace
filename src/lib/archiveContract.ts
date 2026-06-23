import type { CmsStatus } from '@/types/cms';

export type ArchiveRowWithPublicId = {
  public_id: number;
  status: CmsStatus;
};

export const mergeArchiveRowsWithStatic = <T, R extends ArchiveRowWithPublicId>(
  rows: R[],
  staticItems: T[],
  mapRow: (row: R) => T,
  getItemId: (item: T) => number
): T[] => {
  const blockedStaticIds = new Set(rows.map((row) => row.public_id));
  const seenIds = new Set<number>();
  const items: T[] = [];

  for (const row of rows) {
    if (row.status !== 'published') continue;
    const item = mapRow(row);
    const id = getItemId(item);
    if (!seenIds.has(id)) {
      seenIds.add(id);
      items.push(item);
    }
  }

  for (const item of staticItems) {
    const id = getItemId(item);
    if (!seenIds.has(id) && !blockedStaticIds.has(id)) {
      seenIds.add(id);
      items.push(item);
    }
  }

  return items;
};
