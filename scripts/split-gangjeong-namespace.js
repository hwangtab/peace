#!/usr/bin/env node
/**
 * gangjeong_story 키 그룹을 translation namespace 에서 빼서 gangjeong namespace
 * (gangjeong.json) 로 옮긴다. 13개 로케일 일괄 처리.
 *
 * - public/locales/<locale>/translation.json 의 gangjeong_story.* 키 제거
 * - public/locales/<locale>/gangjeong.json 새 파일로 동일 키들을 top-level 로 저장
 *   (즉 gangjeong_story 래퍼는 제거. 컴포넌트는 useTranslation('gangjeong') +
 *   t('hook_headline') 형태로 호출)
 *
 * 단발성 마이그레이션 스크립트. 실행 후 컴포넌트 t() 호출도 같이 수정해야 동작.
 */
const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'public', 'locales');

const locales = fs.readdirSync(LOCALES_DIR).filter((d) =>
  fs.statSync(path.join(LOCALES_DIR, d)).isDirectory(),
);

let movedCount = 0;
for (const locale of locales) {
  const tFile = path.join(LOCALES_DIR, locale, 'translation.json');
  const gFile = path.join(LOCALES_DIR, locale, 'gangjeong.json');
  if (!fs.existsSync(tFile)) continue;
  const t = JSON.parse(fs.readFileSync(tFile, 'utf8'));
  if (!t.gangjeong_story) continue;
  // gangjeong.json 에 옮기기 — gangjeong_story 의 자식들을 top-level 로
  fs.writeFileSync(gFile, JSON.stringify(t.gangjeong_story, null, 2) + '\n');
  // translation.json 에서 제거
  delete t.gangjeong_story;
  fs.writeFileSync(tFile, JSON.stringify(t, null, 2) + '\n');
  console.log(`[${locale}] moved gangjeong_story → gangjeong.json`);
  movedCount++;
}
console.log(`\nTotal locales updated: ${movedCount}`);
