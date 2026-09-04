import { LOCALES, DEFAULT_LOCALE, PRERENDER_LOCALES, prerenderLocales } from './locales';
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

  // '@/constants/locales' 는 번들러에 따라 .ts 대신 .js 로 해석될 수 있다(webpack 실측).
  // 그때 prerenderLocales 가 없으면 getStaticPaths 가 런타임에 깨지므로 양쪽 모두 확인한다.
  it('PRERENDER_LOCALES 가 일치한다', () => {
    expect([...PRERENDER_LOCALES]).toEqual(localesJs.PRERENDER_LOCALES);
  });

  it('prerenderLocales 가 양쪽에서 동일하게 동작한다', () => {
    const input = [...LOCALES];
    expect(prerenderLocales(input)).toEqual(localesJs.prerenderLocales(input));
    expect(prerenderLocales()).toEqual(localesJs.prerenderLocales());
  });
});
