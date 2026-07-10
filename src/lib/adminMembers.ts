import type { User } from '@supabase/supabase-js';
import { createSupabaseServiceClient } from './supabaseService';

export interface RegularUser {
  id: string;
  email: string;
  nickname: string;
  created_at: string;
  isAdmin: boolean;
}

export interface RegularMembersResult {
  users: RegularUser[];
  // auth.users 전체 회원 수(listUsers가 매 페이지 함께 돌려주는 total). 상한과 무관한 실제 총원.
  total: number;
  // 안전 상한(MAX_PAGES)에 걸려 일부 회원을 수집하지 못했는지. true면 화면에 경고를 띄운다.
  truncated: boolean;
}

// Admin API listUsers는 한 번에 최대 perPage명씩만 돌려준다. perPage는 1000으로 두고
// nextPage를 따라가며 전량 수집한다. 안전 상한 MAX_PAGES(=최대 2만 명)를 둬서 무한 루프를
// 막고, 상한에 걸리면 truncated로 표시해 회원이 조용히 사라지지 않게 한다.
const PER_PAGE = 1000;
const MAX_PAGES = 20;

// 가입한 일반 회원 목록(이메일 포함)을 service role로 조회한다. 이메일은 auth.users에 있어
// PostgREST로는 못 읽으므로 Admin API(listUsers)를 쓴다. 관리자 멤버 화면에서 등업 대상 선택용.
// owner 전용 경로에서만 호출할 것(service role 사용).
export const loadRegularMembersWithMeta = async (): Promise<RegularMembersResult> => {
  try {
    const service = createSupabaseServiceClient();
    // profiles·admin_members는 auth 페이지네이션과 독립이라 먼저 병렬로 띄워둔다.
    const metaPromise = Promise.all([
      service.from('profiles').select('id, nickname'),
      service.from('admin_members').select('email'),
    ]);

    const authUsers: User[] = [];
    let total = 0;
    let truncated = false;
    let page = 1;
    for (;;) {
      const { data, error } = await service.auth.admin.listUsers({ page, perPage: PER_PAGE });
      if (error) throw error;
      // 성공 응답 data는 users 외에 total·nextPage(Pagination)를 함께 담는다.
      // 실패 분기와의 유니온 때문에 TS가 좁히지 못하므로 안전하게 캐스팅해 읽는다.
      const pageData = data as {
        users?: User[];
        total?: number;
        nextPage?: number | null;
      };
      authUsers.push(...(pageData.users ?? []));
      if (typeof pageData.total === 'number') total = pageData.total;

      const nextPage = pageData.nextPage ?? null;
      if (!nextPage) break;
      if (page >= MAX_PAGES) {
        truncated = true;
        console.warn(
          `[admin-members] listUsers 안전 상한(${MAX_PAGES}페이지 · ${PER_PAGE}명) 도달 — ` +
            `전체 ${total}명 중 ${authUsers.length}명만 수집했습니다.`
        );
        break;
      }
      page = nextPage;
    }

    const [profilesResult, adminResult] = await metaPromise;

    const nickById = new Map(
      ((profilesResult.data ?? []) as { id: string; nickname: string }[]).map((p) => [
        p.id,
        p.nickname,
      ])
    );
    const adminEmails = new Set(
      ((adminResult.data ?? []) as { email: string }[]).map((a) => a.email.toLowerCase())
    );

    const users: RegularUser[] = authUsers.map((u) => {
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
    return { users, total: total || users.length, truncated };
  } catch (error) {
    console.warn('[admin-members] loadRegularMembers failed:', (error as Error).message);
    return { users: [], total: 0, truncated: false };
  }
};

// 총원·상한 정보가 필요 없는 호출부(예: /api/admin/members)를 위한 배열 반환 래퍼.
export const loadRegularMembers = async (): Promise<RegularUser[]> =>
  (await loadRegularMembersWithMeta()).users;
