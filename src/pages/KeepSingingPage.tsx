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
import Notice from '@/components/solidarity/keepSinging/Notice';
import Lineup from '@/components/solidarity/keepSinging/Lineup';
import Support from '@/components/solidarity/keepSinging/Support';
import Venue from '@/components/solidarity/keepSinging/Venue';
import { FlagRule } from '@/components/solidarity/keepSinging/DarkUI';
import { EVENT_SLUG } from '@/components/solidarity/keepSinging/constants';

/**
 * Keep Singing for Palestine (2026-09-19) 공개 페이지.
 *
 * 사이트에서 유일한 다크 페이지다. PageLayout 은 그대로 쓰되 배경을 페이지 래퍼에서
 * #0a0a0a 로 덮고, 마지막 섹션(Venue)이 그 배경을 푸터 직전까지 칠하도록
 * `disableBottomPadding` 을 켠다(PageLayout 의 하단 배경색 띠 버그 방지).
 */
interface Props {
  initialMusicians?: Musician[];
  initialLocale?: string;
}

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
      schemas.push(buildSolidarityEventSchema(event, { url: pageUrl, rescheduled: true }));
    }
    schemas.push(
      getBreadcrumbSchema(breadcrumbs),
      getWebPageSchema({
        name: t('seo.title'),
        description: t('seo.description'),
        url: pageUrl,
        ...(event ? { mainEntityId: `${getFullUrl('/solidarity')}#${event.id}` } : {}),
        primaryImageUrl: getFullUrl('/images-webp/solidarity/keep-singing-for-palestine.webp'),
        // 반쥴 실내 공연이 덕수궁 돌담길 거리집회로 바뀌었다. 취소된 기획을 겨냥한
        // 키워드('평화 콘서트'·'반쥴 공연')를 남겨 두면 구조화 데이터가 사실과 어긋난다.
        keywords: [
          'Keep Singing for Palestine',
          '팔레스타인 연대 집회',
          '9·19 거리집회',
          '파병 반대 집회',
          '덕수궁 돌담길',
          '강정피스앤뮤직캠프',
          'Palestine solidarity rally Seoul',
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
          <Notice />
          {/* 명단이 확정돼 라인업을 되살린다 — f7786143이 "임시 제거"한 자리다.
              거리집회로 바뀌어 낮·저녁 구분이 사라졌으므로 남수까지 한 줄로 묶는다. */}
          <Lineup musicians={musicians} />
          <FlagRule />
          <Support />
          {/* 장소가 확정돼(덕수궁 돌담길) 오시는 길을 되살린다 — f7786143이 "임시 제거"한
              자리다. 거리집회라 지도 링크가 실내 공연보다 오히려 더 필요하다. */}
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
