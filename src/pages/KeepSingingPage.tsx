import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import PageLayout from '@/components/layout/PageLayout';
import { Musician } from '@/types/musician';
import { getMusicians } from '@/api/musicians';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';
import { getSolidarityEvents } from '@/data/solidarity';
import { getFullUrl } from '@/config/env';
import { getBreadcrumbSchema, getWebPageSchema } from '@/utils/structuredData';
import { buildSolidarityEventSchema } from '@/utils/buildSolidaritySchemas';
import Grain from '@/components/solidarity/keepSinging/Grain';
import Hero from '@/components/solidarity/keepSinging/Hero';
import Intro from '@/components/solidarity/keepSinging/Intro';
import Lineup from '@/components/solidarity/keepSinging/Lineup';
import Support from '@/components/solidarity/keepSinging/Support';
import Venue from '@/components/solidarity/keepSinging/Venue';
import { FlagRule } from '@/components/solidarity/keepSinging/DarkUI';
import { EVENT_SLUG } from '@/components/solidarity/keepSinging/constants';

interface Props {
  initialMusicians?: Musician[];
  initialLocale?: string;
}

/**
 * Keep Singing for Palestine (2026-09-19) 공개 페이지.
 *
 * 사이트에서 유일한 다크 페이지다. PageLayout 은 그대로 쓰되 배경을 페이지 래퍼에서
 * #0a0a0a 로 덮고, 마지막 섹션(Venue)이 그 배경을 푸터 직전까지 칠하도록
 * `disableBottomPadding` 을 켠다(PageLayout 의 하단 배경색 띠 버그 방지).
 */
const KeepSingingPage: React.FC<Props> = ({ initialMusicians = [], initialLocale = 'ko' }) => {
  const { t, i18n } = useTranslation('concert_ksfp_2026');
  const { t: tCommon } = useTranslation('translation');

  const fetchMusicians = useCallback((locale: string) => getMusicians(locale), []);
  const musiciansResource = useLocalizedResource<Musician>({
    initialData: initialMusicians,
    initialLocale,
    currentLocale: i18n.language,
    fetchResource: fetchMusicians,
  });
  const musicians = musiciansResource.isLoading ? initialMusicians : musiciansResource.data;

  const pageUrl = getFullUrl(`/solidarity/${EVENT_SLUG}`);
  const event = useMemo(
    () => getSolidarityEvents(tCommon).find((e) => e.id === EVENT_SLUG) ?? null,
    [tCommon]
  );

  const breadcrumbs = useMemo(
    () => [
      { name: tCommon('nav.home'), url: getFullUrl('/') },
      { name: tCommon('solidarity.breadcrumb'), url: getFullUrl('/solidarity') },
      { name: 'Keep Singing for Palestine', url: pageUrl },
    ],
    [tCommon, pageUrl]
  );

  const structuredData = useMemo(() => {
    const schemas: object[] = [];
    if (event) {
      // price를 넘기지 않으면 무료 행사(offers.price 0)로 나간다 — 거리집회라 참가비가
      // 없다. 티켓 가격을 남겨 두면 검색 결과가 팔지 않는 티켓을 광고한다.
      schemas.push(buildSolidarityEventSchema(event, { url: pageUrl }));
    }
    schemas.push(
      getBreadcrumbSchema(breadcrumbs),
      getWebPageSchema({
        name: t('seo.title'),
        description: t('seo.description'),
        url: pageUrl,
        ...(event ? { mainEntityId: `${getFullUrl('/solidarity')}#${event.id}` } : {}),
        primaryImageUrl: getFullUrl('/images-webp/solidarity/keep-singing-for-palestine.webp'),
        keywords: [
          'Keep Singing for Palestine',
          '팔레스타인 연대 공연',
          '평화 콘서트',
          '강정피스앤뮤직캠프',
          '반쥴 공연',
          'Palestine solidarity concert Seoul',
        ],
      })
    );
    return schemas;
  }, [event, breadcrumbs, pageUrl, t]);

  return (
    <PageLayout
      title={t('seo.title')}
      description={t('seo.description')}
      ogImage="/images-webp/solidarity/keep-singing-for-palestine.webp"
      ogImageAlt={t('hero.poster_alt')}
      ogType="event"
      canonicalUrl={pageUrl}
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      {/* 페이지 전체를 덮는 다크 래퍼 — 사이트 기본 밝은 배경을 이 안에서 끝까지 가린다. */}
      <div className="relative bg-[#0a0a0a] text-[#F5F1EA]">
        <Grain />

        <div className="relative z-[2]">
          <Hero />
          <Intro />
          <FlagRule />
          <Lineup musicians={musicians} />
          <FlagRule />
          {/* 티켓·예매 섹션은 2026-09-14에 내렸다 — 실내 유료 공연이 거리집회로 바뀌면서
              판매할 티켓이 없어졌다. 컴포넌트와 예매 API·테이블은 남겨 둔다(다른 연대
              공연에 다시 쓴다). 예매 신청은 0건이라 환불 대상도 없었다. */}
          <Support />
          <Venue />

          <div className="pb-16 text-center md:pb-24">
            <Link
              href="/solidarity"
              className="text-sm text-[#9C958B] underline underline-offset-4 hover:text-[#F5F1EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F1EA]/60"
            >
              <span aria-hidden="true">←</span> {tCommon('solidarity.back_to_list')}
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default KeepSingingPage;
