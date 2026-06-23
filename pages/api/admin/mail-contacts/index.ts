import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { isValidEmail, normalizeCohorts, validateContactName } from '@/lib/mailContactsForms';

const createSchema = z.object({
  name: z.string(),
  email: z.string(),
  group_type: z.enum(['musician', 'planning', 'sponsor']),
  cohorts: z.union([z.string(), z.array(z.string())]).optional(),
  note: z.string().optional(),
});

const getErrorMessage = (error: unknown): string =>
  error instanceof ZodError
    ? error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
    : error instanceof Error
      ? error.message
      : String(error);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;
  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'GET') {
    let query = supabase
      .from('mail_contacts')
      .select('*')
      .order('created_at', { ascending: false });
    const group = req.query.group;
    if (typeof group === 'string' && group) query = query.eq('group_type', group);
    const cohort = req.query.cohort;
    if (typeof cohort === 'string' && cohort) query = query.contains('cohorts', [cohort]);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ items: data });
  }

  if (req.method === 'POST') {
    try {
      const body = createSchema.parse(req.body);
      const nameCheck = validateContactName(body.name);
      if (!nameCheck.ok) return res.status(400).json({ error: nameCheck.reason });
      if (!isValidEmail(body.email))
        return res.status(400).json({ error: '이메일 형식이 올바르지 않습니다.' });
      const { data, error } = await supabase
        .from('mail_contacts')
        .insert({
          name: nameCheck.value,
          email: body.email.trim().toLowerCase(),
          group_type: body.group_type,
          cohorts: normalizeCohorts(body.cohorts ?? []),
          note: body.note?.trim() ?? '',
          created_by: session.member.email,
        })
        .select('*')
        .single();
      if (error) {
        const dup = error.code === '23505';
        return res
          .status(dup ? 409 : 500)
          .json({ error: dup ? '이미 등록된 이메일입니다.' : error.message });
      }
      return res.status(200).json({ item: data });
    } catch (error) {
      return res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'method_not_allowed' });
}
