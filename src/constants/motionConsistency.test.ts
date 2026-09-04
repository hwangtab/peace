import fs from 'fs';
import path from 'path';

/**
 * 스크롤 등장 애니메이션 리듬 통일 가드.
 * whileInView 를 쓰는 요소가 시작 오프셋·도착 상태를 직접 쓰면 페이지마다 등장 거리·방향이
 * 달라져 "뒤죽박죽"으로 보인다(2026-09 실측: 한 페이지 안에 10/16/20/40px 혼재).
 * 반드시 useScrollReveal 의 itemHidden/itemVisible(패턴 B) 또는 variants(패턴 A)를 쓴다.
 */
const ROOTS = ['src/components', 'src/pages', 'pages'].map((p) =>
  path.resolve(__dirname, '../..', p)
);

const walk = (dir: string, out: string[] = []): string[] => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (full.endsWith('.tsx') && !full.includes('.test.')) out.push(full);
  }
  return out;
};

describe('scroll reveal consistency', () => {
  const files = ROOTS.filter(fs.existsSync).flatMap((r) => walk(r));

  it('whileInView elements take their states from useScrollReveal, not inline literals', () => {
    const offenders = files.filter((f) => /whileInView=\{\{/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders.map((f) => path.relative(process.cwd(), f))).toEqual([]);
  });

  it('no custom viewport config outside the shared SCROLL_VIEWPORT', () => {
    const offenders = files.filter((f) => /viewport=\{\{/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders.map((f) => path.relative(process.cwd(), f))).toEqual([]);
  });

  it('no locally defined reveal variants with hardcoded offsets', () => {
    // whileInView 대신 useInView + animate 로 같은 스크롤 reveal 을 만들면서 로컬
    // variants 에 y:20 / x:±20 을 적어두면 위 두 검사를 통과하면서 리듬만 어긋난다
    // (2026-09 실측: /album/about 이 y:20 + stagger 0.1 + margin -100px 로 이탈).
    // 방향성 있는 커스텀 오프셋(타임라인의 좌우 대칭 슬라이드 등)은 모양을 유지하되 거리는
    // REVEAL_DISTANCE 에서 받아야 한다 — 0 이 아닌 숫자 리터럴만 이탈로 본다.
    const offenders = files.filter((f) => {
      const src = fs.readFileSync(f, 'utf8');
      return [...src.matchAll(/hidden:\s*\{([^}]*)\}/g)].some((block) =>
        [...block[1].matchAll(/\b[xy]:\s*([^,}]+)/g)].some((assign) =>
          /(^|[?:\s])-?[1-9]\d*(\.\d+)?/.test(assign[1])
        )
      );
    });
    expect(offenders.map((f) => path.relative(process.cwd(), f))).toEqual([]);
  });

  it('no bespoke useInView margin for scroll reveals', () => {
    const offenders = files.filter((f) =>
      /useInView\([^)]*margin/.test(fs.readFileSync(f, 'utf8'))
    );
    expect(offenders.map((f) => path.relative(process.cwd(), f))).toEqual([]);
  });
});
