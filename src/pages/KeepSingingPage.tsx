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
import Tickets from '@/components/solidarity/keepSinging/Tickets';
import ReservationForm from '@/components/solidarity/keepSinging/ReservationForm';
import ReservationLookup from '@/components/solidarity/keepSinging/ReservationLookup';
import Support from '@/components/solidarity/keepSinging/Support';
import Venue from '@/components/solidarity/keepSinging/Venue';
import { FlagRule } from '@/components/solidarity/keepSinging/DarkUI';
import { EVENT_SLUG, TICKET_PRICE } from '@/components/solidarity/keepSinging/constants';

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
      schemas.push(buildSolidarityEventSchema(event, { price: TICKET_PRICE, url: pageUrl }));
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
          <Tickets />
          <ReservationForm />
          <ReservationLookup />
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
