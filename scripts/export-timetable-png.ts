/**
 * 2026 캠프 타임테이블을 날짜별 PNG 이미지로 추출한다.
 *
 * 실행:
 *   npx ts-node --transpile-only scripts/export-timetable-png.ts
 *
 * 출력:
 *   public/images/camps/2026/timetable/2026-06-05.png
 *   public/images/camps/2026/timetable/2026-06-06.png
 *   public/images/camps/2026/timetable/2026-06-07.png
 */
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { timetable2026 } from '../src/data/timetable-2026';
import type { TimetableAct, TimetableDay, Weekday } from '../src/components/camp/timetable/types';

interface MusicianLite {
  id: number;
  name: string;
  shortDescription: string;
  imageUrl: string;
}

const REPO_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');
const OUT_DIR = path.join(PUBLIC_DIR, 'images', 'camps', '2026', 'timetable');
const WIDTH_PX = 1080;

type DayMood = {
  headerGradient: string;
  accentHex: string;
  dayBadgeHex: string;
  panelTint: string;
  railGradient: string;
};

const DAY_MOOD: Record<Weekday, DayMood> = {
  fri: {
    headerGradient: 'linear-gradient(135deg, #0A5F8A 0%, #1A2332 100%)',
    accentHex: '#0A5F8A',
    dayBadgeHex: '#FDB44B',
    panelTint: 'linear-gradient(180deg, rgba(184,216,232,0.25) 0%, rgba(255,255,255,0) 60%)',
    railGradient: 'linear-gradient(180deg, #0A5F8A 0%, #1A2332 100%)',
  },
  sat: {
    headerGradient: 'linear-gradient(135deg, #0A5F8A 0%, #4A90B8 100%)',
    accentHex: '#0A5F8A',
    dayBadgeHex: '#FDB44B',
    panelTint: 'linear-gradient(180deg, rgba(184,216,232,0.35) 0%, rgba(255,255,255,0) 60%)',
    railGradient: 'linear-gradient(180deg, #4A90B8 0%, #0A5F8A 100%)',
  },
  sun: {
    headerGradient: 'linear-gradient(135deg, #FDB44B 0%, #FF6B4A 60%, #D94B2E 100%)',
    accentHex: '#D94B2E',
    dayBadgeHex: '#FFFFFF',
    panelTint: 'linear-gradient(180deg, rgba(253,180,75,0.18) 0%, rgba(255,255,255,0) 60%)',
    railGradient: 'linear-gradient(180deg, #FDB44B 0%, #FF8C69 100%)',
  },
};

