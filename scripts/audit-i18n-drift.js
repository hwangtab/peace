#!/usr/bin/env node
/**
 * i18n 드리프트 감사 — 두 가지 검사를 수행한다.
 *
 * (1) KEY PARITY (ko 기준): 지정한 namespace 하나에 대해 키 존재 여부를 ko 와 비교.
 *   - extra: 다른 로케일엔 있는데 ko 엔 없는 키 (코드와 어긋난 stale 가능성)
 *   - missing: ko 엔 있는데 다른 로케일엔 없는 키 (미번역 — 키 자체가 빠짐)
 *
 * (2) IDENTICAL-LEAF DRIFT (en 기준): 모든 namespace × 모든 비-en 로케일에서
 *     leaf 값이 en 과 byte-identical 한 비율을 계산. 키는 존재하지만 값이 영어
 *     그대로 노출되는 "미번역"을 잡는다. key parity 검사는 이걸 못 잡는다
 *     (키가 있으니 missing=0 으로 통과). 임계치(기본 40%) 초과 시 경고.
 *
 * 자동 수정은 하지 않음. 수동 검토 후 결정 필요.
 *
 * Usage:
 *   node scripts/audit-i18n-drift.js [namespace] [--strict] [--threshold=40]
 *     namespace  key-parity 검사 대상. 기본값 'translation'. 'gangjeong', 'album' 등.
 *     --strict   identical-leaf 임계치 초과가 있으면 종료 코드 1 (CI 실패용).
 *                기본은 경고만 출력하고 종료 코드 0.
 *     --threshold=N  identical-leaf 경고 임계치(%). 기본 40.
 */
const fs = require('fs');
const path = require('path');

// ---- CLI 파싱: 플래그(--foo)와 위치 인자(namespace) 분리 ----
const argv = process.argv.slice(2);
const flags = argv.filter((a) => a.startsWith('--'));
const positional = argv.filter((a) => !a.startsWith('--'));
const STRICT = flags.includes('--strict');
const thresholdFlag = flags.find((f) => f.startsWith('--threshold='));
const IDENTICAL_THRESHOLD = thresholdFlag ? Number(thresholdFlag.split('=')[1]) : 40;

const ns = positional[0] || 'translation';
const LOCALES_DIR = path.join(__dirname, '..', 'public', 'locales');
const locales = fs
  .readdirSync(LOCALES_DIR)
  .filter((d) => fs.statSync(path.join(LOCALES_DIR, d)).isDirectory());

function flatKeys(obj, prefix = '', out = []) {
  for (const k in obj) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      flatKeys(obj[k], path, out);
    } else {
      out.push(path);
    }
  }
  return out;
}

// leaf 경로 -> 값 (identical 비교용)
function flatEntries(obj, prefix = '', out = {}) {
  for (const k in obj) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      flatEntries(obj[k], p, out);
    } else {
      out[p] = obj[k];
    }
  }
  return out;
}

// =====================================================================
// (1) KEY PARITY — ko 기준, 단일 namespace
// =====================================================================
const baseFile = path.join(LOCALES_DIR, 'ko', `${ns}.json`);
if (!fs.existsSync(baseFile)) {
  console.error(`Base file not found: ${baseFile}`);
  process.exit(1);
}
const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
const baseKeys = new Set(flatKeys(base));

console.log('=== KEY PARITY (ko 기준) ===');
console.log(`Namespace: ${ns}`);
console.log(`ko (baseline) keys: ${baseKeys.size}\n`);

