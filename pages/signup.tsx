import { useState } from 'react';
import Link from 'next/link';
import type { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config';
import AuthFormShell from '@/components/auth/AuthFormShell';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { mapAuthError, validateNickname, validatePassword } from '@/lib/memberAuth';

export default function SignupPage() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const nick = validateNickname(nickname);
    if (!nick.ok) return setError(nick.reason);
    const pw = validatePassword(password);
    if (!pw.ok) return setError(pw.reason);

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

      const { error: signErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { nickname: nick.value },
          emailRedirectTo:
            typeof window === 'undefined' ? undefined : `${window.location.origin}/auth/confirm`,
        },
      });
      setBusy(false);
      if (signErr) return setError(mapAuthError(signErr));
      setMessage(t('signup.checkEmail'));
    } catch (err) {
      setBusy(false);
      setError(mapAuthError(err as { message?: string }));
    }
  };

  return (
    <AuthFormShell
      title={t('signup.title')}
      footer={
        <span>
          {t('signup.haveAccount')}{' '}
          <Link href="/login" className="text-jeju-ocean underline">
            {t('signup.toLogin')}
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label={t('common.email')}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </Field>
        <Field label={t('common.nickname')}>
          <input type="text" required value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputCls} />
        </Field>
        <Field label={t('common.password')}>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </Field>
        {message && <p className="rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">{message}</p>}
        {error && <p className="rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">{error}</p>}
        <button type="submit" disabled={busy} className={btnCls}>
          {busy ? t('common.loading') : t('signup.cta')}
        </button>
      </form>
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
