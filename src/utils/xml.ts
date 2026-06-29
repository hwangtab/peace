/**
 * XML 텍스트 노드/속성에 안전하게 넣기 위해 예약 문자를 엔티티로 이스케이프한다.
 * 동적 sitemap(image/video) 생성에서 공유한다.
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
