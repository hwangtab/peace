import { useEffect, useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { communityItems as FALLBACK, solidarityNavItem } from '@/components/layout/navigationData';

export interface CommunityItem {
  // 게시판은 DB의 고정 한국어 이름(label), '연대 활동'은 다국어 키(nameKey)로 라벨링한다.
  label?: string;
  nameKey?: string;
  path: string;
}

// 커뮤니티 드롭다운은 항상 '연대 활동'을 맨 위에 두고 그 아래 활성 게시판을 잇는다.
const withSolidarity = (boards: CommunityItem[]): CommunityItem[] => [solidarityNavItem, ...boards];

// 활성 게시판은 거의 바뀌지 않으므로 SPA 세션 동안 한 번만 조회해 모듈 단위로 캐시한다.
// (헤더가 데스크톱·모바일 양쪽에서 훅을 써도 inflight 프라미스로 단일 요청)
let cache: CommunityItem[] | null = null;
let inflight: Promise<CommunityItem[]> | null = null;

// 브라우저 supabase-js 직결 조회 대신 얇은 API(/api/board/list)를 경유한다.
// 이유: supabaseBrowser 정적 import가 Supabase 클라이언트(~232KB)를 모든 공개 페이지 초기
// 번들에 되돌려 넣었고, 방문자마다 브라우저→Supabase 직결 조회로 egress 리스크가 있었다.
// API 라우트는 서버에서 조회하고 CDN(s-maxage=300)이 흡수하므로 번들에서 Supabase가 빠지고
// 페이지뷰당 DB 조회가 사라진다. (상세 근거는 pages/api/board/list.ts 주석 참고)
const fetchActiveBoards = async (): Promise<CommunityItem[]> => {
  try {
    const res = await fetch('/api/board/list');
    if (!res.ok) return withSolidarity(FALLBACK);
    const json = (await res.json()) as { boards?: { slug: string; name: string }[] };
    const boards = json.boards ?? [];
    if (boards.length === 0) return withSolidarity(FALLBACK);
    return withSolidarity(
      boards.map((b) => ({
        label: b.name,
        path: `${ROUTES.BOARD}/${b.slug}`,
      }))
    );
  } catch {
    // 네트워크·파싱 실패는 조용히 삼키고 FALLBACK으로 degrade(네비게이션은 항상 떠야 한다).
    return withSolidarity(FALLBACK);
  }
};

// 관리자에서 게시판을 추가/이름변경/비활성하면 헤더 커뮤니티 드롭다운에도 자동 반영된다.
// 첫 렌더(SSR/클라이언트 초기)는 FALLBACK으로 채워 빈 화면/하이드레이션 불일치를 막는다.
export const useCommunityBoards = (): CommunityItem[] => {
  const [items, setItems] = useState<CommunityItem[]>(cache ?? withSolidarity(FALLBACK));

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
