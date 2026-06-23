import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdminSession } from '@/lib/adminAuth';

// 현재 로그인 사용자가 관리자(admin_members)인지 클라이언트가 알 수 있게 하는 경량 엔드포인트.
// 관리자 진입 버튼(플로팅·마이페이지 카드)의 노출 여부 판단에만 쓴다.
// 비관리자/비로그인도 401이 아닌 200 { isAdmin: false }로 응답해 콘솔 에러를 피한다.
// 실제 접근 통제는 /admin 페이지의 getServerSideProps가 담당한다.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  const session = await getAdminSession({ req, res });
  if (!session) {
    return res.status(200).json({ isAdmin: false });
  }

  return res.status(200).json({
    isAdmin: true,
    role: session.member.role,
    displayName: session.member.display_name,
  });
}
