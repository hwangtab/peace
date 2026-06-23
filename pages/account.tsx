import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import nextI18NextConfig from '../next-i18next.config';
import { useAuth } from '@/components/auth/AuthProvider';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { mapAuthError, validateNickname, validatePassword } from '@/lib/memberAuth';
import { formatBoardDate } from '@/lib/boardForms';
import PageHero from '@/components/common/PageHero';

interface MyPost {
  id: string;
  title: string;
  created_at: string;
  status: string;
  boardSlug: string;
}

const ACCOUNT_HERO_IMAGE = '/images-webp/camps/2025/DSC00864.webp';

export default function AccountPage() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const { user, profile, loading, isAdmin, refreshProfile, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [myPosts, setMyPosts] = useState<MyPost[] | null>(null);

  useEffect(() => {
    if (!loading && !user) void router.replace('/login?next=/account');
  }, [loading, user, router]);

  // 내가 쓴 글 — 로그인 후 본인 작성 글을 최신순으로 불러온다.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from('posts')
        .select('id, title, created_at, status, boards(slug)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (cancelled) return;
      const rows = (data as Record<string, unknown>[] | null) ?? [];
      setMyPosts(
        rows.map((r) => {
          const b = r.boards as { slug?: string } | { slug?: string }[] | null;
          const boardSlug = Array.isArray(b) ? (b[0]?.slug ?? '') : (b?.slug ?? '');
          return {
            id: String(r.id),
            title: String(r.title),
            created_at: String(r.created_at),
            status: String(r.status),
            boardSlug,
          };
        })
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const saveNickname = async (nickname: string) => {
    setError('');
    setMessage('');
    const nick = validateNickname(nickname);
    if (!nick.ok) return setError(t(nick.reason));
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
        return setError(isDup ? t('signup.nicknameTaken') : t(mapAuthError(upErr)));
      }
      await refreshProfile();
      setMessage(t('account.saved'));
    } catch (err) {
      setBusy(false);
      setError(t(mapAuthError(err as { message?: string })));
    }
  };

  const changePassword = async () => {
    setError('');
    setMessage('');
    const pw = validatePassword(newPassword);
    if (!pw.ok) return setError(t(pw.reason));
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: upErr } = await supabase.auth.updateUser({ password: newPassword });
      setBusy(false);
      if (upErr) return setError(t(mapAuthError(upErr)));
      setNewPassword('');
      setMessage(t('reset.updated'));
    } catch (err) {
      setBusy(false);
      setError(t(mapAuthError(err as { message?: string })));
    }
  };

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-md px-4 pb-16 pt-32 text-center text-coastal-gray">
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
      <PageHero compact title={t('account.title')} backgroundImage={ACCOUNT_HERO_IMAGE} />
      <div className="mx-auto max-w-md space-y-6 px-4 py-12">
        {isAdmin && (
          <section className="rounded border border-jeju-ocean/30 bg-jeju-ocean/5 p-5">
            <h2 className="mb-1 font-display text-lg font-bold text-deep-ocean">
              {t('account.adminTitle')}
            </h2>
            <p className="mb-3 text-sm text-coastal-gray">{t('account.adminDescription')}</p>
            <Link
              href="/admin"
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean"
            >
              {t('account.adminEnter')}
            </Link>
          </section>
        )}

        <section className="rounded border border-deep-ocean/10 bg-white p-5">
          <h2 className="mb-3 font-display text-lg font-bold text-deep-ocean">
            {t('account.accountInfo')}
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-coastal-gray">{t('account.email')}</dt>
              <dd className="break-all text-right font-medium text-deep-ocean">{user.email}</dd>
            </div>
            {user.created_at && (
              <div className="flex justify-between gap-3">
                <dt className="text-coastal-gray">{t('account.joinedAt')}</dt>
                <dd className="text-right font-medium text-deep-ocean">
                  {formatBoardDate(user.created_at)}
                </dd>
              </div>
            )}
          </dl>
        </section>

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

        <NicknameSection
          key={`${profile?.id ?? user.id}:${profile?.updated_at ?? profile?.nickname ?? ''}`}
          initialNickname={profile?.nickname ?? ''}
          title={t('account.nickname')}
          saveLabel={t('account.save')}
          busy={busy}
          onSave={saveNickname}
        />

        <section className="rounded border border-deep-ocean/10 bg-white p-5">
          <h2 className="mb-3 font-display text-lg font-bold text-deep-ocean">
            {t('account.changePassword')}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void changePassword();
            }}
          >
            <label
              htmlFor="account-new-password"
              className="block text-sm font-semibold text-deep-ocean"
            >
              {t('account.newPassword')}
            </label>
            <input
              id="account-new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`${inputCls} mt-2 mb-3`}
            />
            <button type="submit" disabled={busy} className={btnCls}>
              {t('account.save')}
            </button>
          </form>
        </section>

        <section className="rounded border border-deep-ocean/10 bg-white p-5">
          <h2 className="mb-3 font-display text-lg font-bold text-deep-ocean">
            {t('account.myPosts')}
          </h2>
          {myPosts === null ? (
            <p className="text-sm text-coastal-gray">{t('common.loading')}</p>
          ) : myPosts.length === 0 ? (
            <p className="text-sm text-coastal-gray">{t('account.noPosts')}</p>
          ) : (
            <ul className="divide-y divide-deep-ocean/10">
              {myPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/board/${post.boardSlug}/${post.id}`}
                    className="flex items-center justify-between gap-3 py-2 transition hover:text-jeju-ocean"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-deep-ocean">
                      {post.title}
                      {post.status === 'hidden' && (
                        <span className="ml-2 rounded bg-deep-ocean/10 px-1.5 py-0.5 text-xs text-coastal-gray">
                          {t('account.postHidden')}
                        </span>
                      )}
                    </span>
                    <span className="flex-shrink-0 text-xs text-coastal-gray">
                      {formatBoardDate(post.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <button
          type="button"
          onClick={async () => {
            await signOut();
            await router.push('/');
          }}
          className="mt-2 w-full rounded border border-deep-ocean/20 bg-white px-4 py-2 font-semibold text-deep-ocean transition hover:border-jeju-ocean"
        >
          {t('account.signout')}
        </button>
      </div>
    </>
  );
}

function NicknameSection({
  initialNickname,
  title,
  saveLabel,
  busy,
  onSave,
}: {
  initialNickname: string;
  title: string;
  saveLabel: string;
  busy: boolean;
  onSave: (nickname: string) => Promise<void>;
}) {
  const [nickname, setNickname] = useState(initialNickname);

  return (
    <section className="rounded border border-deep-ocean/10 bg-white p-5">
      <h2 className="mb-1 font-display text-lg font-bold text-deep-ocean">{title}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onSave(nickname);
        }}
      >
        <label htmlFor="account-nickname" className="sr-only">
          {title}
        </label>
        <input
          id="account-nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className={`${inputCls} mt-2 mb-3`}
        />
        <button type="submit" disabled={busy} className={btnCls}>
          {saveLabel}
        </button>
      </form>
    </section>
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
