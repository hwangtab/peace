import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/layout/Section';
import Container from '@/components/layout/Container';
import { CampTimetable } from '@/components/camp/timetable';
import { timetable2026 } from '@/data/timetable-2026';
import { getMusicians } from '@/api/musicians';
import { Musician } from '@/types/musician';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';
import {
  OVERVIEW,
  PURPOSE,
  BOOTH_ITEMS,
  LODGING_NOTICE,
  LODGINGS,
  ASSIGN_TABLES,
  ETC_LODGING,
  STAFF,
  BUDGET,
} from '@/data/camp2026Guide';
import {
  containerVariants,
  itemVariants,
  phoneHref,
  SectionHeading,
  BulletList,
  AssignmentTable,
} from '@/components/camp/guide/guidePrimitives';

interface GuidePageProps {
  initialMusicians?: Musician[];
  initialLocale?: string;
}

/* ------------------------------------------------------------------ *
 * 안내 책자 콘텐츠 — 제3회 강정피스앤뮤직캠프 뮤지션 안내 책자 기반.
 * 비공개(검색 차단) 페이지로, 참여 뮤지션 대상 내부 안내 용도.
 * 숙소·배정 등 공유 데이터는 @/data/camp2026Guide 에서 가져온다.
 * ------------------------------------------------------------------ */

