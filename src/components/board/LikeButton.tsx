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
  const auth = useAuth();
  const user = auth.user;

  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // On mount: if logged in, check whether the user already liked this post
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setLiked(data !== null);
      });
    return () => { cancelled = true; };
  }, [postId, user]);

  const handleClick = async () => {
    if (!user) {
      void router.push('/login?next=' + safeRedirectPath(router.asPath));
      return;
    }

    if (loading) return;
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
        // Revert
        setLiked(false);
        setCount((c) => c - 1);
      }
    } else {
      // Optimistic: decrement
      setLiked(false);
      setCount((c) => c - 1);
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

  return (
    <div className="mt-8 flex items-center gap-2">
      <button
        type="button"
        onClick={() => { void handleClick(); }}
        disabled={loading}
        aria-pressed={liked}
        className={[
          'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition',
          liked
            ? 'border-jeju-ocean bg-jeju-ocean text-white'
            : 'border-coastal-gray text-coastal-gray hover:border-jeju-ocean hover:text-jeju-ocean',
          loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span aria-hidden="true">♡</span>
        <span>{t('post.likes')}</span>
        <span>{count}</span>
      </button>
    </div>
  );
}
