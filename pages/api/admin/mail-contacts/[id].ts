import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { isValidEmail, normalizeCohorts, validateContactName } from '@/lib/mailContactsForms';

const patchSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  group_type: z.enum(['musician', 'planning', 'sponsor']).optional(),
  cohorts: z.union([z.string(), z.array(z.string())]).optional(),
  note: z.string().optional(),
  is_active: z.boolean().optional(),
});

const getErrorMessage = (error: unknown): string =>
  error instanceof ZodError
    ? error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
    : error instanceof Error
      ? error.message
      : String(error);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 인증 먼저, 그다음 입력 검증.
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;

  const parsedId = z.string().uuid().safeParse(req.query.id);
  if (!parsedId.success) return res.status(400).json({ error: 'invalid_id' });
  const id = parsedId.data;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'PATCH') {
    try {
      const body = patchSchema.parse(req.body);
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.name !== undefined) {
        const nameCheck = validateContactName(body.name);
        if (!nameCheck.ok) return res.status(400).json({ error: nameCheck.reason });
        update.name = nameCheck.value;
      }
      if (body.email !== undefined) {
        if (!isValidEmail(body.email))
          return res.status(400).json({ error: '이메일 형식이 올바르지 않습니다.' });
        update.email = body.email.trim().toLowerCase();
      }
      if (body.group_type !== undefined) update.group_type = body.group_type;
      if (body.cohorts !== undefined) update.cohorts = normalizeCohorts(body.cohorts);
      if (body.note !== undefined) update.note = body.note.trim();
      if (body.is_active !== undefined) update.is_active = body.is_active;

      const { data, error } = await supabase
        .from('mail_contacts')
        .update(update)
        .eq('id', id)
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

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('mail_contacts').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
