import { LOCALES, DEFAULT_LOCALE } from './locales';
import * as localesJs from './locales.js';

// locales.ts(앱·미들웨어용 TS)와 locales.js(next-i18next.config.js 가 require 하는
// CommonJS 짝)는 동일 데이터를 이중 관리한다. 완전 단일화는 CommonJS↔const-assertion
// 제약으로 위험하므로, 대신 두 파일이 드리프트하지 않도록 이 테스트로 일치를 강제한다.
describe('locales.ts ↔ locales.js 동기화', () => {
  it('LOCALES 배열이 일치한다', () => {
    expect([...LOCALES]).toEqual(localesJs.LOCALES);
  });

  it('DEFAULT_LOCALE 이 일치한다', () => {
    expect(DEFAULT_LOCALE).toEqual(localesJs.DEFAULT_LOCALE);
  });
});