const CampMusicianGuide2026Page: React.FC<GuidePageProps> = ({
  initialMusicians = [],
  initialLocale = 'ko',
}) => {
  const { t, i18n } = useTranslation(['camp_musician_guide_2026', 'translation']);

  const g = useCallback(
    (key: string, opts?: Record<string, unknown>) => t(`camp_musician_guide_2026.${key}`, opts),
    [t]
  );

  const arr = useCallback(
    (key: string) => t(`camp_musician_guide_2026.${key}`, { returnObjects: true }) as string[],
    [t]
  );

  const NAV_SECTIONS = useMemo(
    () => [
      { id: 'overview', label: g('nav_overview') as string },
      { id: 'purpose', label: g('nav_purpose') as string },
      { id: 'lineup', label: g('nav_lineup') as string },
      { id: 'programs', label: g('nav_programs') as string },
      { id: 'access', label: g('nav_access') as string },
      { id: 'staff', label: g('nav_staff') as string },
      { id: 'budget', label: g('nav_budget') as string },
    ],
    [g]
  );

  const fetchMusicians = useCallback((locale: string) => getMusicians(locale), []);
  const musiciansResource = useLocalizedResource<Musician>({
    initialData: initialMusicians,
    initialLocale,
    currentLocale: i18n.language,
    fetchResource: fetchMusicians,
  });
  const musicians = useMemo(
    () => (musiciansResource.isLoading ? [] : musiciansResource.data),
    [musiciansResource.isLoading, musiciansResource.data]
  );

  return (
    <PageLayout
      title={g('page_title') as string}
      description={g('seo_description') as string}
      noIndex
      disableTopPadding
    >
      <PageHero
        title={g('hero_title') as string}
        subtitle={g('hero_subtitle') as string}
        backgroundImage="/images-webp/camps/2026/hero-gangjeong-2026.webp"
      />

      <Section background="white" paddingTop="loose" paddingBottom="loose">
        <Container size="content">
          {/* 비공개 안내 배너 */}
          <div className="mb-8 rounded-xl border border-golden-sun/50 bg-sunlight-glow/40 p-4 text-sm text-coastal-gray">
            <p className="font-semibold text-deep-ocean mb-1">{g('private_banner_heading')}</p>
            <p>{g('private_banner_body')}</p>
          </div>

          {/* 목차 */}
          <nav aria-label={g('toc_aria_label') as string} className="mb-10">
            <ul className="flex flex-wrap gap-2">
              {NAV_SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="inline-block rounded-full border border-seafoam/50 bg-sky-horizon/40 px-3 py-1.5 text-sm text-jeju-ocean transition-colors hover:bg-jeju-ocean hover:text-white"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {/* 1. 개요 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="overview" index={1} title={g('section_overview') as string} />
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {OVERVIEW.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-xl border border-seafoam/40 bg-sky-horizon/40 p-4"
                  >
                    <dt className="text-xs uppercase tracking-wide text-coastal-gray mb-1">
                      {row.label}
                    </dt>
                    <dd className="text-sm font-bold text-deep-ocean break-keep">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="typo-body text-coastal-gray leading-relaxed">
                {g('overview_rain_note')}
              </p>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 2. 취지 및 기조 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="purpose" index={2} title={g('section_purpose') as string} />
              <div className="space-y-3">
                {PURPOSE.map((p) => (
                  <p key={p.slice(0, 40)} className="typo-body text-coastal-gray leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 3. 공연 타임테이블 — 원본 타임테이블(timetable-2026)에서 직접 읽어옴 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="lineup" index={3} title={g('section_lineup') as string} />
              <div className="not-prose">
                {musiciansResource.isLoading ? (
                  <p className="text-center text-coastal-gray py-10" role="status">
                    {t('translation:common.loading')}
                  </p>
                ) : musiciansResource.error ? (
                  <p className="text-center text-coastal-gray py-10" role="alert">
                    {t('translation:common.no_results')}
                  </p>
                ) : (
                  <CampTimetable data={timetable2026} musicians={musicians} campYear={2026} />
                )}
              </div>
              <p className="mt-4 text-sm text-coastal-gray">{g('lineup_rain_note')}</p>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 4. 부대 프로그램 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="programs" index={4} title={g('section_programs') as string} />
              <h3 className="text-base font-semibold text-jeju-ocean mb-2">
                {g('programs_market_heading')}
              </h3>
              <BulletList items={arr('programs_market_items')} />
              <h3 className="text-base font-semibold text-jeju-ocean mt-5 mb-2">
                {g('programs_booth_heading')}
              </h3>
              <BulletList items={BOOTH_ITEMS} />
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 5. 오시는 길 · 숙박 · 식사 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="access" index={5} title={g('section_access') as string} />

              {/* 오시는 길 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-2">
                {g('access_transport_heading')}
              </h3>
              <p className="typo-body text-coastal-gray leading-relaxed mb-6">
                {g('access_transport_before')}{' '}
                <strong className="text-deep-ocean">{g('access_transport_stop')}</strong>
                {g('access_transport_after')}
              </p>

              {/* 숙박 공통 안내 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-2">
                {g('access_lodging_common_heading')}
              </h3>
              <ol className="space-y-2 mb-6">
                {LODGING_NOTICE.map((n, i) => (
                  <li
                    key={n.slice(0, 30)}
                    className="flex gap-2 typo-body text-coastal-gray leading-relaxed"
                  >
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-jeju-ocean text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span>{n}</span>
                  </li>
                ))}
              </ol>

              {/* 숙소 기본 정보 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-3">
                {g('access_lodging_info_heading')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {LODGINGS.map((l) => (
                  <div
                    key={l.name}
                    className="rounded-xl border border-seafoam/40 bg-white p-4 shadow-sm"
                  >
                    <p className="font-bold text-deep-ocean">{l.name}</p>
                    <p className="text-xs text-coastal-gray mb-3">{l.address}</p>
                    <ul className="space-y-1 mb-3">
                      {l.rooms.map((r) => (
                        <li key={r} className="text-sm text-coastal-gray leading-snug">
                          · {r}
                        </li>
                      ))}
                    </ul>
                    <div className="space-y-1 border-t border-seafoam/30 pt-3">
                      {l.contacts.map((c) => (
                        <p key={c.when} className="text-sm text-coastal-gray">
                          <span className="text-coastal-gray/70">
                            {c.when} · {c.name}
                          </span>{' '}
                          <a
                            href={phoneHref(c.phone)}
                            className="font-semibold text-jeju-ocean hover:underline"
                          >
                            {c.phone}
                          </a>
                        </p>
                      ))}
                    </div>
                    {l.note && <p className="mt-2 text-xs text-coastal-gray/80">📍 {l.note}</p>}
                  </div>
                ))}
              </div>
              <p className="text-sm text-coastal-gray mb-8">{g('access_lodging_separate_note')}</p>

              {/* 숙소 배정 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-3">
                {g('access_lodging_assign_heading')}
              </h3>
              {ASSIGN_TABLES.map((tbl) => (
                <AssignmentTable key={tbl.title} table={tbl} />
              ))}

              {/* 기타 배정 */}
              <h4 className="text-base font-semibold text-jeju-ocean mb-2 mt-6">
                {g('access_lodging_etc_heading')}
              </h4>
              <div className="overflow-hidden rounded-xl border border-seafoam/40 mb-8">
                <ul className="divide-y divide-seafoam/30">
                  {ETC_LODGING.map((e) => (
                    <li
                      key={e.name}
                      className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 px-4 py-3"
                    >
                      <span className="font-medium text-deep-ocean sm:w-48 sm:flex-shrink-0">
                        {e.name}
                      </span>
                      <span className="text-sm text-coastal-gray">{e.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 식사 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-2">
                {g('access_meal_heading')}
              </h3>
              <div className="rounded-xl border border-seafoam/40 bg-sky-horizon/40 p-4">
                <BulletList items={arr('access_meal_items')} />
              </div>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 6. 운영진 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="staff" index={6} title={g('section_staff') as string} />
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {STAFF.map((s) => (
                  <div
                    key={s.role}
                    className="flex flex-col sm:flex-row sm:gap-3 border-b border-seafoam/20 pb-2"
                  >
                    <dt className="text-sm font-semibold text-deep-ocean sm:w-1/2 sm:flex-shrink-0">
                      {s.role}
                    </dt>
                    <dd className="text-sm text-coastal-gray">{s.people}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 7. 예산 · 정산 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="budget" index={7} title={g('section_budget') as string} />
              <BulletList items={BUDGET} />
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 운영지침 링크 */}
            <motion.div variants={itemVariants}>
              <div className="rounded-xl border border-seafoam/40 bg-ocean-sand/40 p-5 sm:p-6">
                <h3 className="text-base font-bold text-deep-ocean mb-1">
                  {g('guidelines_box_heading')}
                </h3>
                <p className="text-sm text-coastal-gray mb-3">{g('guidelines_box_body')}</p>
                <Link
                  href="/camps/2026/guidelines"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-jeju-ocean hover:underline"
                >
                  {g('guidelines_box_link')}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* 캠프 페이지로 돌아가기 */}
      <Section background="ocean-sand" paddingTop="normal" paddingBottom="normal">
        <Container size="content" className="text-center">
          <Link
            href="/camps/2026"
            className="inline-flex items-center gap-2 text-sm text-jeju-ocean hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean rounded"
          >
            <span aria-hidden="true">←</span>
            {t('translation:nav.camp_2026')}
          </Link>
        </Container>
      </Section>
    </PageLayout>
  );
};

export default CampMusicianGuide2026Page;
