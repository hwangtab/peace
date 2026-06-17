import type { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import { requireAdminApi } from '@/lib/adminAuth';
import {
  getAdminCollectionConfig,
  makePublishedAt,
  sanitizeAdminPayload,
} from '@/lib/adminArchive';
import { revalidateArchivePaths } from '@/lib/adminRevalidate';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { isSupportedLocale } from '@/constants/locales';

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

  const session = await requireAdminApi(req, res);
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);
  const selectedLocale =
    typeof req.query.locale === 'string' && isSupportedLocale(req.query.locale)
      ? req.query.locale
      : 'ko';

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from(config.table)
      .select('*')
      .eq('locale', selectedLocale)
      .order('updated_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ items: data ?? [], admin: session.member });
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
          ? await supabase.from(config.table).select('published_at').eq('id', id).maybeSingle()
          : null;
      if (existing?.error) {
        res.status(500).json({ error: existing.error.message });
        return;
      }
      const payload = {
        ...body,
        published_at: makePublishedAt(
          status,
          (existing?.data as { published_at?: string | null } | null)?.published_at ?? null
        ),
      };

      const query = id
        ? supabase.from(config.table).update(payload).eq('id', id).select('*').single()
        : supabase.from(config.table).insert(payload).select('*').single();

      const { data, error } = await query;

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      const revalidationErrors = await revalidateArchivePaths(
        res,
        config.collection,
        data as Record<string, unknown>
      );
      res.status(200).json({ item: data, revalidationErrors });
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
    res.status(200).json({ ok: true, hidden: data?.length ?? 0, revalidationErrors });
    return;
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
