import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const blankToEmpty = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : '');

const createSchema = z.object({
  meeting_id: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(1, '참석자 이름은 필수입니다.')
    .max(50, '이름은 50자 이하여야 합니다.'),
  note: z.preprocess(blankToEmpty, z.string().max(200, '비고는 200자 이하여야 합니다.')),
});

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
        .from('meeting_attendees')
        .insert({ meeting_id: body.meeting_id, name: body.name, note: body.note })
        .select('*')
        .single();
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ attendee: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'DELETE') {
    try {
      const body = deleteSchema.parse(req.body);
      const { error } = await supabase.from('meeting_attendees').delete().eq('id', body.id);
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

  res.setHeader('Allow', 'POST, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
