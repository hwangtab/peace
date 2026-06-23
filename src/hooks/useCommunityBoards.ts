import { useEffect, useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { communityItems as FALLBACK } from '@/components/layout/navigationData';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';

export interface CommunityItem {
  label: string;
  path: string;
}

// 활성 게시판은 거의 바뀌지 않으므로 SPA 세션 동안 한 번만 조회해 모듈 단위로 캐시한다.
// (헤더가 데스크톱·모바일 양쪽에서 훅을 써도 inflight 프라미스로 단일 요청)
let cache: CommunityItem[] | null = null;
let inflight: Promise<CommunityItem[]> | null = null;

const fetchActiveBoards = async (): Promise<CommunityItem[]> => {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('boards')
      .select('slug, name')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK;
    return (data as { slug: string; name: string }[]).map((b) => ({
      label: b.name,
      path: `${ROUTES.BOARD}/${b.slug}`,
    }));
  } catch {
    return FALLBACK;
  }
};

// 관리자에서 게시판을 추가/이름변경/비활성하면 헤더 커뮤니티 드롭다운에도 자동 반영된다.
// 첫 렌더(SSR/클라이언트 초기)는 FALLBACK으로 채워 빈 화면/하이드레이션 불일치를 막는다.
export const useCommunityBoards = (): CommunityItem[] => {
  const [items, setItems] = useState<CommunityItem[]>(cache ?? FALLBACK);

  useEffect(() => {
    // 이미 캐시가 있으면 초기 state가 곧 cache라 추가 작업 불필요.
    if (cache) return;
    let cancelled = false;
    if (!inflight) {
      inflight = fetchActiveBoards().then((result) => {
        cache = result;
        return result;
      });
    }
    void inflight.then((result) => {
      if (!cancelled) setItems(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return items;
};
