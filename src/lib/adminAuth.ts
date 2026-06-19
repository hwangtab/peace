import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import type { User } from '@supabase/supabase-js';
import type { AdminMember, AdminRole } from '@/types/cms';
import { createSupabaseServerClient } from './supabaseServer';

export interface AdminSession {
  user: User;
  member: AdminMember;
}

export const ROLE_RANK: Record<AdminRole, number> = {
  viewer: 1,
  editor: 2,
  owner: 3,
};

export const hasAdminRole = (role: AdminRole, minRole: AdminRole): boolean =>
  ROLE_RANK[role] >= ROLE_RANK[minRole];

export const canEditContent = (member: Pick<AdminMember, 'role'>): boolean =>
  hasAdminRole(member.role, 'editor');

export const isOwner = (member: Pick<AdminMember, 'role'>): boolean => member.role === 'owner';

const findAdminMember = async (
  supabase: ReturnType<typeof createSupabaseServerClient>,
  user: User
): Promise<AdminMember | null> => {
  const normalizedEmail = user.email?.trim().toLowerCase();

  const byUserId = await supabase
    .from('admin_members')
    .select('*')
    .eq('active', true)
    .eq('user_id', user.id)
    .maybeSingle();

  if (byUserId.data) return byUserId.data;
  if (!normalizedEmail) return null;

  const byEmail = await supabase
    .from('admin_members')
    .select('*')
    .eq('active', true)
    .ilike('email', normalizedEmail)
    .limit(1)
    .maybeSingle();

  return byEmail.data ?? null;
};

export const getAdminSession = async (
  context:
    | Pick<GetServerSidePropsContext, 'req' | 'res'>
    | { req: NextApiRequest; res: NextApiResponse }
): Promise<AdminSession | null> => {
  let supabase;
  try {
    supabase = createSupabaseServerClient(context.req, context.res);
  } catch {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const member = await findAdminMember(supabase, user);
  return member ? { user, member } : null;
};

export const requireAdminApi = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AdminSession | null> => {
  const session = await getAdminSession({ req, res });
  if (!session) {
    res.status(401).json({ error: 'admin_auth_required' });
    return null;
  }
  return session;
};

export const requireAdminRole = async (
  req: NextApiRequest,
  res: NextApiResponse,
  minRole: AdminRole
): Promise<AdminSession | null> => {
  const session = await requireAdminApi(req, res);
  if (!session) return null;
  if (!hasAdminRole(session.member.role, minRole)) {
    res.status(403).json({ error: 'admin_role_required' });
    return null;
  }
  return session;
};

export const redirectToAdminLogin = (destination = '/admin') => ({
  redirect: {
    destination: `/admin/login?next=${encodeURIComponent(destination)}`,
    permanent: false,
  },
});
