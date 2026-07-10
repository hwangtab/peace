import { useState, useEffect, useRef } from 'react';
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

  // 사용자가 직접 토글했으면 뒤늦게 도착한 초기 조회로 상태를 덮어쓰지 않는다.
  // (조회 발화 전에 클릭하면 stale한 data=null이 방금 누른 좋아요를 풀어버리는 레이스 방지)
  const interactedRef = useRef(false);

  // 마운트/사용자 변경 시 실제 liked 상태를 조회해 낙관적 값을 reconcile한다.
  // 조회 전에도 클릭을 허용하므로 initializing으로 막지 않는다.
  useEffect(() => {
    let cancelled = false;
    interactedRef.current = false;

    const query = user
      ? createSupabaseBrowserClient()
          .from('post_likes')
          .select('post_id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null });

    void query.then(({ data }) => {
      if (!cancelled && !interactedRef.current) {
        setLiked(data !== null);
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

    if (loading) return;
    interactedRef.current = true;
    setLoading(true);

    // 로딩 플래그는 try/finally 로 반드시 해제한다 — 예기치 못한 throw(네트워크 계층
    // 예외, 클라이언트 생성 실패 등)에도 버튼이 영구 비활성으로 고착되지 않도록.
    // (형제 파일 CommentSection 의 확립된 try/finally 규칙과 일관.)
    try {
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
    } finally {
      setLoading(false);
    }
  };

  // initializing 중에도 클릭 가능하게 — 낙관적 토글 후 백그라운드에서 reconcile.
  const disabled = authLoading || loading;

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
        <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
        <span>{t('post.likes')}</span>
        <span>{count}</span>
      </button>
    </div>
  );
}