function loadMusicians(): Map<number, MusicianLite> {
  const raw = fs.readFileSync(path.join(PUBLIC_DIR, 'data', 'musicians.json'), 'utf-8');
  const arr = JSON.parse(raw) as MusicianLite[];
  const map = new Map<number, MusicianLite>();
  for (const m of arr) map.set(m.id, m);
  return map;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fileUrl(absPath: string): string {
  return 'file://' + absPath;
}

function dataUrl(absPath: string): string {
  const ext = path.extname(absPath).toLowerCase().replace('.', '');
  const mime = ext === 'webp' ? 'image/webp'
    : ext === 'png' ? 'image/png'
    : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
    : 'application/octet-stream';
  const b64 = fs.readFileSync(absPath).toString('base64');
  return `data:${mime};base64,${b64}`;
}

function fontDataUrl(absPath: string): string {
  const b64 = fs.readFileSync(absPath).toString('base64');
  return `data:font/woff2;base64,${b64}`;
}

function getInitials(name: string): string {
  if (name.length <= 2) return name.slice(0, 1);
  return name.slice(0, 2);
}

function renderCard(act: TimetableAct, musicians: Map<number, MusicianLite>, mood: DayMood): string {
  const m = act.musicianIds && act.musicianIds.length > 0 ? musicians.get(act.musicianIds[0]!) : undefined;
  const imgAbs = m ? path.join(PUBLIC_DIR, m.imageUrl.replace(/^\//, '')) : '';
  const hasImg = m && fs.existsSync(imgAbs);
  const bio = m?.shortDescription ?? '';

  const imgBlock = hasImg
    ? `<img src="${dataUrl(imgAbs)}" alt="" class="portrait" />`
    : `<div class="portrait placeholder" style="background:${mood.accentHex}">${escapeHtml(getInitials(act.name))}</div>`;

  return `
    <article class="card">
      <div class="time-col">
        <div class="time-start" style="color:${mood.accentHex}">${escapeHtml(act.start)}</div>
        <div class="time-sep"></div>
        <div class="time-end">${escapeHtml(act.end)}</div>
      </div>
      ${imgBlock}
      <div class="content">
        <div class="name">${escapeHtml(act.name)}</div>
        ${bio ? `<div class="bio">${escapeHtml(bio)}</div>` : ''}
      </div>
    </article>
  `;
}

function renderTransition(act: TimetableAct): string {
  const mins = act.transitionMinutes ?? 5;
  return `<div class="transition"><span>↓ ${mins}분 전환</span></div>`;
}

function renderPage(day: TimetableDay, musicians: Map<number, MusicianLite>): string {
  const mood = DAY_MOOD[day.weekday];
  const weekdayLabel = { fri: '금', sat: '토', sun: '일' }[day.weekday];
  const fontDir = path.join(PUBLIC_DIR, 'fonts');
  const fontPretendard = fontDataUrl(path.join(fontDir, 'Pretendard-Regular.woff2'));
  const fontPartial = fontDataUrl(path.join(fontDir, 'PartialSansKR-Regular.woff2'));
  const fontGmarketMed = fontDataUrl(path.join(fontDir, 'GmarketSansMedium.woff2'));
  const fontGmarketBold = fontDataUrl(path.join(fontDir, 'GmarketSansBold.woff2'));

  const body = day.acts
    .map((a) => (a.type === 'transition' ? renderTransition(a) : renderCard(a, musicians, mood)))
    .join('\n');

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<style>
  @font-face { font-family:"Pretendard"; src:url("${fontPretendard}") format("woff2"); font-weight:400; font-display:block; }
  @font-face { font-family:"PartialSansKR"; src:url("${fontPartial}") format("woff2"); font-weight:400; font-display:block; }
  @font-face { font-family:"GmarketSans"; src:url("${fontGmarketMed}") format("woff2"); font-weight:500; font-display:block; }
  @font-face { font-family:"GmarketSans"; src:url("${fontGmarketBold}") format("woff2"); font-weight:700; font-display:block; }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    font-family: "Pretendard", system-ui, -apple-system, sans-serif;
    color: #1A2332;
    background: #D4E9F7;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  body { width: ${WIDTH_PX}px; }

  .page {
    display: flex;
    flex-direction: column;
    background:
      ${mood.panelTint},
      #FFFFFF;
    min-height: 100vh;
  }

  header.hero {
    position: relative;
    padding: 56px 48px 64px;
    background: ${mood.headerGradient};
    color: #FFFFFF;
    text-shadow: 0 1px 3px rgba(0,0,0,0.22);
  }
  header.hero::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 55%);
    pointer-events: none;
  }
  header.hero > * { position: relative; z-index: 1; }
  header.hero .kicker {
    font-size: 18px;
    letter-spacing: 0.08em;
    opacity: 0.95;
    margin-bottom: 10px;
    font-weight: 500;
  }
  header.hero h1 {
    font-family: "PartialSansKR", "Pretendard", sans-serif;
    font-weight: 400;
    font-size: 88px;
    line-height: 1.0;
    letter-spacing: -0.01em;
  }
  header.hero h1 .day {
    font-family: "GmarketSans", "PartialSansKR", sans-serif;
    color: ${mood.dayBadgeHex};
  }
  header.hero .meta {
    margin-top: 24px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.02em;
    opacity: 1;
  }
  header.hero .venue {
    margin-top: 10px;
    font-size: 18px;
    opacity: 0.95;
  }
  header.hero::after {
    content: "";
    position: absolute;
    left: 0; right: 0; bottom: -1px;
    height: 40px;
    background: inherit;
    clip-path: polygon(0 0, 100% 0, 100% 30%, 95% 45%, 85% 60%, 70% 75%, 50% 85%, 30% 80%, 15% 65%, 5% 50%, 0 35%);
  }

  main {
    position: relative;
    padding: 72px 48px 72px 120px;
    overflow: visible;
  }
  main .rail {
    position: absolute;
    left: 80px;
    top: 40px;
    bottom: 40px;
    width: 4px;
    border-radius: 2px;
    background: ${mood.railGradient};
    opacity: 0.6;
  }

  .card {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 18px 22px;
    background: #FFFFFF;
    border-radius: 18px;
    box-shadow: 0 4px 14px rgba(26, 35, 50, 0.08);
    margin-bottom: 12px;
    position: relative;
  }

  .time-col {
    flex-shrink: 0;
    width: 80px;
    text-align: center;
  }
  .time-start {
    font-family: "GmarketSans", "Pretendard", sans-serif;
    font-weight: 700;
    font-size: 28px;
    line-height: 1.0;
    font-variant-numeric: tabular-nums;
  }
  .time-sep {
    width: 20px;
    height: 1px;
    background: rgba(107, 124, 138, 0.35);
    margin: 7px auto;
  }
  .time-end {
    font-size: 15px;
    color: #6B7C8A;
    font-variant-numeric: tabular-nums;
  }

  .portrait {
    flex-shrink: 0;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #FFFFFF;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    background: #E6EEF3;
  }
  .portrait.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-weight: 700;
    font-size: 28px;
  }

  .content {
    flex: 1;
    min-width: 0;
  }
  .name {
    font-family: "GmarketSans", "Pretendard", sans-serif;
    font-weight: 700;
    font-size: 24px;
    color: #1A2332;
    line-height: 1.2;
    word-break: keep-all;
    overflow-wrap: anywhere;
  }
  .bio {
    margin-top: 8px;
    font-size: 16px;
    color: #4B5562;
    line-height: 1.45;
    word-break: keep-all;
  }

  .transition {
    display: flex;
    justify-content: center;
    margin: 4px 0;
  }
  .transition span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
    color: #6B7C8A;
    background: #F8F9FA;
    padding: 4px 12px;
    border-radius: 999px;
  }

  footer.brand {
    padding: 40px 48px 56px;
    background: #FFFFFF;
    text-align: center;
    border-top: 1px solid rgba(10, 95, 138, 0.08);
  }
  footer.brand .line1 {
    font-family: "GmarketSans", "Pretendard", sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: #0A5F8A;
    letter-spacing: 0.02em;
  }
  footer.brand .line2 {
    margin-top: 8px;
    font-size: 14px;
    color: #6B7C8A;
  }
