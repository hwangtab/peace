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
});