const summary = [];
for (const locale of locales) {
  if (locale === 'ko') continue;
  const file = path.join(LOCALES_DIR, locale, `${ns}.json`);
  if (!fs.existsSync(file)) {
    console.log(`[${locale}] file missing`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const keys = new Set(flatKeys(data));
  const extra = [...keys].filter((k) => !baseKeys.has(k));
  const missing = [...baseKeys].filter((k) => !keys.has(k));
  summary.push({ locale, total: keys.size, extra: extra.length, missing: missing.length });
  if (extra.length || missing.length) {
    console.log(`[${locale}] total=${keys.size}  extra=${extra.length}  missing=${missing.length}`);
    if (extra.length && extra.length <= 10) {
      extra.slice(0, 10).forEach((k) => console.log(`    +${k}`));
    } else if (extra.length) {
      console.log(`    + (${extra.length} extra keys)`);
    }
    if (missing.length && missing.length <= 10) {
      missing.slice(0, 10).forEach((k) => console.log(`    -${k}`));
    } else if (missing.length) {
      console.log(`    - (${missing.length} missing keys)`);
    }
  }
}

console.log('\n=== Summary (key parity) ===');
console.table(summary);

// =====================================================================
// (2) IDENTICAL-LEAF DRIFT — en 기준, 모든 namespace × 모든 로케일
// =====================================================================

// namespace 단위 허용 목록: 전체가 en 과 동일해도 정상인 파일.
//
// camp_staff_2026:
//   기획단 전용 비공개 내부 페이지의 자리채우기다. 11개 비-en 로케일이 en 과
//   100% 동일한 것은 "미번역"이 아니라 의도된 상태 — 이 페이지는 대외 공개되지
//   않으므로 영어 원문만 채워 두고 번역을 하지 않는다. 절대 번역 대상 아님.
//   (2026-07 i18n 품질 감사에서 확인·확정된 사실. 미래에 이 파일이 40% 임계치를
//   넘는다고 번역하려 들지 말 것.)
const IDENTICAL_ALLOWLIST_NS = new Set(['camp_staff_2026']);

// 개별 키 허용 목록: 값이 en 과 동일해도 정당한 leaf. 형식 `${locale}/${ns}:${flatKey}`.
// (브랜드명·국제 통용어·해당 언어에서 표준으로 굳은 차용어 등.)
const IDENTICAL_ALLOWLIST_KEYS = new Set([
  // 인도네시아어: 아래 UI 용어는 en 과 철자가 같은 표준 차용어다.
  'id/board:post.rating', // "Rating" — 인니 UI 표준 차용어 (오류 메시지도 "rating" 사용)
  'id/board:post.edit', // "Edit" — 인니 앱 UI 표준 차용어
  'id/board:comment.edit', // "Edit"
  'id/auth:common.email', // "Email" — 인니어 표준어
  'id/auth:account.email', // "Email"
  // 프랑스어: "Photos" 는 en 과 철자가 같은 정상 동족어(cognate).
  'fr/board:post.images',
]);

const enDir = path.join(LOCALES_DIR, 'en');
const enNamespaces = fs.existsSync(enDir)
  ? fs
      .readdirSync(enDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))
  : [];

console.log('\n\n=== IDENTICAL-LEAF DRIFT (en 기준) ===');
console.log(`임계치: ${IDENTICAL_THRESHOLD}% (초과 시 경고${STRICT ? ', --strict → 실패' : ''})`);
console.log(`허용 namespace: ${[...IDENTICAL_ALLOWLIST_NS].join(', ') || '(없음)'}`);
console.log(`허용 개별 키: ${IDENTICAL_ALLOWLIST_KEYS.size}개\n`);

const violations = [];
const identicalRows = [];

for (const nsName of enNamespaces) {
  const enData = JSON.parse(fs.readFileSync(path.join(enDir, `${nsName}.json`), 'utf8'));
  const enEntries = flatEntries(enData);
  const enKeys = Object.keys(enEntries);
  if (enKeys.length === 0) continue;

  const nsExempt = IDENTICAL_ALLOWLIST_NS.has(nsName);

  for (const locale of locales) {
    if (locale === 'en') continue;
    const file = path.join(LOCALES_DIR, locale, `${nsName}.json`);
    if (!fs.existsSync(file)) continue;
    const data = flatEntries(JSON.parse(fs.readFileSync(file, 'utf8')));

    // 허용 키를 제외한 identical leaf 목록
    const identicalKeys = enKeys.filter(
      (k) => data[k] === enEntries[k] && !IDENTICAL_ALLOWLIST_KEYS.has(`${locale}/${nsName}:${k}`)
    );
    const pct = Math.round((identicalKeys.length / enKeys.length) * 1000) / 10;

    if (nsExempt) continue; // 허용 namespace 는 집계/경고에서 제외
    if (pct >= IDENTICAL_THRESHOLD) {
      identicalRows.push({
        ns: nsName,
        locale,
        identical: identicalKeys.length,
        total: enKeys.length,
        pct,
      });
      violations.push({ ns: nsName, locale, pct, keys: identicalKeys });
    }
  }
}

if (violations.length === 0) {
  console.log(`✅ 임계치(${IDENTICAL_THRESHOLD}%)를 넘는 namespace × 로케일 없음.`);
} else {
  console.log(`⚠️  임계치 초과 ${violations.length}건:\n`);
  console.table(identicalRows);
  // ns 별로 대표 예시 몇 개 출력
  const shown = new Set();
  for (const v of violations) {
    if (shown.has(v.ns)) continue; // ns 당 한 번만 예시
    shown.add(v.ns);
    console.log(`  [${v.ns}] 예: ${v.keys.slice(0, 8).join(', ')}${v.keys.length > 8 ? ' …' : ''}`);
  }
}

if (STRICT && violations.length > 0) {
  console.error(`\n--strict: identical-leaf 드리프트 ${violations.length}건으로 실패 처리합니다.`);
  process.exitCode = 1;
}
