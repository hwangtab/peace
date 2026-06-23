import type { GetServerSideProps } from 'next';

// 관리자 인증은 일반 회원 로그인(/login)으로 통일됐다. 과거 매직링크(OTP) 로그인 페이지는
// 임의 이메일로 OTP를 요청할 수 있는 잔재였으므로 제거하고 /login으로 리다이렉트한다.
export const getServerSideProps: GetServerSideProps = async (context) => {
  const next = typeof context.query.next === 'string' ? context.query.next : '/admin';
  const safeNext = next.startsWith('/admin') ? next : '/admin';
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
