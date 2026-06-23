import type { NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildAdminLocaleStatuses,
  getAdminPaginationRange,
  makePublishedAt,
  sanitizeAdminPayload,
  type AdminCollectionConfig,
  type AdminCollectionRow,
  type AdminLocaleStatus,
} from './adminArchive';
import { revalidateArchivePaths } from './adminRevalidate';
import { createChangeLogPayload, insertChangeLogs } from './adminChangeLogs';
import type { AdminSession } from './adminAuth';

type ArchiveRevalidationErrors = Awaited<ReturnType<typeof revalidateArchivePaths>>;

export class AdminArchiveServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
  }
}

const throwServiceError = (statusCode: number, message: string): never => {
  throw new AdminArchiveServiceError(statusCode, message);
};

export const listAdminArchiveRows = async ({
  supabase,
  config,
  locale,
  offset,
  limit,
  filters,
}: {
  supabase: SupabaseClient;
  config: AdminCollectionConfig;
  locale: string;
  offset: number;
  limit: number;
  filters?: Record<string, string>;
}): Promise<{
  items: AdminCollectionRow[];
  totalCount: number;
  nextOffset: number;
  hasMore: boolean;
}> => {
  const range = getAdminPaginationRange({ offset, limit });
  let query = supabase.from(config.table).select('*', { count: 'exact' }).eq('locale', locale);
  if (filters) {
    for (const [field, value] of Object.entries(filters)) {
      query = query.eq(field, value);
    }
  }
  const { data, error, count } = await query
    .order('updated_at', { ascending: false })
    .range(range.from, range.to);

  if (error) throwServiceError(500, error.message);

  const itemCount = data?.length ?? 0;
  const totalCount = count ?? itemCount;
  const nextOffset = range.from + itemCount;

  return {
    items: (data ?? []) as unknown as AdminCollectionRow[],
    totalCount,
    nextOffset,
    hasMore: nextOffset < totalCount,
  };
};

export const getAdminArchiveLocaleStatuses = async ({
  supabase,
  config,
  id,
}: {
  supabase: SupabaseClient;
  config: AdminCollectionConfig;
  id: string;
}): Promise<AdminLocaleStatus[]> => {
  const current = await supabase.from(config.table).select('*').eq('id', id).maybeSingle();

  if (current.error) throwServiceError(500, current.error.message);
  if (!current.data) throwServiceError(404, 'not_found');

  const currentRow = current.data as Record<string, unknown>;
  const relatedQuery = supabase
    .from(config.table)
    .select('id, locale, status, updated_at, published_at')
    .order('locale', { ascending: true });
  const related =
    config.collection === 'content'
      ? await relatedQuery.eq('key', String(currentRow.key ?? ''))
      : await relatedQuery.eq('public_id', Number(currentRow.public_id));

  if (related.error) throwServiceError(500, related.error.message);

  return buildAdminLocaleStatuses(related.data ?? []);
};

export const saveAdminArchiveRow = async ({
  supabase,
  response,
  config,
  input,
  session,
}: {
  supabase: SupabaseClient;
  response: NextApiResponse;
  config: AdminCollectionConfig;
  input: unknown;
  session: AdminSession;
}): Promise<{
  item: AdminCollectionRow;
  revalidationErrors: ArchiveRevalidationErrors;
  changeLogError: string | null;
}> => {
  const body = sanitizeAdminPayload(config.collection, input);
  const id = typeof body.id === 'string' ? body.id : null;
  const status =
    body.status === 'published' ? 'published' : body.status === 'hidden' ? 'hidden' : 'draft';
  const existing =
    id != null ? await supabase.from(config.table).select('*').eq('id', id).maybeSingle() : null;
  if (existing?.error) throwServiceError(500, existing.error.message);
  if (id != null && !existing?.data) throwServiceError(404, 'not_found');

  const previous = (existing?.data as Record<string, unknown> | null) ?? null;
  const payload = {
    ...body,
    published_at: makePublishedAt(
      status,
      (previous as { published_at?: string | null } | null)?.published_at ?? null
    ),
  };

  const query = id
    ? supabase.from(config.table).update(payload).eq('id', id).select('*').single()
    : supabase.from(config.table).insert(payload).select('*').single();

  const { data, error } = await query;

  if (error) {
    throwServiceError(
      error.code === '23505' ? 409 : 500,
      error.code === '23505' ? '이미 사용 중인 공개 ID 또는 키입니다.' : error.message
    );
  }

  const revalidationErrors = await revalidateArchivePaths(
    response,
    config.collection,
    data as Record<string, unknown>
  );
  const changeLogError = await insertChangeLogs(supabase, [
    createChangeLogPayload({
      config,
      action: id ? 'update' : 'create',
      before: previous,
      after: data,
      session,
    }),
  ]);

  return {
    item: data as AdminCollectionRow,
    revalidationErrors,
    changeLogError,
  };
};

export const hideAdminArchiveRow = async ({
  supabase,
  response,
  config,
  id,
  session,
}: {
  supabase: SupabaseClient;
  response: NextApiResponse;
  config: AdminCollectionConfig;
  id: string;
  session: AdminSession;
}): Promise<{
  ok: true;
  hidden: number;
  revalidationErrors: ArchiveRevalidationErrors;
  changeLogError: string | null;
}> => {
  const current = await supabase.from(config.table).select('*').eq('id', id).maybeSingle();
  if (current.error) throwServiceError(500, current.error.message);
  if (!current.data) throwServiceError(404, 'not_found');

  const beforeRowsResult =
    config.collection === 'content'
      ? { data: [current.data as Record<string, unknown>], error: null }
      : await supabase
          .from(config.table)
          .select('*')
          .eq('public_id', (current.data as { public_id: number }).public_id);
  if (beforeRowsResult.error) throwServiceError(500, beforeRowsResult.error.message);
  const beforeRows = beforeRowsResult.data ?? [];

  const updateQuery = supabase.from(config.table).update({ status: 'hidden', published_at: null });
  const { data, error } =
    config.collection === 'content'
      ? await updateQuery.eq('id', id).select('*')
      : await updateQuery
          .eq('public_id', (current.data as { public_id: number }).public_id)
          .select('*');

  if (error) throwServiceError(500, error.message);

  const revalidationErrors = await revalidateArchivePaths(
    response,
    config.collection,
    current.data as Record<string, unknown>
  );
  const afterById = new Map(
    ((data ?? []) as Record<string, unknown>[]).map((row) => [String(row.id), row])
  );
  const changeLogError = await insertChangeLogs(
    supabase,
    (beforeRows as Record<string, unknown>[]).map((before) =>
      createChangeLogPayload({
        config,
        action: 'hide',
        before,
        after: afterById.get(String(before.id)) ?? null,
        session,
      })
    )
  );

  return {
    ok: true,
    hidden: data?.length ?? 0,
    revalidationErrors,
    changeLogError,
  };
};
