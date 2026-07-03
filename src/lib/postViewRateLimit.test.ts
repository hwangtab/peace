import { postViewBodySchema, createRateLimiter } from './postViewRateLimit';

describe('postViewBodySchema', () => {
  const uuid = '11111111-1111-4111-8111-111111111111';

  it('accepts a valid uuid postId', () => {
    expect(postViewBodySchema.parse({ postId: uuid })).toEqual({ postId: uuid });
  });

  it('rejects a non-uuid postId', () => {
    expect(postViewBodySchema.safeParse({ postId: 'not-a-uuid' }).success).toBe(false);
  });

  it('rejects a missing postId', () => {
    expect(postViewBodySchema.safeParse({}).success).toBe(false);
  });
});

describe('createRateLimiter', () => {
  it('allows the first hit and blocks a repeat within the interval', () => {
    const rl = createRateLimiter(60_000, 100);
    expect(rl.allow('a:post', 0)).toBe(true);
    expect(rl.allow('a:post', 59_999)).toBe(false);
  });

  it('allows again once the interval has elapsed', () => {
    const rl = createRateLimiter(60_000, 100);
    expect(rl.allow('a:post', 0)).toBe(true);
    expect(rl.allow('a:post', 60_000)).toBe(true);
  });

  it('tracks different keys independently', () => {
    const rl = createRateLimiter(60_000, 100);
    expect(rl.allow('a:post', 0)).toBe(true);
    expect(rl.allow('b:post', 0)).toBe(true);
    expect(rl.allow('a:post', 100)).toBe(false);
  });

  it('prunes expired entries so the map does not grow unbounded', () => {
    const rl = createRateLimiter(1_000, 5);
    for (let i = 0; i < 20; i++) {
      rl.allow(`ip${i}:post`, i);
    }
    // 만료 청소 + 상한(5) 강제로 항목 수가 상한 근처로 유지된다.
    expect(rl.size()).toBeLessThanOrEqual(5);
  });

  it('evicts oldest entries when over capacity even before expiry', () => {
    const rl = createRateLimiter(1_000_000, 3);
    rl.allow('k1:p', 0);
    rl.allow('k2:p', 1);
    rl.allow('k3:p', 2);
    rl.allow('k4:p', 3); // 상한 초과 → 가장 오래된 k1 제거
    expect(rl.size()).toBeLessThanOrEqual(3);
    // k1이 밀려났으므로 아직 간격 내여도 다시 허용된다(기록이 사라졌으므로).
    expect(rl.allow('k1:p', 4)).toBe(true);
  });
});
