import React from 'react';
import { escapeJsonLd } from '@/utils/escapeJsonLd';

interface StructuredDataScriptsProps {
  data: object | object[];
}

/**
 * JSON-LD <script> 태그들을 body 의 main 콘텐츠 뒤에 렌더한다.
 *
 * SEOHelmet 이 head 에 포함하던 JSON-LD 를 분리한 이유:
 * - Camp 2026 의 MusicEvent 스키마가 51개 subEvent 로 ~60KB
 * - head 에 두면 LCP 이미지 preload 링크가 byte 100K 위치로 밀림 →
 *   브라우저 preload scanner 가 늦게 발견, resource load delay 1.5s
 * - body 끝(메인 콘텐츠 뒤) 에 두면:
 *   1) head 가 가벼워져 preload scanner 가 즉시 image fetch 시작
 *   2) HTML 파서가 스트리밍 중 H1/Hero 마크업에 먼저 도달
 *   3) <script type="application/ld+json"> 은 실행 X (데이터), paint 에
 *      영향 0
 *
 * SEO: schema.org 권장사항 상 'anywhere in HTML' 가능. Google/Bingbot
 * 모두 body 의 application/ld+json 동일하게 인식·인덱싱.
 */

const StructuredDataScripts: React.FC<StructuredDataScriptsProps> = ({ data }) => {
  const list = Array.isArray(data) ? data : [data];
  if (list.length === 0) return null;
  return (
    <>
      {list.map((entry, index) => {
        const json = escapeJsonLd(JSON.stringify(entry));
        return (
          <script
            key={`structured-data-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: json }}
          />
        );
      })}
    </>
  );
};

export default StructuredDataScripts;
