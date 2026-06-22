import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/components/auth/AuthProvider';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { safeRedirectPath } from '@/lib/memberAuth';

interface Props {
  postId: string;
  initialCount: number;
}

export default function LikeButton({ postId, initialCount }: Props) {
  const { t } = useTranslation('board');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  // Starts true; stays true until the membership query resolves (or user is absent).
  // Prevents clicking before we know whether they already liked.
  const [initializing, setInitializing] = useState(true);

  // On mount / when user changes: check whether the user already liked this post.
  // Re-arms `initializing` to true whenever the user identity changes so a freshly-
  // authenticated user cannot click before the membership query resolves.
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInitializing(true);

    const query = user
      ? createSupabaseBrowserClient()
          .from('post_likes')
          .select('post_id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null });

    void query.then(({ data }) => {
      if (!cancelled) {
        setLiked(data !== null);
        setInitializing(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [postId, user]);

  const handleClick = async () => {
    if (authLoading) return;
    if (!user) {
      void router.push('/login?next=' + encodeURIComponent(safeRedirectPath(router.asPath)));
      return;
    }

    if (loading || initializing) return;
    setLoading(true);

    const supabase = createSupabaseBrowserClient();

    if (!liked) {
      // Optimistic: increment
      setLiked(true);
      setCount((c) => c + 1);
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: user.id });
      if (error) {
        if (error.code === '23505') {
          // Already liked (race condition) — treat as success, keep liked=true
        } else {
          // Revert on genuine error
          setLiked(false);
          setCount((c) => Math.max(0, c - 1));
        }
      }
    } else {
      // Optimistic: decrement
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      if (error) {
        // Revert
        setLiked(true);
        setCount((c) => c + 1);
      }
    }

    setLoading(false);
  };

  const disabled = authLoading || loading || initializing;

  return (
    <div className="mt-8 flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          void handleClick();
        }}
        disabled={disabled}
        aria-pressed={liked}
        className={[
          'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition',
          liked
            ? 'border-jeju-ocean bg-jeju-ocean text-white'
            : 'border-coastal-gray text-coastal-gray hover:border-jeju-ocean hover:text-jeju-ocean',
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span aria-hidden="true">♡</span>
        <span>{t('post.likes')}</span>
        <span>{count}</span>
      </button>
    </div>
  );
}
