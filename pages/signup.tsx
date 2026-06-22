import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config';
import AuthFormShell from '@/components/auth/AuthFormShell';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { mapAuthError, validateNickname, validatePassword } from '@/lib/memberAuth';

export default function SignupPage() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [succeeded, setSucceeded] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const nick = validateNickname(nickname);
    if (!nick.ok) return setError(t(nick.reason));
    const pw = validatePassword(password);
    if (!pw.ok) return setError(t(pw.reason));
    if (password !== passwordConfirm) return setError(t('errors.passwordMismatch'));

    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      // Pre-check nickname uniqueness (final guard is the DB unique index).
      const { data: taken } = await supabase
        .from('profiles')
        .select('id')
        .ilike('nickname', nick.value)
        .maybeSingle();
      if (taken) {
        setBusy(false);
        return setError(t('signup.nicknameTaken'));
      }

      const { data, error: signErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { nickname: nick.value },
          emailRedirectTo:
            typeof window === 'undefined' ? undefined : `${window.location.origin}/auth/confirm`,
        },
      });
      setBusy(false);
      if (signErr) {
        const isDup =
          (signErr as { code?: string }).code === '23505' ||
          /duplicate|unique|nickname/i.test(signErr.message ?? '');
        return setError(isDup ? t('signup.nicknameTaken') : t(mapAuthError(signErr)));
      }
      if (data.session) {
        await router.push('/account');
        return;
      }
      setMessage(t('signup.checkEmail'));
      setSucceeded(true);
    } catch (err) {
      setBusy(false);
      setError(t(mapAuthError(err as { message?: string })));
    }
  };

  return (
    <AuthFormShell
      title={succeeded ? t('signup.checkEmailTitle') : t('signup.title')}
      backgroundImage="/images-webp/camps/2025/DSC00599.webp"
      footer={
        succeeded ? undefined : (
          <span>
            {t('signup.haveAccount')}{' '}
            <Link href="/login" className="text-jeju-ocean underline">
              {t('signup.toLogin')}
            </Link>
          </span>
        )
      }
    >
      {succeeded ? (
        <div className="space-y-5 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-jeju-ocean/10 text-3xl"
            aria-hidden="true"
          >
            ✉️
          </div>
          <p className="text-sm leading-relaxed text-deep-ocean">{t('signup.checkEmail')}</p>
          {email && (
            <p className="break-all rounded bg-jeju-ocean/5 px-3 py-2 text-sm font-semibold text-jeju-ocean">
              {email}
            </p>
          )}
          <p className="text-xs text-coastal-gray">{t('signup.checkEmailSpam')}</p>
          <Link href="/login" className={`${btnCls} block text-center`}>
            {t('signup.toLogin')}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label={t('common.email')}>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label={t('common.nickname')}>
            <input
              type="text"
              required
              autoComplete="username"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label={t('common.password')}>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label={t('common.passwordConfirm')}>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={inputCls}
            />
          </Field>
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
            {busy ? t('common.loading') : t('signup.cta')}
          </button>
        </form>
      )}
    </AuthFormShell>
  );
}

const inputCls =
  'w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20';
const btnCls =
  'w-full rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-deep-ocean">{label}</span>
      {children}
    </label>
  );
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolved = locale ?? 'ko';
  return {
    props: {
      ...(await serverSideTranslations(resolved, ['auth', 'translation'], nextI18NextConfig)),
    },
  };
}
