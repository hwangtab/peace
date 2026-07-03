import { z } from 'zod';

// 조회수 증가 API 입력 스키마. posts.id는 uuid.
export const postViewBodySchema = z.object({
  postId: z.string().uuid(),
});

export type PostViewBody = z.infer<typeof postViewBodySchema>;

export interface RateLimiter {
  /**
   * key(예: `${ip}:${postId}`)가 최소 간격을 지났으면 true를 반환하고 호출 시각을 기록한다.
   * 아직 간격 내면 false(차단). now는 테스트를 위해 주입 가능(기본 Date.now()).
   */
  allow(key: string, now?: number): boolean;
  /** 테스트/진단용 현재 추적 중인 키 수. */
  size(): number;
}

/**
 * 모듈 스코프 in-memory 방식의 경량 rate limiter.
 *
 * 주의: Vercel Fluid Compute는 인스턴스를 재사용하므로 같은 인스턴스에 붙는 요청은
 * 이 Map을 공유해 방어가 동작하지만, 요청이 여러 인스턴스로 분산되거나 콜드 스타트로
 * 새 인스턴스가 뜨면 상태가 공유/유지되지 않는다. 따라서 이것은 조회수 조작에 대한
 * 완전한 방어가 아니라, 단일 인스턴스 내 반복 호출을 억제하는 최선의 경량 방어다.
 * (완전한 방어가 필요하면 Redis/Upstash 등 외부 저장소 기반 rate limit이 필요.)
 *
 * 메모리 누수 방지: 항목 수가 maxEntries를 넘으면 만료된(간격을 지난) 항목부터 청소하고,
 * 그래도 넘치면 가장 오래된 항목을 제거한다.
 */
export function createRateLimiter(intervalMs: number, maxEntries: number): RateLimiter {
  const lastSeen = new Map<string, number>();

  const prune = (now: number): void => {
    // 1차: 간격을 지나 더는 차단 역할을 못 하는 만료 항목 제거.
    for (const [key, ts] of lastSeen) {
      if (now - ts >= intervalMs) lastSeen.delete(key);
    }
    // 2차: 그래도 상한 초과면 삽입 순서(가장 오래된)부터 제거.
    while (lastSeen.size > maxEntries) {
      const oldest = lastSeen.keys().next().value;
      if (oldest === undefined) break;
      lastSeen.delete(oldest);
    }
  };

  return {
    allow(key: string, now: number = Date.now()): boolean {
      const prev = lastSeen.get(key);
      if (prev !== undefined && now - prev < intervalMs) {
        return false;
      }
      // 재삽입 순서를 갱신하기 위해 기존 키를 지우고 다시 넣는다(LRU 근사).
      lastSeen.delete(key);
      lastSeen.set(key, now);
      if (lastSeen.size > maxEntries) prune(now);
      return true;
    },
    size(): number {
      return lastSeen.size;
    },
  };
}
