import type { GetServerSideProps } from 'next';
import { safeRedirectPath } from '@/lib/memberAuth';

// 관리자 인증은 일반 회원 로그인(/login)으로 통일됐다. 과거 매직링크(OTP) 로그인 페이지는
// 임의 이메일로 OTP를 요청할 수 있는 잔재였으므로 제거하고 /login으로 리다이렉트한다.
export const getServerSideProps: GetServerSideProps = async (context) => {
  // safeRedirectPath가 //, /\ 우회를 차단하고, 추가로 /admin 접두사를 강제한다.
  const candidate = safeRedirectPath(context.query.next, '/admin');
  const safeNext = candidate.startsWith('/admin') ? candidate : '/admin';
  return {
    redirect: {
      destination: `/login?next=${encodeURIComponent(safeNext)}`,
      permanent: false,
    },
  };
};

export default function AdminLoginRedirect() {
  return null;
}
