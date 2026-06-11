#!/usr/bin/env node
/**
 * 특정 top-level translation 그룹을 별도 i18next namespace 로 분리.
 *
 * Usage:
 *   node scripts/split-i18n-namespace.js <groupName> [namespaceFileName]
 *
 * Example:
 *   node scripts/split-i18n-namespace.js album        # → album.json
 *   node scripts/split-i18n-namespace.js gangjeong_story gangjeong  # → gangjeong.json
 *
 * 동작:
 * - 모든 로케일의 translation.json 에서 <groupName>.* 키 제거
 * - public/locales/<locale>/<namespaceFile>.json 새로 생성, group 의 자식 키들을
 *   top-level 로 저장 (래퍼 제거)
 *
 * 실행 후:
 * 1) next-i18next.config.js 의 ns 배열에 새 namespace 추가
 * 2) 페이지의 serverSideTranslations 에 새 namespace 명시
 * 3) 컴포넌트의 useTranslation('<namespace>') 변경 + t() 호출에서 prefix 제거
 *    (자동화: scripts 의 sed/python regex 패턴 참고)
 */
const fs = require('fs');
const path = require('path');

const groupName = process.argv[2];
const nsFile = process.argv[3] || groupName;

if (!groupName) {
  console.error('Usage: node split-i18n-namespace.js <groupName> [namespaceFile]');
  process.exit(1);
}

const LOCALES_DIR = path.join(__dirname, '..', 'public', 'locales');
const locales = fs
  .readdirSync(LOCALES_DIR)
  .filter((d) => fs.statSync(path.join(LOCALES_DIR, d)).isDirectory());

let movedCount = 0;
for (const locale of locales) {
  const tFile = path.join(LOCALES_DIR, locale, 'translation.json');
  const targetFile = path.join(LOCALES_DIR, locale, `${nsFile}.json`);
  if (!fs.existsSync(tFile)) continue;
  const t = JSON.parse(fs.readFileSync(tFile, 'utf8'));
  if (!t[groupName]) {
    console.log(`[${locale}] no '${groupName}' group, skip`);
    continue;
  }
  fs.writeFileSync(targetFile, JSON.stringify(t[groupName], null, 2) + '\n');
  delete t[groupName];
  fs.writeFileSync(tFile, JSON.stringify(t, null, 2) + '\n');
  console.log(`[${locale}] moved ${groupName} → ${nsFile}.json`);
  movedCount++;
}
console.log(`\nTotal locales updated: ${movedCount}`);