</style>
</head>
<body>
<div class="page">
  <header class="hero">
    <div class="kicker">2026 강정피스앤뮤직캠프 · 타임테이블</div>
    <h1><span class="day">${day.dayLabel.split(' ')[0]}</span> <span>${weekdayLabel}요일</span></h1>
    <div class="meta">${escapeHtml(day.startTime)} – ${escapeHtml(day.endTime)} · ${day.teamCount}팀</div>
    <div class="venue">강정체육공원</div>
  </header>

  <main>
    <div class="rail"></div>
    ${body}
  </main>

  <footer class="brand">
    <div class="line1">GPMC3 · 2026.06.05 – 06.07</div>
    <div class="line2">peaceandmusic.net/camps/2026</div>
  </footer>
</div>
</body>
</html>`;
}

const COMBINED_WIDTH_PX = 2100;
const COMBINED_COL_WIDTH_PX = 660;

function renderCompactCard(act: TimetableAct, musicians: Map<number, MusicianLite>, mood: DayMood): string {
  const m = act.musicianIds && act.musicianIds.length > 0 ? musicians.get(act.musicianIds[0]!) : undefined;
  const imgAbs = m ? path.join(PUBLIC_DIR, m.imageUrl.replace(/^\//, '')) : '';
  const hasImg = m && fs.existsSync(imgAbs);
  const bio = m?.shortDescription ?? '';

  const imgBlock = hasImg
    ? `<img src="${dataUrl(imgAbs)}" alt="" class="c-portrait" />`
    : `<div class="c-portrait c-placeholder" style="background:${mood.accentHex}">${escapeHtml(getInitials(act.name))}</div>`;

  return `
    <article class="c-card">
      <div class="c-time-col">
        <div class="c-time-start" style="color:${mood.accentHex}">${escapeHtml(act.start)}</div>
        <div class="c-time-end">${escapeHtml(act.end)}</div>
      </div>
      ${imgBlock}
      <div class="c-content">
        <div class="c-name">${escapeHtml(act.name)}</div>
        ${bio ? `<div class="c-bio">${escapeHtml(bio)}</div>` : ''}
      </div>
    </article>
  `;
}

function renderCompactTransition(act: TimetableAct): string {
  const mins = act.transitionMinutes ?? 5;
  return `<div class="c-transition"><span>↓ ${mins}분</span></div>`;
}

function renderDayColumn(day: TimetableDay, musicians: Map<number, MusicianLite>): string {
  const mood = DAY_MOOD[day.weekday];
  const weekdayLabel = { fri: '금요일', sat: '토요일', sun: '일요일' }[day.weekday];
  const body = day.acts
    .map((a) => (a.type === 'transition' ? renderCompactTransition(a) : renderCompactCard(a, musicians, mood)))
    .join('\n');
  return `
    <section class="c-column">
      <header class="c-day-header" style="background:${mood.headerGradient}">
        <div class="c-day-title">
          <span class="c-day-num" style="color:${mood.dayBadgeHex}">${escapeHtml(day.dayLabel.split(' ')[0] ?? day.dayLabel)}</span>
          <span class="c-day-name">${weekdayLabel}</span>
        </div>
        <div class="c-day-meta">${escapeHtml(day.startTime)} – ${escapeHtml(day.endTime)} · ${day.teamCount}팀</div>
      </header>
      <div class="c-rail-wrap">
        <div class="c-rail" style="background:${mood.railGradient}"></div>
        <div class="c-cards">
          ${body}
        </div>
      </div>
    </section>
  `;
}

function renderCombinedPage(days: TimetableDay[], musicians: Map<number, MusicianLite>): string {
  const fontDir = path.join(PUBLIC_DIR, 'fonts');
  const fontPretendard = fontDataUrl(path.join(fontDir, 'Pretendard-Regular.woff2'));
  const fontPartial = fontDataUrl(path.join(fontDir, 'PartialSansKR-Regular.woff2'));
  const fontGmarketMed = fontDataUrl(path.join(fontDir, 'GmarketSansMedium.woff2'));
  const fontGmarketBold = fontDataUrl(path.join(fontDir, 'GmarketSansBold.woff2'));
  const columns = days.map((d) => renderDayColumn(d, musicians)).join('\n');

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<style>
  @font-face { font-family:"Pretendard"; src:url("${fontPretendard}") format("woff2"); font-weight:400; font-display:block; }
  @font-face { font-family:"PartialSansKR"; src:url("${fontPartial}") format("woff2"); font-weight:400; font-display:block; }
  @font-face { font-family:"GmarketSans"; src:url("${fontGmarketMed}") format("woff2"); font-weight:500; font-display:block; }
  @font-face { font-family:"GmarketSans"; src:url("${fontGmarketBold}") format("woff2"); font-weight:700; font-display:block; }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    font-family: "Pretendard", system-ui, -apple-system, sans-serif;
    color: #1A2332;
    background: #F8FAFC;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  body { width: ${COMBINED_WIDTH_PX}px; }

  .page-combined {
    display: flex;
    flex-direction: column;
    background: #FFFFFF;
  }

  header.hero-combined {
    position: relative;
    padding: 60px 60px 52px;
    background: linear-gradient(135deg, #0A5F8A 0%, #1A2332 100%);
    color: #FFFFFF;
    text-shadow: 0 1px 3px rgba(0,0,0,0.22);
  }
  header.hero-combined::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 60%);
  }
  header.hero-combined > * { position: relative; z-index: 1; }
  header.hero-combined .h-kicker {
    font-size: 20px;
    letter-spacing: 0.1em;
    opacity: 0.9;
    margin-bottom: 16px;
    font-weight: 500;
  }
  header.hero-combined .h-title {
    display: flex;
    align-items: baseline;
    gap: 24px;
    flex-wrap: wrap;
  }
  header.hero-combined .h-title h1 {
    font-family: "PartialSansKR", "Pretendard", sans-serif;
    font-weight: 400;
    font-size: 84px;
    line-height: 1;
    letter-spacing: -0.01em;
  }
  header.hero-combined .h-title .h-dates {
    font-family: "GmarketSans", "Pretendard", sans-serif;
    font-weight: 700;
    font-size: 38px;
    color: #FDB44B;
    letter-spacing: 0.02em;
  }
  header.hero-combined .h-venue {
    margin-top: 14px;
    font-size: 20px;
    opacity: 0.9;
  }

  main.c-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
  }

  .c-column {
    border-right: 1px solid rgba(10, 95, 138, 0.08);
    min-width: 0;
  }
  .c-column:last-child { border-right: none; }

  .c-day-header {
    padding: 28px 32px 24px;
    color: #FFFFFF;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    position: relative;
  }
  .c-day-header::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 50%);
  }
  .c-day-header > * { position: relative; z-index: 1; }
  .c-day-title {
    display: flex;
    align-items: baseline;
    gap: 14px;
  }
  .c-day-num {
    font-family: "GmarketSans", "PartialSansKR", sans-serif;
    font-weight: 700;
    font-size: 44px;
    line-height: 1;
  }
  .c-day-name {
    font-family: "PartialSansKR", "Pretendard", sans-serif;
    font-weight: 400;
    font-size: 30px;
  }
  .c-day-meta {
    margin-top: 10px;
    font-size: 15px;
    font-weight: 500;
    opacity: 0.95;
  }

  .c-rail-wrap {
    position: relative;
    padding: 24px 28px 28px 56px;
  }
  .c-rail {
    position: absolute;
    left: 32px;
    top: 20px;
    bottom: 20px;
    width: 3px;
    border-radius: 2px;
    opacity: 0.55;
  }
  .c-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .c-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: #FFFFFF;
    border: 1px solid rgba(10, 95, 138, 0.08);
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(26, 35, 50, 0.05);
  }
  .c-time-col {
    flex-shrink: 0;
    width: 56px;
    text-align: center;
  }
  .c-time-start {
    font-family: "GmarketSans", "Pretendard", sans-serif;
    font-weight: 700;
    font-size: 18px;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .c-time-end {
    margin-top: 4px;
    font-size: 11px;
    color: #6B7C8A;
    font-variant-numeric: tabular-nums;
  }
  .c-portrait {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #FFFFFF;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    background: #E6EEF3;
  }
  .c-portrait.c-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-weight: 700;
    font-size: 18px;
  }
  .c-content { flex: 1; min-width: 0; }
  .c-name {
    font-family: "GmarketSans", "Pretendard", sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: #1A2332;
    line-height: 1.25;
    word-break: keep-all;
    overflow-wrap: anywhere;
  }
  .c-bio {
    margin-top: 4px;
    font-size: 12px;
    color: #4B5562;
    line-height: 1.45;
    word-break: keep-all;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .c-transition {
    display: flex;
    justify-content: center;
    margin: 2px 0;
  }
  .c-transition span {
    font-size: 11px;
    color: #8A97A2;
    background: rgba(107, 124, 138, 0.08);
    padding: 2px 8px;
    border-radius: 999px;
  }

  footer.brand-combined {
    padding: 36px 60px 44px;
    background: #F8FAFC;
    text-align: center;
    border-top: 1px solid rgba(10, 95, 138, 0.1);
  }
  footer.brand-combined .f-line1 {
    font-family: "GmarketSans", "Pretendard", sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: #0A5F8A;
    letter-spacing: 0.02em;
  }
  footer.brand-combined .f-line2 {
    margin-top: 6px;
    font-size: 14px;
    color: #6B7C8A;
  }
</style>
</head>
<body>
<div class="page-combined">
  <header class="hero-combined">
    <div class="h-kicker">2026 강정피스앤뮤직캠프 · GPMC3 · 타임테이블</div>
    <div class="h-title">
      <h1>강정의 사흘</h1>
      <span class="h-dates">2026.06.05 — 06.07</span>
    </div>
    <div class="h-venue">강정체육공원 · 제주 서귀포 강정마을</div>
  </header>
  <main class="c-grid">
    ${columns}
  </main>
  <footer class="brand-combined">
    <div class="f-line1">peaceandmusic.net/camps/2026</div>
    <div class="f-line2">총 54팀 · 3일 · 강정체육공원</div>
  </footer>
</div>
</body>
</html>`;
}

