import { createSupabaseServiceClient } from './supabaseService';

export interface RegularUser {
  id: string;
  email: string;
  nickname: string;
  created_at: string;
  isAdmin: boolean;
}

// 가입한 일반 회원 목록(이메일 포함)을 service role로 조회한다. 이메일은 auth.users에 있어
// PostgREST로는 못 읽으므로 Admin API(listUsers)를 쓴다. 관리자 멤버 화면에서 등업 대상 선택용.
// owner 전용 경로에서만 호출할 것(service role 사용).
export const loadRegularMembers = async (): Promise<RegularUser[]> => {
  try {
    const service = createSupabaseServiceClient();
    const [authResult, profilesResult, adminResult] = await Promise.all([
      service.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      service.from('profiles').select('id, nickname'),
      service.from('admin_members').select('email'),
    ]);

    const nickById = new Map(
      ((profilesResult.data ?? []) as { id: string; nickname: string }[]).map((p) => [
        p.id,
        p.nickname,
      ])
    );
    const adminEmails = new Set(
      ((adminResult.data ?? []) as { email: string }[]).map((a) => a.email.toLowerCase())
    );

    const users: RegularUser[] = (authResult.data?.users ?? []).map((u) => {
      const email = u.email ?? '';
      return {
        id: u.id,
        email,
        nickname: nickById.get(u.id) ?? '',
        created_at: u.created_at,
        isAdmin: email ? adminEmails.has(email.toLowerCase()) : false,
      };
    });

    users.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return users;
  } catch (error) {
    console.warn('[admin-members] loadRegularMembers failed:', (error as Error).message);
    return [];
  }
};
