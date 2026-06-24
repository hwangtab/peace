import React from 'react';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';

interface PageIntroSectionProps {
  eyebrow?: string;
  heading: string;
  paragraphs: string[];
  background?:
    | 'white'
    | 'ocean-sand'
    | 'seafoam'
    | 'sunlight-glow'
    | 'sky-horizon'
    | 'light-beige'
    | 'golden-sun'
    | 'transparent';
  /**
   * 하단 패딩. 기본 tight. 이 섹션 바로 뒤에 SectionWave(flow="up")가 오면
   * 물결이 하단을 잠식하므로 loose로 올려 물결이 차오를 여백을 확보한다.
   */
  paddingBottom?: 'tight' | 'normal' | 'loose';
}

/**
 * PageIntroSection
 *
 * 페이지 히어로 바로 아래에 배치되는 언어별 고유 도입부.
 * Google이 "thin content"로 판정하는 것을 방지하고, speakable schema의
 * `.seo-summary` 셀렉터에 매칭되어 AI 엔진 인용 확률을 높임.
 */
const PageIntroSection: React.FC<PageIntroSectionProps> = ({
  eyebrow,
  heading,
  paragraphs,
  background = 'white',
  paddingBottom = 'tight',
}) => {
  return (
    <Section background={background} paddingTop="tight" paddingBottom={paddingBottom}>
      <Container size="prose" className="seo-summary">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-ocean-mist mb-3">
            {eyebrow}
          </p>
        )}
        <h2 className="typo-h2 text-2xl md:text-3xl mb-6 hyphens-auto break-words" data-speakable>
          {heading}
        </h2>
        <div className="space-y-4">
          {paragraphs.map((p, i) => (
            <p
              key={p.slice(0, 40)}
              className="typo-body text-coastal-gray leading-relaxed break-words"
              {...(i === 0 ? { 'data-speakable': true } : {})}
            >
              {p}
            </p>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default PageIntroSection;
