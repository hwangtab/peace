import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { AdminCommentRow } from '@/types/board';

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['published', 'hidden']),
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('post_comments')
      .select(
        'id, body, status, created_at, post_id, posts(title), profiles!post_comments_author_id_fkey(nickname)'
      )
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const comments: AdminCommentRow[] = (data ?? []).map((row) => {
      const postsField = row.posts as { title?: string } | null;
      const profilesField = row.profiles as { nickname?: string } | null;
      return {
        id: row.id as string,
        body: row.body as string,
        status: row.status as 'published' | 'hidden',
        created_at: row.created_at as string,
        post_id: row.post_id as string,
        post_title: postsField?.title ?? '제목 없음',
        author_nickname: profilesField?.nickname ?? '익명',
      };
    });

    res.status(200).json({ comments });
    return;
  }

  if (req.method === 'PATCH') {
    try {
      const body = patchSchema.parse(req.body);

      const target = await supabase
        .from('post_comments')
        .select('id')
        .eq('id', body.id)
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
        .update({ status: body.status })
        .eq('id', body.id)
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

  res.setHeader('Allow', 'GET, PATCH');
  res.status(405).json({ error: 'method_not_allowed' });
}
