import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import {
  ADMIN_COLLECTION_PAGE_SIZE,
  getAdminCollectionConfig,
  buildArchiveFilters,
} from '@/lib/adminArchive';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { isSupportedLocale } from '@/constants/locales';
import {
  AdminArchiveServiceError,
  getAdminArchiveLocaleStatuses,
  hideAdminArchiveRow,
  listAdminArchiveRows,
  saveAdminArchiveRow,
} from '@/lib/adminArchiveService';

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
      const parsed = z.string().uuid().safeParse(localeStatusId);
      if (!parsed.success) {
        res.status(400).json({ error: 'invalid_id' });
        return;
      }
      try {
        const locales = await getAdminArchiveLocaleStatuses({
          supabase,
          config,
          id: parsed.data,
        });
        res.status(200).json({ locales });
      } catch (error) {
        const statusCode = error instanceof AdminArchiveServiceError ? error.statusCode : 500;
        res.status(statusCode).json({ error: getErrorMessage(error) });
      }
      return;
    }

    const offset = Number(req.query.offset ?? 0);
    const limit = Number(req.query.limit ?? ADMIN_COLLECTION_PAGE_SIZE);
    const readParam = (key: string) =>
      typeof req.query[key] === 'string' ? (req.query[key] as string) : '';
    const filters = config.yearTypeFilter
      ? buildArchiveFilters({ type: readParam('type'), year: readParam('year') })
      : {};
    try {
      const page = await listAdminArchiveRows({
        supabase,
        config,
        locale: selectedLocale,
        offset,
        limit,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });
      res.status(200).json({
        ...page,
        admin: session.member,
      });
    } catch (error) {
      const statusCode = error instanceof AdminArchiveServiceError ? error.statusCode : 500;
      res.status(statusCode).json({ error: getErrorMessage(error) });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const result = await saveAdminArchiveRow({
        supabase,
        response: res,
        config,
        input: req.body,
        session,
      });
      res.status(200).json(result);
      return;
    } catch (error) {
      const statusCode = error instanceof AdminArchiveServiceError ? error.statusCode : 400;
      res.status(statusCode).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'DELETE') {
    const id = typeof req.query.id === 'string' ? req.query.id : undefined;
    if (!id) {
      res.status(400).json({ error: 'missing_id' });
      return;
    }
    const parsed = z.string().uuid().safeParse(id);
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_id' });
      return;
    }

    try {
      const result = await hideAdminArchiveRow({
        supabase,
        response: res,
        config,
        id: parsed.data,
        session,
      });
      res.status(200).json(result);
      return;
    } catch (error) {
      const statusCode = error instanceof AdminArchiveServiceError ? error.statusCode : 500;
      res.status(statusCode).json({ error: getErrorMessage(error) });
      return;
    }
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
