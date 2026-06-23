import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useOptionalAuth } from '@/components/auth/AuthProvider';

const DISMISS_KEY = 'admin-quick-access-dismissed';

// 관리자로 로그인한 동안 어느 페이지에서든 관리자 페이지로 바로 갈 수 있는
// 우하단 플로팅 버튼. 비관리자에게는 렌더되지 않으며, ×로 닫으면 그 세션 동안 숨는다.
// 실제 접근 통제는 /admin 의 getServerSideProps 가 담당하므로 이 버튼은 동선 편의용.
export default function AdminQuickAccess() {
  const auth = useOptionalAuth();
  const router = useRouter();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  const isAdmin = auth?.isAdmin ?? false;
  // 이미 관리자 화면에 있으면 버튼을 띄울 필요가 없다.
  const onAdminRoute = router.pathname.startsWith('/admin');

  if (!isAdmin || dismissed || onAdminRoute) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // 세션 저장 실패는 무시 — 다음 새로고침에서 다시 보일 뿐
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1 print:hidden">
      <Link
        href="/admin"
        className="flex items-center gap-2 rounded-full bg-deep-ocean px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-deep-ocean/30 transition hover:bg-jeju-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean focus-visible:ring-offset-2"
        aria-label="기획단 페이지로 이동"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        기획단
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="기획단 버튼 숨기기"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-coastal-gray shadow-md ring-1 ring-deep-ocean/10 transition hover:text-deep-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
