import type { AdminSession } from './adminAuth';
import {
  getPrimaryLabel,
  type AdminCollectionConfig,
  type AdminCollectionRow,
} from './adminArchive';
import type { CmsChangeAction } from '@/types/cms';

type Snapshot = Record<string, unknown> | null;

export interface ChangeLogPayload {
  collection: AdminCollectionConfig['collection'];
  table_name: AdminCollectionConfig['table'];
  row_id: string | null;
  public_id: number | null;
  locale: string | null;
  action: CmsChangeAction;
  primary_label: string | null;
  before_data: Snapshot;
  after_data: Snapshot;
  admin_member_id: string;
  admin_email: string;
  restored_from_log_id?: string | null;
}

interface ChangeLogInsertClient {
  from: (table: string) => {
    insert: (values: ChangeLogPayload[]) => unknown;
  };
}

const toSnapshot = (row: unknown): Snapshot =>
  row && typeof row === 'object' ? ({ ...(row as Record<string, unknown>) } as Snapshot) : null;

const getSnapshotValue = <T>(snapshot: Snapshot, key: string): T | null => {
  const value = snapshot?.[key];
  return value == null ? null : (value as T);
};

export const createChangeLogPayload = ({
  config,
  action,
  before,
  after,
  session,
  restoredFromLogId = null,
}: {
  config: AdminCollectionConfig;
  action: CmsChangeAction;
  before: unknown;
  after: unknown;
  session: AdminSession;
  restoredFromLogId?: string | null;
}): ChangeLogPayload => {
  const beforeSnapshot = toSnapshot(before);
  const afterSnapshot = toSnapshot(after);
  const target = afterSnapshot ?? beforeSnapshot;

  return {
    collection: config.collection,
    table_name: config.table,
    row_id: getSnapshotValue<string>(target, 'id'),
    public_id: getSnapshotValue<number>(target, 'public_id'),
    locale: getSnapshotValue<string>(target, 'locale'),
    action,
    primary_label: target ? getPrimaryLabel(target as unknown as AdminCollectionRow, config) : null,
    before_data: beforeSnapshot,
    after_data: afterSnapshot,
    admin_member_id: session.member.id,
    admin_email: session.member.email,
    restored_from_log_id: restoredFromLogId,
  };
};

export const getRestorablePayload = (
  config: AdminCollectionConfig,
  snapshot: Record<string, unknown>
): Record<string, unknown> => {
  const payload = config.fields.reduce<Record<string, unknown>>((next, field) => {
    if (Object.prototype.hasOwnProperty.call(snapshot, field.name)) {
      next[field.name] = snapshot[field.name];
    }
    return next;
  }, {});

  if (Object.prototype.hasOwnProperty.call(snapshot, 'published_at')) {
    payload.published_at = snapshot.published_at;
  }

  return payload;
};

export const insertChangeLogs = async (
  supabase: ChangeLogInsertClient,
  logs: ChangeLogPayload[]
): Promise<string | null> => {
  if (logs.length === 0) return null;
  const { error } = (await supabase.from('cms_change_logs').insert(logs)) as {
    error: { message: string } | null;
  };
  return error?.message ?? null;
};
