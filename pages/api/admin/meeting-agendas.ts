import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const blankToEmpty = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : '');

const createSchema = z.object({
  meeting_id: z.string().uuid(),
  title: z
    .string()
    .trim()
    .min(1, '안건 제목은 필수입니다.')
    .max(200, '안건 제목은 200자 이하여야 합니다.'),
  content: z.preprocess(
    blankToEmpty,
    z.string().max(10000, '안건 내용은 10000자 이하여야 합니다.')
  ),
});

const updateSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(200).optional(),
    content: z.preprocess(blankToEmpty, z.string().max(10000)).optional(),
    status: z.enum(['proposed', 'discussed', 'resolved']).optional(),
    sort_order: z.number().int().min(0).optional(),
  })
  .refine(
    (v) =>
      v.title !== undefined ||
      v.content !== undefined ||
      v.status !== undefined ||
      v.sort_order !== undefined,
    { message: '변경할 필드가 하나 이상 필요합니다.' }
  );

const deleteSchema = z.object({ id: z.string().uuid() });

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

  if (req.method === 'POST') {
    try {
      const body = createSchema.parse(req.body);
      const { data, error } = await supabase
        .from('meeting_agendas')
        .insert({ meeting_id: body.meeting_id, title: body.title, content: body.content })
        .select('*')
        .single();
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ agenda: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = updateSchema.parse(req.body);
      const { id, ...fields } = body;

      const target = await supabase.from('meeting_agendas').select('id').eq('id', id).maybeSingle();
      if (target.error) {
        res.status(500).json({ error: target.error.message });
        return;
      }
      if (!target.data) {
        res.status(404).json({ error: '안건을 찾을 수 없습니다.' });
        return;
      }

      const { data, error } = await supabase
        .from('meeting_agendas')
        .update(fields)
        .eq('id', id)
        .select('*')
        .single();
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ agenda: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'DELETE') {
    try {
      const body = deleteSchema.parse(req.body);
      const { error } = await supabase.from('meeting_agendas').delete().eq('id', body.id);
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  res.setHeader('Allow', 'POST, PATCH, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
