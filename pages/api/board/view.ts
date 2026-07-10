import type { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabaseService';
import { postViewBodySchema, createRateLimiter } from '@/lib/postViewRateLimit';
import { getClientIp } from '@/lib/clientIp';

// IP+postId당 최소 60초 간격으로 조회수 증가를 제한한다. 상한 1만 항목(메모리 누수 방지).
// 이 Map은 모듈 스코프이므로 같은 서버 인스턴스에 붙는 요청 사이에서만 공유된다 —
// 완전한 조작 방어가 아니라 경량 억제책임에 유의(자세한 한계는 postViewRateLimit.ts 참고).
const RATE_LIMIT_MS = 60_000;
const RATE_LIMIT_MAX_ENTRIES = 10_000;
const rateLimiter = createRateLimiter(RATE_LIMIT_MS, RATE_LIMIT_MAX_ENTRIES);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  let postId: string;
  try {
    postId = postViewBodySchema.parse(req.body).postId;
  } catch (error) {
    const message =
      error instanceof ZodError
        ? error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
        : 'invalid_request';
    res.status(400).json({ error: message });
    return;
  }

  // Rate limit: IP+postId당 최소 간격. 차단돼도 클라이언트엔 성공처럼 보이는 no-op 응답
  // (조작 시도자에게 게시글 존재 여부/차단 여부 정보를 흘리지 않기 위함).
  if (!rateLimiter.allow(`${getClientIp(req)}:${postId}`)) {
    res.status(200).json({ ok: true, counted: false });
    return;
  }

  const supabase = createSupabaseServiceClient();

  // 존재하는 published 게시글만 집계. increment_post_view 함수 본문도 published만 +1 하지만,
  // 여기서 먼저 확인해 없는 글/비공개 글에 대한 불필요한 rpc 호출을 줄이고 404를 구분한다.
  const { data: post, error: lookupError } = await supabase
    .from('posts')
    .select('id, status')
    .eq('id', postId)
    .maybeSingle();

  if (lookupError) {
    console.error('[board/view] post lookup failed:', lookupError.message);
    res.status(500).json({ error: 'internal_error' });
    return;
  }
  if (!post || post.status !== 'published') {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  const { error: rpcError } = await supabase.rpc('increment_post_view', { p_post_id: postId });
  if (rpcError) {
    console.error('[board/view] increment_post_view rpc failed:', rpcError.message);
    res.status(500).json({ error: 'internal_error' });
    return;
  }

  res.status(200).json({ ok: true, counted: true });
}
