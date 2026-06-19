import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import nextI18NextConfig from '../next-i18next.config';
import { useAuth } from '@/components/auth/AuthProvider';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { mapAuthError, validateNickname, validatePassword } from '@/lib/memberAuth';

export default function AccountPage() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const [nickname, setNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) void router.replace('/login?next=/account');
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) setNickname(profile.nickname);
  }, [profile]);

  const saveNickname = async () => {
    setError('');
    setMessage('');
    const nick = validateNickname(nickname);
    if (!nick.ok) return setError(nick.reason);
    if (!user) return;
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: upErr } = await supabase
        .from('profiles')
        .update({ nickname: nick.value })
        .eq('id', user.id);
      setBusy(false);
      if (upErr) {
        const isDup = upErr.code === '23505' || /duplicate|unique/i.test(upErr.message ?? '');
        return setError(isDup ? t('signup.nicknameTaken') : mapAuthError(upErr));
      }
      await refreshProfile();
      setMessage(t('account.saved'));
    } catch (err) {
      setBusy(false);
      setError(mapAuthError(err as { message?: string }));
    }
  };

  const changePassword = async () => {
    setError('');
    setMessage('');
    const pw = validatePassword(newPassword);
    if (!pw.ok) return setError(pw.reason);
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: upErr } = await supabase.auth.updateUser({ password: newPassword });
      setBusy(false);
      if (upErr) return setError(mapAuthError(upErr));
      setNewPassword('');
      setMessage(t('reset.updated'));
    } catch (err) {
      setBusy(false);
      setError(mapAuthError(err as { message?: string }));
    }
  };

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-coastal-gray">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('account.title')} | PEACE</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="mx-auto max-w-md space-y-6 px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-deep-ocean">{t('account.title')}</h1>
        <p className="text-sm text-coastal-gray">{user.email}</p>

        {message && <p className="rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">{message}</p>}
        {error && <p className="rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">{error}</p>}

        <section className="space-y-2 rounded border border-deep-ocean/10 bg-white p-5">
          <label htmlFor="account-nickname" className="block text-sm font-semibold text-deep-ocean">{t('account.nickname')}</label>
          <input id="account-nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputCls} />
          <button type="button" onClick={saveNickname} disabled={busy} className={btnCls}>
            {t('account.save')}
          </button>
        </section>

        <section className="space-y-2 rounded border border-deep-ocean/10 bg-white p-5">
          <label htmlFor="account-new-password" className="block text-sm font-semibold text-deep-ocean">{t('account.newPassword')}</label>
          <input id="account-new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} />
          <button type="button" onClick={changePassword} disabled={busy} className={btnCls}>
            {t('account.changePassword')}
          </button>
        </section>

        <button
          type="button"
          onClick={async () => {
            await signOut();
            await router.push('/');
          }}
          className="w-full rounded border border-deep-ocean/20 bg-white px-4 py-2 font-semibold text-deep-ocean transition hover:border-jeju-ocean"
        >
          {t('account.signout')}
        </button>
      </div>
    </>
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
