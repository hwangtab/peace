#!/usr/bin/env node
/**
 * top-level translation 그룹을 별도 namespace 로 분리하되 wrapper 키를 보존.
 * 기존 t('group.x') 호출을 그대로 두고 useTranslation 만 multi-ns 로 바꾸면
 * 동작하도록 한다.
 *
 * Usage:
 *   node scripts/split-i18n-keep-wrapper.js <groupName> [namespaceFile]
 *
 * Example:
 *   node scripts/split-i18n-keep-wrapper.js press
 *   → public/locales/<locale>/press.json 에 { "press": { ... } } 형태 저장
 *     → useTranslation(['translation', 'press']) 로 t('press.x') 그대로 동작
 */
const fs = require('fs');
const path = require('path');

const groupName = process.argv[2];
const nsFile = process.argv[3] || groupName;

if (!groupName) {
  console.error('Usage: node split-i18n-keep-wrapper.js <groupName> [namespaceFile]');
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
  // wrapper 보존: { groupName: { ... } } 형태로 저장
  fs.writeFileSync(targetFile, JSON.stringify({ [groupName]: t[groupName] }, null, 2) + '\n');
  delete t[groupName];
  fs.writeFileSync(tFile, JSON.stringify(t, null, 2) + '\n');
  console.log(`[${locale}] moved ${groupName} → ${nsFile}.json (wrapper preserved)`);
  movedCount++;
}
console.log(`\nTotal locales updated: ${movedCount}`);
