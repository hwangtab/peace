import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { AdminCommentRow } from '@/types/board';

const sanitizeQ = (q: string): string =>
  q
    .replace(/[%,()*\\]/g, ' ')
    .trim()
    .slice(0, 100);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const patchSingleSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['published', 'hidden']),
});

const patchBulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  status: z.enum(['published', 'hidden']),
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseServerClient(req, res);

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    if (!(await requireAdminRole(req, res, 'viewer'))) return;

    const rawQ = typeof req.query.q === 'string' ? req.query.q : '';
    const q = sanitizeQ(rawQ);

    const rawStatus = typeof req.query.status === 'string' ? req.query.status : '';
    const status = rawStatus === 'published' || rawStatus === 'hidden' ? rawStatus : '';

    const offset = Math.max(0, parseInt(String(req.query.offset ?? '0'), 10) || 0);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '30'), 10) || 30));

    let query = supabase
      .from('post_comments')
      .select(
        'id, body, status, created_at, post_id, posts(id, title, board_id, boards(slug)), profiles!post_comments_author_id_fkey(nickname)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) query = query.ilike('body', `%${q}%`);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const comments: AdminCommentRow[] = (data ?? []).map((row) => {
      const postsField = row.posts as {
        title?: string;
        id?: string;
        board_id?: string;
        boards?: { slug?: string } | null;
      } | null;
      const profilesField = row.profiles as { nickname?: string } | null;
      return {
        id: row.id as string,
        body: row.body as string,
        status: row.status as 'published' | 'hidden',
        created_at: row.created_at as string,
        post_id: row.post_id as string,
        post_title: postsField?.title ?? '제목 없음',
        post_board_slug: postsField?.boards?.slug ?? '',
        author_nickname: profilesField?.nickname ?? '익명',
      };
    });

    const total = count ?? 0;
    res.status(200).json({ comments, total, hasMore: offset + limit < total });
    return;
  }

  // ── PATCH ─────────────────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    if (!(await requireAdminRole(req, res, 'editor'))) return;
    try {
      const body = req.body as unknown;

      // Bulk
      const bulkParsed = patchBulkSchema.safeParse(body);
      if (bulkParsed.success) {
        const { ids, status } = bulkParsed.data;
        const { data, error } = await supabase
          .from('post_comments')
          .update({ status })
          .in('id', ids)
          .select('id, status');
        if (error) {
          res.status(500).json({ error: error.message });
          return;
        }
        const updated = data ?? [];
        const updatedIds = new Set(updated.map((row) => row.id as string));
        const missing = ids.filter((id) => !updatedIds.has(id));
        res
          .status(200)
          .json({ comments: updated, updated: updated.length, requested: ids.length, missing });
        return;
      }

      // Single
      const single = patchSingleSchema.parse(body);

      const target = await supabase
        .from('post_comments')
        .select('id')
        .eq('id', single.id)
        .maybeSingle();
      if (target.error) {
        res.status(500).json({ error: target.error.message });
        return;
      }
      if (!target.data) {
        res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
        return;
      }

      const { data, error } = await supabase
        .from('post_comments')
        .update({ status: single.status })
        .eq('id', single.id)
        .select('id, status')
        .single();
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ comment: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!(await requireAdminRole(req, res, 'editor'))) return;

    const rawId = typeof req.query.id === 'string' ? req.query.id : '';
    if (!UUID_RE.test(rawId)) {
      res.status(400).json({ error: 'id 쿼리 파라미터가 유효한 UUID가 아닙니다.' });
      return;
    }

    const { error: deleteError } = await supabase.from('post_comments').delete().eq('id', rawId);
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
        return;
      }
      res.status(500).json({ error: deleteError.message });
      return;
    }

    res.status(200).json({ ok: true });
    return;
  }

  res.setHeader('Allow', 'GET, PATCH, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
