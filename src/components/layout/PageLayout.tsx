import React, { ReactNode, useEffect, useRef } from 'react';
import classNames from 'classnames';
import SEOHelmet, { SEOHelmetProps } from '../shared/SEOHelmet';
import StructuredDataScripts from '../shared/StructuredDataScripts';
import BreadcrumbNav, { BreadcrumbItem } from '../shared/BreadcrumbNav';

interface PageLayoutProps extends SEOHelmetProps {
  children: ReactNode;
  className?: string;
  background?:
    | 'white'
    | 'ocean-sand'
    | 'seafoam'
    | 'sunlight-glow'
    | 'sky-horizon'
    | 'light-beige'
    | 'jeju-ocean'
    | 'golden-sun';
  disableTopPadding?: boolean;
  disableBottomPadding?: boolean;
  breadcrumbs?: BreadcrumbItem[];
}

/**
 * PageLayout Component
 *
 * Standardizes the top-level page layout, ensuring correct spacing for the fixed navigation bar.
 * replacing the manual `pt-24 pb-16` / `pt-32 pb-24` classes.
 *
 * Includes SEOHelmet automatically to prevent SEO omissions.
 *
 * ⚠️ 하단 띠(UI 버그) 주의:
 * 이 래퍼는 페이지 배경색 + 하단 패딩(`pb-16 md:pb-24`)을 칠한다. 페이지의 **마지막
 * 섹션이 자기만의 background 를 가지면**(예: golden-sun 페이지 + jeju-ocean CTA),
 * 그 하단 패딩이 페이지 배경색 "띠"로 푸터 위에 노출된다.
 * → 마지막 섹션이 색을 가지면 `disableBottomPadding` 를 전달하거나, 마지막 섹션
 *   배경을 페이지 배경과 맞춰라. (개발 모드에서 이 조건을 감지해 콘솔 경고한다.)
 * 또한 마지막 섹션에 `paddingBottom="none"` + 자식 margin-bottom 조합은 margin-collapse
 * 로 페이지 배경이 비친다 — 패딩으로 마진을 가두거나 마진을 제거하라.
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  background = 'ocean-sand',
  disableTopPadding = false,
  disableBottomPadding = false,
  breadcrumbs,
  ...seoProps
}) => {
  const rootRef = useRef<HTMLDivElement>(null);

  // 개발 가드: 마지막 섹션 배경이 페이지 배경과 다른데 하단 패딩이 살아 있으면,
  // 푸터 위에 페이지 배경색 띠가 노출된다(실제 렌더 색을 측정 → 오탐 없음).
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const root = rootRef.current;
    if (!root || disableBottomPadding) return;
    const TRANSPARENT = 'rgba(0, 0, 0, 0)';
    const rootBg = getComputedStyle(root).backgroundColor;
    if (rootBg === TRANSPARENT) return;
    const lastBlock = Array.from(root.children)
      .reverse()
      .find(
        (c): c is HTMLElement =>
          c instanceof HTMLElement && c.tagName !== 'SCRIPT' && c.offsetHeight > 0
      );
    if (!lastBlock) return;
    const lastBg = getComputedStyle(lastBlock).backgroundColor;
    if (lastBg !== TRANSPARENT && lastBg !== rootBg) {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      console.warn(
        `[PageLayout] 마지막 섹션 배경(${lastBg})이 페이지 배경(${rootBg})과 달라 ` +
          `푸터 위에 페이지 배경색 띠가 보일 수 있습니다. ` +
          `disableBottomPadding 를 추가하거나 마지막 섹션을 페이지 배경색과 맞추세요. [${path}]`
      );
    }
  }, [disableBottomPadding, background]);

  return (
    <div
      ref={rootRef}
      className={classNames(
        'min-h-screen relative',
        {
          'bg-white': background === 'white',
          'bg-ocean-sand': background === 'ocean-sand',
          'bg-seafoam': background === 'seafoam',
          'bg-sunlight-glow': background === 'sunlight-glow',
          'bg-sky-horizon': background === 'sky-horizon',
          'bg-light-beige': background === 'light-beige',
          'bg-jeju-ocean': background === 'jeju-ocean',
          'bg-golden-sun': background === 'golden-sun',
        },
        // Standard top/bottom padding (formerly .page-container)
        // If disableTopPadding is true, we remove the top padding classes
        // If disableBottomPadding is true, we remove the bottom padding classes
        {
          'pt-24 md:pt-32': !disableTopPadding,
          'pb-16 md:pb-24': !disableBottomPadding,
        },
        className
      )}
    >
      <SEOHelmet {...seoProps} omitStructuredScripts />
      {breadcrumbs && <BreadcrumbNav items={breadcrumbs} />}
      {children}
      {/* JSON-LD 는 LCP/main 콘텐츠 뒤로 이동 — 스트리밍 HTML 파서가
                메인 마크업(H1, Hero) 을 먼저 도달해 paint 가능. SEO 영향 0. */}
      {seoProps.structuredData !== undefined && (
        <StructuredDataScripts data={seoProps.structuredData} />
      )}
    </div>
  );
};

export default PageLayout;
