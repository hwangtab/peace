import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabasePublicClient } from '@/lib/supabasePublicClient';

// 헤더 커뮤니티 드롭다운의 활성 게시판 목록을 서버에서 조회해 반환하는 얇은 라우트.
//
// 왜 API 경유인가:
//  - 예전엔 useCommunityBoards 훅이 브라우저 supabase-js로 boards를 직접 조회했다. 이 정적
//    import가 (1) Supabase 클라이언트(~232KB raw / 59KB gzip)를 모든 공개 페이지 초기 번들에
//    되돌려 넣어 LCP를 눌렀고, (2) 방문자 전원이 페이지 로드마다 브라우저→Supabase 직결
//    조회를 일으켜 무료티어 egress 리스크가 있었다(과거 archive_videos 118만 조회로 egress
//    장애를 겪어 정적 JSON SSOT로 전환한 이력이 있다).
//  - 서버 라우트로 옮기고 CDN에 캐싱시키면 브라우저 번들에서 Supabase가 완전히 빠지고,
//    조회는 리전당 5분에 1회로 수렴한다(페이지뷰당 DB 조회 제거 = egress 방어의 핵심).
//
// anon 키로 충분하다: boards는 공개 RLS select 대상이라, 공개 board 페이지가 쓰는
// loadActiveBoards(getSupabasePublicClient — anon 키)도 이미 이 테이블을 서버에서 읽는다.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const client = getSupabasePublicClient();
  // 설정 누락(로컬 등)이면 빈 목록 — 훅이 FALLBACK 내비게이션으로 조용히 degrade한다.
  // 캐시 헤더는 붙이지 않는다(미구성 상태를 CDN에 굳히지 않기 위함).
  if (!client) {
    res.status(200).json({ boards: [] });
    return;
  }

  // useCommunityBoards가 브라우저에서 쓰던 것과 동일한 컬럼·필터·정렬을 그대로 옮긴다.
  const { data, error } = await client
    .from('boards')
    .select('slug, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[board/list] boards query failed:', error.message);
    // 조회 실패도 조용히 빈 목록 — 헤더는 FALLBACK으로 degrade하고 페이지는 안 깨진다.
    // 실패 응답엔 장수명 캐시를 붙이지 않아 다음 요청이 재시도되게 한다.
    res.status(200).json({ boards: [] });
    return;
  }

  // boards는 어드민이 가끔만 바꾸는 데이터 → 5분 지연을 허용하고 CDN이 방문자 대신 흡수한다.
  // s-maxage=300: 리전 CDN이 5분간 캐시. stale-while-revalidate=86400: 만료 후에도 최대 하루
  // 동안은 낡은 값을 즉시 주면서 백그라운드로 갱신 → 사용자 체감 지연 0.
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  res.status(200).json({ boards: (data as { slug: string; name: string }[]) ?? [] });
}
