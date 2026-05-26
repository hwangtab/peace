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
  LODGING_NOTICE,
  LODGINGS,
  ASSIGN_TABLES,
  ETC_LODGING,
} from '@/data/camp2026Guide';
import {
  containerVariants,
  itemVariants,
  phoneHref,
  SectionHeading,
  BulletList,
  AssignmentTable,
} from '@/components/camp/guide/guidePrimitives';

interface StaffPageProps {
  initialMusicians?: Musician[];
  initialLocale?: string;
}

interface NavItem { id: string; label: string }
interface ScheduleEntry { date: string; tasks: string[] }
interface RoleEntry { role: string; people: string; notes: string[] }
interface StaffEntry { role: string; people: string }

/* ------------------------------------------------------------------ *
 * 스태프 전용 비공개 운영 안내 — 제3회 강정피스앤뮤직캠프.
 * 자료 출처: '자원봉사 및 운영계획안' PDF + docs(기획안·체크리스트) + 웹 콘텐츠.
 * 검색 차단(noIndex) 페이지로, 기획단·자원봉사자 대상 내부 운영 안내 용도.
 * 숙소·배정 등 공유 데이터는 @/data/camp2026Guide 에서 가져온다.
 * ------------------------------------------------------------------ */

const MARKET_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScJuJdaoJ7r6VQCPIGGxR83krpcAHx0EVgqCPwMPb8M1U4clw/viewform';