async function main(): Promise<void> {
  const musicians = loadMusicians();
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  try {
    // 날짜별 단일 페이지 3장
    for (const day of timetable2026.days) {
      const page = await browser.newPage();
      await page.setViewport({ width: WIDTH_PX, height: 1200, deviceScaleFactor: 2 });
      const html = renderPage(day, musicians);
      await page.setContent(html, { waitUntil: 'load' as const });
      await page.evaluateHandle('document.fonts.ready');

      const outPath = path.join(OUT_DIR, `${day.date}.png`);
      await page.screenshot({ path: outPath as `${string}.png`, fullPage: true, type: 'png' });
      console.log(`✅ ${path.relative(REPO_ROOT, outPath)}`);
      await page.close();
    }

    // 3일 일정을 한 페이지에 담은 버전
    const page = await browser.newPage();
    await page.setViewport({ width: COMBINED_WIDTH_PX, height: 1600, deviceScaleFactor: 2 });
    const html = renderCombinedPage(timetable2026.days, musicians);
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluateHandle('document.fonts.ready');

    const outPath = path.join(OUT_DIR, 'all.png');
    await page.screenshot({ path: outPath as `${string}.png`, fullPage: true, type: 'png' });
    console.log(`✅ ${path.relative(REPO_ROOT, outPath)}`);
    await page.close();
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
