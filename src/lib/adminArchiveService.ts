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
  const related = await relatedQuery.eq('public_id', Number(currentRow.public_id));

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

  // 신규 항목이면서 공개 ID가 비어 있으면 서버가 자동 채번한다(기존 최댓값 + 1).
  // 언어 복제·기존 항목 수정은 클라이언트가 public_id를 함께 보내므로 그대로 유지된다.
  const autoAssignPublicId = id == null && body.public_id == null;

  // (public_id, locale) unique 제약이 있어, 두 관리자가 동시에 신규 생성하면
  // 같은 max+1을 읽어 한쪽이 23505로 실패한다. 자동 채번 건에 한해 충돌 시
  // 최댓값을 다시 읽어 재시도한다(명시적 public_id·수정 건은 그대로 409 반환).
  const nextPublicId = async (): Promise<number> => {
    const maxResult = await supabase
      .from(config.table)
      .select('public_id')
      .order('public_id', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (maxResult.error) throwServiceError(500, maxResult.error.message);
    return ((maxResult.data as { public_id?: number } | null)?.public_id ?? 0) + 1;
  };

  const basePublishedAt = makePublishedAt(
    status,
    (previous as { published_at?: string | null } | null)?.published_at ?? null
  );

  const MAX_RETRIES = 5;
  let data: Record<string, unknown> | null = null;
  let lastError: { code?: string; message: string } | null = null;

  for (let attempt = 0; attempt < (autoAssignPublicId ? MAX_RETRIES : 1); attempt += 1) {
    const publicId = autoAssignPublicId ? await nextPublicId() : body.public_id;
    const payload = {
      ...body,
      public_id: publicId,
      published_at: basePublishedAt,
    };

    const query = id
      ? supabase.from(config.table).update(payload).eq('id', id).select('*').single()
      : supabase.from(config.table).insert(payload).select('*').single();

    const result = await query;
    if (!result.error) {
      data = result.data as Record<string, unknown>;
      lastError = null;
      break;
    }
    lastError = result.error;
    // 자동 채번 중복 충돌이면 max+1을 다시 읽어 재시도, 그 외 오류는 즉시 중단
    if (!(autoAssignPublicId && result.error.code === '23505')) break;
  }

  if (lastError) {
    throwServiceError(
      lastError.code === '23505' ? 409 : 500,
      lastError.code === '23505' ? '이미 사용 중인 공개 ID 또는 키입니다.' : lastError.message
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
    item: data as unknown as AdminCollectionRow,
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

  const beforeRowsResult = await supabase
    .from(config.table)
    .select('*')
    .eq('public_id', (current.data as { public_id: number }).public_id);
  if (beforeRowsResult.error) throwServiceError(500, beforeRowsResult.error.message);
  const beforeRows = beforeRowsResult.data ?? [];

  const updateQuery = supabase.from(config.table).update({ status: 'hidden', published_at: null });
  const { data, error } = await updateQuery
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
