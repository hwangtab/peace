#!/usr/bin/env node
/**
 * 13개 로케일의 translation namespace 키를 ko 기준으로 비교해 드리프트 감사.
 *
 * - extra: 다른 로케일엔 있는데 ko 엔 없는 키 (코드와 어긋난 stale 가능성)
 * - missing: ko 엔 있는데 다른 로케일엔 없는 키 (미번역)
 *
 * 자동 수정은 하지 않음. 수동 검토 후 결정 필요.
 *
 * Usage: node scripts/audit-i18n-drift.js [namespace]
 *   namespace 기본값: 'translation'. 'gangjeong', 'album' 도 가능.
 */
const fs = require('fs');
const path = require('path');

const ns = process.argv[2] || 'translation';
const LOCALES_DIR = path.join(__dirname, '..', 'public', 'locales');
const locales = fs.readdirSync(LOCALES_DIR).filter((d) =>
  fs.statSync(path.join(LOCALES_DIR, d)).isDirectory(),
);

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

const baseFile = path.join(LOCALES_DIR, 'ko', `${ns}.json`);
if (!fs.existsSync(baseFile)) {
  console.error(`Base file not found: ${baseFile}`);
  process.exit(1);
}
const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
const baseKeys = new Set(flatKeys(base));

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

console.log('\n=== Summary ===');
console.table(summary);
