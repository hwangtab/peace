import type { GetServerSideProps } from 'next';

// 과거 관리자 매직링크(OTP) 콜백. 인증이 /login으로 통일되어 더 이상 쓰지 않으므로
// 들어오면 /login으로 리다이렉트한다.
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/login?next=/admin',
      permanent: false,
    },
  };
};

export default function AdminCallbackRedirect() {
  return null;
}
