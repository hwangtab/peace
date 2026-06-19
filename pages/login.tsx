import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config';
import AuthFormShell from '@/components/auth/AuthFormShell';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { mapAuthError, safeRedirectPath } from '@/lib/memberAuth';

export default function LoginPage() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const queryError = router.query.error === 'confirm_failed' ? t('confirm.failed') : '';
  const visibleError = error || queryError;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setBusy(false);
      if (signErr) return setError(mapAuthError(signErr));
      await router.push(safeRedirectPath(router.query.next));
    } catch (err) {
      setBusy(false);
      setError(mapAuthError(err as { message?: string }));
    }
  };

  return (
    <AuthFormShell
      title={t('login.title')}
      footer={
        <div className="space-y-1">
          <p>
            {t('login.noAccount')}{' '}
            <Link href="/signup" className="text-jeju-ocean underline">
              {t('login.toSignup')}
            </Link>
          </p>
          <p>
            <Link href="/reset-password" className="text-coastal-gray underline">
              {t('login.forgot')}
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-deep-ocean">{t('common.email')}</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-deep-ocean">{t('common.password')}</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </label>
        {visibleError && <p className="rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">{visibleError}</p>}
        <button type="submit" disabled={busy} className={btnCls}>
          {busy ? t('common.loading') : t('login.cta')}
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
