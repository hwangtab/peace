import type { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import {
  ADMIN_COLLECTION_PAGE_SIZE,
  buildAdminLocaleStatuses,
  getAdminCollectionConfig,
  getAdminPaginationRange,
  makePublishedAt,
  sanitizeAdminPayload,
} from '@/lib/adminArchive';
import { revalidateArchivePaths } from '@/lib/adminRevalidate';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { isSupportedLocale } from '@/constants/locales';
import { createChangeLogPayload, insertChangeLogs } from '@/lib/adminChangeLogs';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const collection = String(req.query.collection ?? '');
  const config = getAdminCollectionConfig(collection);

  if (!config) {
    res.status(404).json({ error: 'unknown_admin_collection' });
    return;
  }

  // GET (read/preview) is allowed for any logged-in admin including viewers;
  // mutations require editor or owner. RLS enforces the same on the DB side.
  const minRole = req.method === 'GET' ? 'viewer' : 'editor';
  const session = await requireAdminRole(req, res, minRole);
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);
  const selectedLocale =
    typeof req.query.locale === 'string' && isSupportedLocale(req.query.locale)
      ? req.query.locale
      : 'ko';

  if (req.method === 'GET') {
    const localeStatusId =
      typeof req.query.localeStatusId === 'string' ? req.query.localeStatusId : null;
    if (localeStatusId) {
      const current = await supabase
        .from(config.table)
        .select('*')
        .eq('id', localeStatusId)
        .maybeSingle();

      if (current.error) {
        res.status(500).json({ error: current.error.message });
        return;
      }
      if (!current.data) {
        res.status(404).json({ error: 'not_found' });
        return;
      }

      const currentRow = current.data as Record<string, unknown>;
      const relatedQuery = supabase
        .from(config.table)
        .select('id, locale, status, updated_at, published_at')
        .order('locale', { ascending: true });
      const related =
        config.collection === 'content'
          ? await relatedQuery.eq('key', String(currentRow.key ?? ''))
          : await relatedQuery.eq('public_id', Number(currentRow.public_id));

      if (related.error) {
        res.status(500).json({ error: related.error.message });
        return;
      }

      res.status(200).json({ locales: buildAdminLocaleStatuses(related.data ?? []) });
      return;
    }

    const offset = Number(req.query.offset ?? 0);
    const limit = Number(req.query.limit ?? ADMIN_COLLECTION_PAGE_SIZE);
    const range = getAdminPaginationRange({ offset, limit });
    const { data, error, count } = await supabase
      .from(config.table)
      .select('*', { count: 'exact' })
      .eq('locale', selectedLocale)
      .order('updated_at', { ascending: false })
      .range(range.from, range.to);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const itemCount = data?.length ?? 0;
    const totalCount = count ?? itemCount;
    const nextOffset = range.from + itemCount;

    res.status(200).json({
      items: data ?? [],
      admin: session.member,
      totalCount,
      nextOffset,
      hasMore: nextOffset < totalCount,
    });
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = sanitizeAdminPayload(config.collection, req.body);
      const id = typeof body.id === 'string' ? body.id : null;
      const status =
        body.status === 'published' ? 'published' : body.status === 'hidden' ? 'hidden' : 'draft';
      const existing =
        id != null
          ? await supabase.from(config.table).select('*').eq('id', id).maybeSingle()
          : null;
      if (existing?.error) {
        res.status(500).json({ error: existing.error.message });
        return;
      }
      if (id != null && !existing?.data) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
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
        if (error.code === '23505') {
          res.status(409).json({ error: '이미 사용 중인 공개 ID 또는 키입니다.' });
        } else {
          res.status(500).json({ error: error.message });
        }
        return;
      }

      const revalidationErrors = await revalidateArchivePaths(
        res,
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
      res.status(200).json({ item: data, revalidationErrors, changeLogError });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'DELETE') {
    const id = typeof req.query.id === 'string' ? req.query.id : undefined;
    if (!id) {
      res.status(400).json({ error: 'missing_id' });
      return;
    }

    const current = await supabase.from(config.table).select('*').eq('id', id).maybeSingle();
    if (current.error) {
      res.status(500).json({ error: current.error.message });
      return;
    }
    if (!current.data) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    const beforeRowsResult =
      config.collection === 'content'
        ? { data: [current.data as Record<string, unknown>], error: null }
        : await supabase
            .from(config.table)
            .select('*')
            .eq('public_id', (current.data as { public_id: number }).public_id);
    if (beforeRowsResult.error) {
      res.status(500).json({ error: beforeRowsResult.error.message });
      return;
    }
    const beforeRows = beforeRowsResult.data ?? [];

    const updateQuery = supabase
      .from(config.table)
      .update({ status: 'hidden', published_at: null });
    const { data, error } =
      config.collection === 'content'
        ? await updateQuery.eq('id', id).select('*')
        : await updateQuery
            .eq('public_id', (current.data as { public_id: number }).public_id)
            .select('*');

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const revalidationErrors = await revalidateArchivePaths(
      res,
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
    res
      .status(200)
      .json({ ok: true, hidden: data?.length ?? 0, revalidationErrors, changeLogError });
    return;
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
