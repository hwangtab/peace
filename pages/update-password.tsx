import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config';
import AuthFormShell from '@/components/auth/AuthFormShell';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { mapAuthError, validatePassword } from '@/lib/memberAuth';

export default function UpdatePasswordPage() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
    if (!pw.ok) return setError(pw.reason);
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: uErr } = await supabase.auth.updateUser({ password });
      setBusy(false);
      if (uErr) return setError(mapAuthError(uErr));
      setMessage(t('reset.updated'));
      setSucceeded(true);
    } catch (err) {
      setBusy(false);
      setError(mapAuthError(err as { message?: string }));
    }
  };

  return (
    <AuthFormShell title={t('reset.updateTitle')}>
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
        <button type="submit" disabled={busy} className={btnCls}>
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
