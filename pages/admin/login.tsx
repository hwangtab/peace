import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';

const getAdminNextPath = (value: string | string[] | undefined) => {
  const next = typeof value === 'string' ? value : '/admin';
  return next.startsWith('/admin') ? next : '/admin';
};

const getCallbackErrorMessage = (value: string | string[] | undefined) => {
  if (value === 'missing_code') return '로그인 링크에 인증 코드가 없습니다. 새 링크를 받아 주세요.';
  if (value === 'auth_callback_failed') {
    return '로그인 세션을 만들지 못했습니다. 링크가 만료되었거나 Supabase 설정이 필요합니다.';
  }
  return '';
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const visibleError = error || getCallbackErrorMessage(router.query.error);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      const next = getAdminNextPath(router.query.next);
      const callbackPath = `/admin/callback?next=${encodeURIComponent(next)}`;
      const { error: signInError } = await createSupabaseBrowserClient().auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo:
            typeof window === 'undefined' ? undefined : `${window.location.origin}${callbackPath}`,
        },
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        setMessage('로그인 링크를 보냈습니다. 메일함을 확인해 주세요.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>관리자 로그인 | PEACE CMS</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <main className="min-h-screen bg-[#f5f7f2] px-4 py-16 text-deep-ocean">
        <div className="mx-auto max-w-md rounded border border-deep-ocean/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jeju-ocean">
            PEACE CMS
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">관리자 로그인</h1>
          <p className="mt-3 text-sm leading-relaxed text-coastal-gray">
            운영진 이메일로 로그인 링크를 받아 웹사이트 문구와 아카이브를 관리합니다. 링크로
            로그인해도 관리자 allowlist에 없으면 접근할 수 없습니다.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">이메일</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded border border-deep-ocean/15 px-3 py-2 focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
                placeholder="you@example.com"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded bg-deep-ocean px-4 py-3 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
            >
              {isSubmitting ? '전송 중' : '로그인 링크 받기'}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">
              {message}
            </p>
          )}
          {visibleError && (
            <p className="mt-4 rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
              {visibleError}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
