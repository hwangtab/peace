import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getAdminCollectionConfig } from '@/lib/adminArchive';
import {
  createChangeLogPayload,
  getRestorablePayload,
  insertChangeLogs,
} from '@/lib/adminChangeLogs';
import { revalidateArchivePaths } from '@/lib/adminRevalidate';
import type { CmsChangeLog } from '@/types/cms';

const restoreSchema = z.object({
  log_id: z.string().uuid(),
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Reading the audit log is open to any admin; restoring is editor or owner.
  const minRole = req.method === 'GET' ? 'viewer' : 'editor';
  const session = await requireAdminRole(req, res, minRole);
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'GET') {
    const limit = Math.min(Number(req.query.limit ?? 80) || 80, 200);
    let query = supabase
      .from('cms_change_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (
      typeof req.query.collection === 'string' &&
      getAdminCollectionConfig(req.query.collection)
    ) {
      query = query.eq('collection', req.query.collection);
    }
    if (typeof req.query.row_id === 'string') {
      const parsed = z.string().uuid().safeParse(req.query.row_id);
      if (!parsed.success) {
        res.status(400).json({ error: 'invalid_row_id' });
        return;
      }
      query = query.eq('row_id', parsed.data);
    }

    const { data, error } = await query;
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ logs: data ?? [], admin: session.member });
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = restoreSchema.parse(req.body);
      const { data: log, error: logError } = await supabase
        .from('cms_change_logs')
        .select('*')
        .eq('id', body.log_id)
        .maybeSingle();

      if (logError) {
        res.status(500).json({ error: logError.message });
        return;
      }
      if (!log) {
        res.status(404).json({ error: 'change_log_not_found' });
        return;
      }

      const changeLog = log as CmsChangeLog;
      if (!changeLog.before_data) {
        res.status(400).json({ error: 'change_log_has_no_restore_snapshot' });
        return;
      }

      const config = getAdminCollectionConfig(changeLog.collection);
      if (!config) {
        res.status(400).json({ error: 'unknown_admin_collection' });
        return;
      }

      const rowId =
        changeLog.row_id ??
        (typeof changeLog.before_data.id === 'string' ? changeLog.before_data.id : null);
      if (!rowId) {
        res.status(400).json({ error: 'missing_restore_row_id' });
        return;
      }

      const current = await supabase.from(config.table).select('*').eq('id', rowId).maybeSingle();
      if (current.error) {
        res.status(500).json({ error: current.error.message });
        return;
      }
      if (!current.data) {
        res.status(404).json({ error: 'target_row_not_found' });
        return;
      }

      const payload = getRestorablePayload(config, changeLog.before_data);
      const { data, error } = await supabase
        .from(config.table)
        .update(payload)
        .eq('id', rowId)
        .select('*')
        .single();

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
          action: 'restore',
          before: current.data,
          after: data,
          session,
          restoredFromLogId: changeLog.id,
        }),
      ]);

      res.status(200).json({ item: data, revalidationErrors, changeLogError });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'method_not_allowed' });
}
