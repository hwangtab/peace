import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { boardImagePath } from '@/lib/boardData';

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

    const rawBoardId = typeof req.query.boardId === 'string' ? req.query.boardId : '';
    const boardId = UUID_RE.test(rawBoardId) ? rawBoardId : '';

    const rawStatus = typeof req.query.status === 'string' ? req.query.status : '';
    const status = rawStatus === 'published' || rawStatus === 'hidden' ? rawStatus : '';

    const offset = Math.max(0, parseInt(String(req.query.offset ?? '0'), 10) || 0);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '30'), 10) || 30));

    let query = supabase
      .from('posts')
      .select(
        'id, title, body, board_id, status, like_count, comment_count, view_count, created_at, updated_at, boards(slug, name), profiles!posts_author_id_fkey(nickname), post_images(image_url, sort_order)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) query = query.ilike('title', `%${q}%`);
    if (boardId) query = query.eq('board_id', boardId);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) {
      console.error('[board-posts] GET posts failed:', error.message);
      res.status(500).json({ error: 'internal_error' });
      return;
    }

    const total = count ?? 0;
    res.status(200).json({ posts: data ?? [], total, hasMore: offset + limit < total });
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
          .from('posts')
          .update({ status })
          .in('id', ids)
          .select('id, status');
        if (error) {
          console.error('[board-posts] PATCH bulk update failed:', error.message);
          res.status(500).json({ error: 'internal_error' });
          return;
        }
        const updated = data ?? [];
        const updatedIds = new Set(updated.map((row) => row.id as string));
        const missing = ids.filter((id) => !updatedIds.has(id));
        res
          .status(200)
          .json({ posts: updated, updated: updated.length, requested: ids.length, missing });
        return;
      }

      // Single
      const single = patchSingleSchema.parse(body);

      const target = await supabase.from('posts').select('id').eq('id', single.id).maybeSingle();
      if (target.error) {
        console.error('[board-posts] PATCH select failed:', target.error.message);
        res.status(500).json({ error: 'internal_error' });
        return;
      }
      if (!target.data) {
        res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .update({ status: single.status })
        .eq('id', single.id)
        .select('id, status')
        .single();
      if (error) {
        console.error('[board-posts] PATCH single update failed:', error.message);
        res.status(500).json({ error: 'internal_error' });
        return;
      }
      res.status(200).json({ post: data });
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

    // Fetch image URLs before deleting (cascade will remove records)
    const imgResult = await supabase.from('post_images').select('image_url').eq('post_id', rawId);

    const imageUrls: string[] = (imgResult.data ?? []).map(
      (row: { image_url: string }) => row.image_url
    );

    // Delete the post (cascade removes comments, likes, post_images records)
    const { error: deleteError } = await supabase.from('posts').delete().eq('id', rawId);
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
        return;
      }
      console.error('[board-posts] DELETE failed:', deleteError.message);
      res.status(500).json({ error: 'internal_error' });
      return;
    }

    // Best-effort: remove storage files (orphan 방지용으로 실패 시 로깅)
    const paths = imageUrls.map(boardImagePath).filter((p): p is string => p !== null);
    if (paths.length > 0) {
      try {
        const { error: rmError } = await supabase.storage.from('board-images').remove(paths);
        if (rmError) {
          console.error('[board-posts] storage cleanup failed:', rawId, rmError.message);
        }
      } catch (err) {
        console.error('[board-posts] storage cleanup threw:', rawId, err);
      }
    }

    res.status(200).json({ ok: true });
    return;
  }

  res.setHeader('Allow', 'GET, PATCH, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
