import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const emptyToNull = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const blankToEmpty = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : '');

const createSchema = z.object({
  title: z.string().trim().min(1, '제목은 필수입니다.').max(200, '제목은 200자 이하여야 합니다.'),
  meeting_date: z.preprocess(
    emptyToNull,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD여야 합니다.')
      .nullable()
  ),
  meeting_time: z.preprocess(blankToEmpty, z.string().max(20, '시간은 20자 이하여야 합니다.')),
  location: z.preprocess(blankToEmpty, z.string().max(200, '장소는 200자 이하여야 합니다.')),
  event_year: z.coerce.number().int().min(2000).max(2100),
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

  if (req.method === 'POST') {
    try {
      const body = createSchema.parse(req.body);
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          title: body.title,
          meeting_date: body.meeting_date,
          meeting_time: body.meeting_time,
          location: body.location,
          event_year: body.event_year,
          created_by: session.member.email,
        })
        .select('*')
        .single();
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ meeting: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  res.setHeader('Allow', 'POST');
  res.status(405).json({ error: 'method_not_allowed' });
}