const CampStaff2026Page: React.FC<StaffPageProps> = ({
  initialMusicians = [],
  initialLocale = 'ko',
}) => {
  const { t, i18n } = useTranslation(['camp_staff_2026', 'translation']);

  const s = useCallback(
    (key: string, opts?: Record<string, unknown>) =>
      t(`camp_staff_2026.${key}`, opts),
    [t],
  );

  const navItems       = s('nav',                { returnObjects: true }) as unknown as NavItem[];
  const opSchedule     = s('operation_schedule', { returnObjects: true }) as unknown as ScheduleEntry[];
  const roleItems      = s('role_assignments',   { returnObjects: true }) as unknown as RoleEntry[];
  const rewardItems    = s('rewards',            { returnObjects: true }) as unknown as string[];
  const staffItems     = s('staff',              { returnObjects: true }) as unknown as StaffEntry[];
  const marketItems    = s('market_items',       { returnObjects: true }) as unknown as string[];
  const overviewLabels       = s('overview_labels',        { returnObjects: true }) as unknown as string[];
  const overviewValues       = s('overview_values',        { returnObjects: true }) as unknown as string[];
  const lodgingNotice        = s('lodging_notice',         { returnObjects: true }) as unknown as string[];
  const lodgingContactLabels = s('lodging_contact_labels', { returnObjects: true }) as unknown as string[];
  const lodgingsI18n         = s('lodgings_i18n',          { returnObjects: true }) as unknown as { address: string; rooms: string[]; note: string | null }[];
  const assignRoomHeader     = s('assign_room_header') as string;
  const assignRoomNameMap    = s('assign_room_name_map',   { returnObjects: true }) as unknown as Record<string, string>;
  const etcLodgingDetails    = s('etc_lodging_details',    { returnObjects: true }) as unknown as string[];

  const fetchMusicians = useCallback((locale: string) => getMusicians(locale), []);
  const musiciansResource = useLocalizedResource<Musician>({
    initialData: initialMusicians,
    initialLocale,
    currentLocale: i18n.language,
    fetchResource: fetchMusicians,
  });
  const musicians = useMemo(
    () => (musiciansResource.isLoading ? [] : musiciansResource.data),
    [musiciansResource.isLoading, musiciansResource.data],
  );

  return (
    <PageLayout
      title={s('page_title') as string}
      description={s('page_description') as string}
      noIndex
      disableTopPadding
    >
      <PageHero
        title={s('hero_title') as string}
        subtitle={s('hero_subtitle') as string}
        backgroundImage="/images-webp/camps/2026/hero-gangjeong-2026.webp"
      />

      <Section background="white" paddingTop="loose" paddingBottom="loose">
        <Container size="content">
          {/* 비공개 안내 배너 */}
          <div className="mb-8 rounded-xl border border-golden-sun/50 bg-sunlight-glow/40 p-4 text-sm text-coastal-gray">
            <p className="font-semibold text-deep-ocean mb-1">{s('private_banner_title')}</p>
            <p>{s('private_banner_body')}</p>
          </div>

          {/* 목차 */}
          <nav aria-label={s('nav_label') as string} className="mb-10">
            <ul className="flex flex-wrap gap-2">
              {Array.isArray(navItems) && navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="inline-block rounded-full border border-seafoam/50 bg-sky-horizon/40 px-3 py-1.5 text-sm text-jeju-ocean transition-colors hover:bg-jeju-ocean hover:text-white"
                  >
                    {item.label}
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
            {/* 1. 핵심 정보 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="info" index={1} title={s('section_info') as string} />
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {OVERVIEW.map((row, i) => (
                  <div key={row.label} className="rounded-xl border border-seafoam/40 bg-sky-horizon/40 p-4">
                    <dt className="text-xs uppercase tracking-wide text-coastal-gray mb-1">
                      {Array.isArray(overviewLabels) ? overviewLabels[i] : row.label}
                    </dt>
                    <dd className="text-sm font-bold text-deep-ocean break-keep">
                      {Array.isArray(overviewValues) ? overviewValues[i] : row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="typo-body text-coastal-gray leading-relaxed">{s('rain_note')}</p>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 2. 운영 일정 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="schedule" index={2} title={s('section_schedule') as string} />
              <p className="text-sm text-coastal-gray mb-5">{s('schedule_note')}</p>
              <ol className="space-y-3">
                {Array.isArray(opSchedule) && opSchedule.map((d) => (
                  <li
                    key={d.date}
                    className="flex flex-col sm:flex-row gap-2 sm:gap-4 rounded-xl border border-seafoam/40 bg-white p-4 shadow-sm"
                  >
                    <span className="inline-flex h-fit w-fit flex-shrink-0 items-center rounded-full bg-jeju-ocean px-3 py-1 text-sm font-bold text-white">
                      {d.date}
                    </span>
                    <ul className="space-y-1.5 flex-1">
                      {d.tasks.map((task) => (
                        <li key={task.slice(0, 40)} className="flex gap-2 text-sm text-coastal-gray leading-relaxed">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-seafoam" aria-hidden="true" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 3. 역할 분담 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="roles" index={3} title={s('section_roles') as string} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(roleItems) && roleItems.map((r) => (
                  <div key={r.role} className="rounded-xl border border-seafoam/40 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="text-base font-bold text-deep-ocean">{r.role}</h3>
                      <span className="text-sm font-semibold text-jeju-ocean">{r.people}</span>
                    </div>
                    <ul className="space-y-1 border-t border-seafoam/30 pt-2">
                      {r.notes.map((note) => (
                        <li key={note.slice(0, 40)} className="flex gap-2 text-sm text-coastal-gray leading-snug">
                          <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-coastal-gray/50" aria-hidden="true" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 4. 공연 타임테이블 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="timetable" index={4} title={s('section_timetable') as string} />
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
              <p className="mt-4 text-sm text-coastal-gray">{s('timetable_rain_note')}</p>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 5. 숙소 배정 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="lodging" index={5} title={s('section_lodging') as string} />

              {/* 공통 안내 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-2">{s('lodging_general_title')}</h3>
              <ol className="space-y-2 mb-6">
                {(Array.isArray(lodgingNotice) ? lodgingNotice : LODGING_NOTICE).map((n, i) => (
                  <li key={n.slice(0, 30)} className="flex gap-2 typo-body text-coastal-gray leading-relaxed">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-jeju-ocean text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span>{n}</span>
                  </li>
                ))}
              </ol>

              {/* 숙소 기본 정보 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-3">{s('lodging_details_title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {LODGINGS.map((l, li) => {
                  const lI18n = Array.isArray(lodgingsI18n) ? lodgingsI18n[li] : null;
                  const displayAddress = lI18n?.address ?? l.address;
                  const displayRooms   = lI18n?.rooms   ?? l.rooms;
                  const displayNote    = lI18n?.note    ?? l.note;
                  return (
                    <div key={l.name} className="rounded-xl border border-seafoam/40 bg-white p-4 shadow-sm">
                      <p className="font-bold text-deep-ocean">{l.name}</p>
                      <p className="text-xs text-coastal-gray mb-3">{displayAddress}</p>
                      <ul className="space-y-1 mb-3">
                        {displayRooms.map((r) => (
                          <li key={r} className="text-sm text-coastal-gray leading-snug">· {r}</li>
                        ))}
                      </ul>
                      <div className="space-y-1 border-t border-seafoam/30 pt-3">
                        {l.contacts.map((c, ci) => (
                          <p key={c.when} className="text-sm text-coastal-gray">
                            <span className="text-coastal-gray/70">
                              {(Array.isArray(lodgingContactLabels) ? lodgingContactLabels[ci] : c.when)} · {c.name}
                            </span>{' '}
                            <a href={phoneHref(c.phone)} className="font-semibold text-jeju-ocean hover:underline">
                              {c.phone}
                            </a>
                          </p>
                        ))}
                      </div>
                      {displayNote && <p className="mt-2 text-xs text-coastal-gray/80">📍 {displayNote}</p>}
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-coastal-gray mb-8">{s('lodging_extra_note')}</p>

              {/* 일자별 배정 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-3">{s('lodging_assignments_title')}</h3>
              {ASSIGN_TABLES.map((tbl) => {
                const roomMap = (typeof assignRoomNameMap === 'object' && !Array.isArray(assignRoomNameMap))
                  ? assignRoomNameMap as Record<string, string>
                  : {};
                const header0: string = (typeof assignRoomHeader === 'string' && assignRoomHeader) ? assignRoomHeader : (tbl.headers[0] ?? '방');
                const translatedTable = {
                  ...tbl,
                  headers: [header0, ...tbl.headers.slice(1)] as string[],
                  rows: tbl.rows.map((row) => { const k = row[0] ?? ''; return [roomMap[k] ?? k, ...row.slice(1)]; }),
                };
                return <AssignmentTable key={tbl.title} table={translatedTable} />;
              })}

              {/* 기타 배정 */}
              <h4 className="text-base font-semibold text-jeju-ocean mb-2 mt-6">{s('lodging_other_title')}</h4>
              <div className="overflow-hidden rounded-xl border border-seafoam/40">
                <ul className="divide-y divide-seafoam/30">
                  {ETC_LODGING.map((e, ei) => (
                    <li key={e.name} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 px-4 py-3">
                      <span className="font-medium text-deep-ocean sm:w-48 sm:flex-shrink-0">{e.name}</span>
                      <span className="text-sm text-coastal-gray">
                        {Array.isArray(etcLodgingDetails) ? etcLodgingDetails[ei] : e.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 6. 장터 운영 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="market" index={6} title={s('section_market') as string} />
              {Array.isArray(marketItems) && <BulletList items={marketItems} />}
              <div className="mt-5 rounded-xl border border-seafoam/40 bg-ocean-sand/40 p-5 sm:p-6">
                <h3 className="text-base font-bold text-deep-ocean mb-1">{s('market_cta_title')}</h3>
                <p className="text-sm text-coastal-gray mb-4">{s('market_cta_desc')}</p>
                <a
                  href={MARKET_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-jeju-ocean px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-deep-ocean"
                >
                  {s('market_cta_button')}
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 7. 정산 · 리워드 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="rewards" index={7} title={s('section_rewards') as string} />
              {Array.isArray(rewardItems) && <BulletList items={rewardItems} />}
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 8. 운영진 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="org" index={8} title={s('section_org') as string} />
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {Array.isArray(staffItems) && staffItems.map((item) => (
                  <div key={item.role} className="flex flex-col sm:flex-row sm:gap-3 border-b border-seafoam/20 pb-2">
                    <dt className="text-sm font-semibold text-deep-ocean sm:w-1/2 sm:flex-shrink-0">{item.role}</dt>
                    <dd className="text-sm text-coastal-gray">{item.people}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 운영지침 + 뮤지션 안내 링크 */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-seafoam/40 bg-ocean-sand/40 p-5 sm:p-6">
                <h3 className="text-base font-bold text-deep-ocean mb-1">{s('guidelines_card_title')}</h3>
                <p className="text-sm text-coastal-gray mb-3">{s('guidelines_card_desc')}</p>
                <Link
                  href="/camps/2026/guidelines"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-jeju-ocean hover:underline"
                >
                  {s('guidelines_card_link')}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="rounded-xl border border-seafoam/40 bg-ocean-sand/40 p-5 sm:p-6">
                <h3 className="text-base font-bold text-deep-ocean mb-1">{s('musician_card_title')}</h3>
                <p className="text-sm text-coastal-gray mb-3">{s('musician_card_desc')}</p>
                <Link
                  href="/camps/2026/guide"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-jeju-ocean hover:underline"
                >
                  {s('musician_card_link')}
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

export default CampStaff2026Page;
