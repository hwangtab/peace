import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const patchSchema = z.object({
  is_read: z.boolean(),
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 인증 먼저, 그다음 입력 검증(다른 라우트와 순서 통일).
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;

  const parsedId = z.string().uuid().safeParse(req.query.id);
  if (!parsedId.success) {
    res.status(400).json({ error: 'invalid_id' });
    return;
  }
  const id = parsedId.data;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'PATCH') {
    try {
      const body = patchSchema.parse(req.body);
      const { data, error } = await supabase
        .from('mailbox_messages')
        .update({ is_read: body.is_read })
        .eq('id', id)
        .select('id, is_read')
        .single();
      if (error) {
        console.error('[mailbox/[id]] 업데이트 실패:', error.message);
        res.status(500).json({ error: 'internal_error' });
        return;
      }
      res.status(200).json({ message: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  res.setHeader('Allow', 'PATCH');
  res.status(405).json({ error: 'method_not_allowed' });
}
