import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config';
import AuthFormShell from '@/components/auth/AuthFormShell';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import {
  authLinkErrorFromUrl,
  isAuthSessionMissingError,
  mapAuthError,
  validatePassword,
} from '@/lib/memberAuth';

export default function UpdatePasswordPage() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  // 만료/사용된 링크로 진입한 경우 폼 대신 재요청 안내를 노출한다.
  const [linkExpired, setLinkExpired] = useState(false);

  // GoTrue는 recovery code 교환 실패 시 error/error_code를 쿼리 또는 해시에 붙여
  // 되돌려보낸다(confirm.tsx의 서버측 실패 처리와 동일한 신호). 폼을 보여주기 전에
  // 둘 다 점검해 만료 안내로 전환한다.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (authLinkErrorFromUrl(window.location.search, window.location.hash)) {
      setLinkExpired(true);
    }
  }, []);

  useEffect(() => {
    if (!succeeded) return;
    const id = setTimeout(() => void router.push('/account'), 1200);
    return () => clearTimeout(id);
  }, [succeeded, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const pw = validatePassword(password);
    if (!pw.ok) return setError(t(pw.reason));
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: uErr } = await supabase.auth.updateUser({ password });
      setBusy(false);
      if (uErr) {
        // 세션 없이 제출된 경로(만료·사용된 링크)는 만료 안내로 매핑한다.
        if (isAuthSessionMissingError(uErr)) return setLinkExpired(true);
        return setError(t(mapAuthError(uErr)));
      }
      setMessage(t('reset.updated'));
      setSucceeded(true);
    } catch (err) {
      setBusy(false);
      const authErr = err as { name?: string; message?: string };
      if (isAuthSessionMissingError(authErr)) return setLinkExpired(true);
      setError(t(mapAuthError(authErr)));
    }
  };

  if (linkExpired) {
    return (
      <AuthFormShell
        title={t('reset.linkExpiredTitle')}
        backgroundImage="/images-webp/camps/2025/DSC01058.webp"
      >
        <div className="space-y-4">
          <p
            role="alert"
            aria-live="assertive"
            className="rounded bg-sunset-coral/10 px-3 py-2 text-sm leading-relaxed text-sunset-coral"
          >
            {t('reset.linkExpired')}
          </p>
          <Link href="/reset-password" className={`${btnCls} block text-center`}>
            {t('reset.requestAgain')}
          </Link>
        </div>
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell
      title={t('reset.updateTitle')}
      backgroundImage="/images-webp/camps/2025/DSC01058.webp"
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-deep-ocean">
            {t('account.newPassword')}
          </span>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </label>
        {message && (
          <p
            role="status"
            aria-live="polite"
            className="rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean"
          >
            {message}
          </p>
        )}
        {error && (
          <p
            role="alert"
            aria-live="assertive"
            className="rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral"
          >
            {error}
          </p>
        )}
        <button type="submit" disabled={busy || succeeded} className={btnCls}>
          {busy ? t('common.loading') : t('reset.updateCta')}
        </button>
      </form>
    </AuthFormShell>
  );
}

const inputCls =
  'w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20';
const btnCls =
  'w-full rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60';

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolved = locale ?? 'ko';
  return {
    props: {
      ...(await serverSideTranslations(resolved, ['auth', 'translation'], nextI18NextConfig)),
    },
  };
}
