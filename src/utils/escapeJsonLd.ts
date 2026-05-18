// HTML5 tokenizer 가 인식하는 스크립트 종료 시퀀스를 escape 한다.
// - `</script` (case-insensitive): 태그 이름은 대소문자 무관하게 인식됨
// - `<!--`: script-data-double-escape 상태에서 종료 트리거
// JSON-LD 인라인 스크립트 렌더 전에 호출. 입력은 JSON.stringify 결과여야 함.
export const escapeJsonLd = (json: string): string =>
  json
    .replace(/<\/script/gi, '<\\/script')
    .replace(/<!--/g, '<\\!--');
