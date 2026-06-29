import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { loadRegularMembers } from '@/lib/adminMembers';
import type { AdminMember } from '@/types/cms';

const roleSchema = z.enum(['owner', 'editor', 'viewer']);

const createSchema = z.object({
  email: z.string().trim().toLowerCase().email('올바른 이메일이어야 합니다.'),
  display_name: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() ? value.trim() : null),
    z.string().nullable()
  ),
  role: roleSchema.default('editor'),
  // 일반 회원을 등업할 때 auth user를 직접 연결(없으면 이메일로만 매칭).
  user_id: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() ? value.trim() : null),
    z.string().uuid().nullable()
  ),
});

const updateSchema = z
  .object({
    id: z.string().uuid(),
    role: roleSchema.optional(),
    active: z.boolean().optional(),
  })
  .refine((value) => value.role !== undefined || value.active !== undefined, {
    message: '변경할 역할 또는 활성 여부가 필요합니다.',
  });

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'owner');
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'GET') {
    const [{ data, error }, users] = await Promise.all([
      supabase.from('admin_members').select('*').order('created_at', { ascending: true }),
      loadRegularMembers(),
    ]);
    if (error) {
      console.error('[members] GET members failed:', error.message);
      res.status(500).json({ error: 'internal_error' });
      return;
    }
    res.status(200).json({ members: data ?? [], users, admin: session.member });
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = createSchema.parse(req.body);
      const { data, error } = await supabase
        .from('admin_members')
        .insert({
          email: body.email,
          display_name: body.display_name,
          role: body.role,
          user_id: body.user_id,
          active: true,
        })
        .select('*')
        .single();
      if (error) {
        if (error.code === '23505') {
          res.status(409).json({ error: '이미 등록된 이메일입니다.' });
        } else {
          console.error('[members] POST insert failed:', error.message);
          res.status(500).json({ error: 'internal_error' });
        }
        return;
      }
      res.status(200).json({ member: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = updateSchema.parse(req.body);
      const target = await supabase
        .from('admin_members')
        .select('*')
        .eq('id', body.id)
        .maybeSingle();
      if (target.error) {
        console.error('[members] PATCH select failed:', target.error.message);
        res.status(500).json({ error: 'internal_error' });
        return;
      }
      if (!target.data) {
        res.status(404).json({ error: '대상 기획단원을 찾을 수 없습니다.' });
        return;
      }

      const current = target.data as AdminMember;
      const nextRole = body.role ?? current.role;
      const nextActive = body.active ?? current.active;

      // Never let the last active owner be demoted or deactivated, or the CMS
      // becomes unmanageable.
      const losesOwnerStatus =
        current.active && current.role === 'owner' && !(nextRole === 'owner' && nextActive);
      if (losesOwnerStatus) {
        const { count, error: countError } = await supabase
          .from('admin_members')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'owner')
          .eq('active', true)
          .neq('id', current.id);
        if (countError) {
          console.error('[members] PATCH owner count failed:', countError.message);
          res.status(500).json({ error: 'internal_error' });
          return;
        }
        if (count === null) {
          res.status(500).json({ error: 'owner_count_unavailable' });
          return;
        }
        if (count === 0) {
          res.status(400).json({ error: '마지막 owner는 강등하거나 비활성화할 수 없습니다.' });
          return;
        }
      }

      const { data, error } = await supabase
        .from('admin_members')
        .update({ role: nextRole, active: nextActive })
        .eq('id', current.id)
        .select('*')
        .single();
      if (error) {
        console.error('[members] PATCH update failed:', error.message);
        res.status(500).json({ error: 'internal_error' });
        return;
      }
      res.status(200).json({ member: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  res.setHeader('Allow', 'GET, POST, PATCH');
  res.status(405).json({ error: 'method_not_allowed' });
}
