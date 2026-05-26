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

const NAV_SECTIONS: { id: string; label: string }[] = [
  { id: 'overview', label: '개요' },
  { id: 'purpose', label: '취지·기조' },
  { id: 'lineup', label: '공연 타임테이블' },
  { id: 'programs', label: '부대 프로그램' },
  { id: 'access', label: '오시는 길·숙박·식사' },
  { id: 'staff', label: '운영진' },
  { id: 'budget', label: '예산·정산' },
];

const CampMusicianGuide2026Page: React.FC<GuidePageProps> = ({
  initialMusicians = [],
  initialLocale = 'ko',
}) => {
  const { t, i18n } = useTranslation();

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
      title='제3회 강정피스앤뮤직캠프 뮤지션 안내'
      description='제3회 강정피스앤뮤직캠프 참여 뮤지션·스태프를 위한 내부 안내 페이지입니다.'
      noIndex
      disableTopPadding
    >
      <PageHero
        title='뮤지션 안내'
        subtitle='제3회 강정피스앤뮤직캠프 "전쟁을 끝내자!"'
        backgroundImage="/images-webp/camps/2026/hero-gangjeong-2026.webp"
      />

      <Section background="white" paddingTop="loose" paddingBottom="loose">
        <Container size="content">
          {/* 비공개 안내 배너 */}
          <div className="mb-8 rounded-xl border border-golden-sun/50 bg-sunlight-glow/40 p-4 text-sm text-coastal-gray">
            <p className="font-semibold text-deep-ocean mb-1">참여 뮤지션·스태프 전용 안내</p>
            <p>
              이 페이지는 검색에 노출되지 않는 비공개 안내입니다. 개인 연락처와 숙소 배정 등 민감한 정보가 포함되어 있으니,
              공유 시 참여자 외부로 유출되지 않도록 주의해주세요.
            </p>
          </div>

          {/* 목차 */}
          <nav aria-label="목차" className="mb-10">
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
              <SectionHeading id="overview" index={1} title="개요" />
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {OVERVIEW.map((row) => (
                  <div key={row.label} className="rounded-xl border border-seafoam/40 bg-sky-horizon/40 p-4">
                    <dt className="text-xs uppercase tracking-wide text-coastal-gray mb-1">{row.label}</dt>
                    <dd className="text-sm font-bold text-deep-ocean break-keep">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="typo-body text-coastal-gray leading-relaxed">
                ※ 우천 시 할망물식당 &amp; 카페 공간 두 곳에서 분산하여 동시 진행합니다.
              </p>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 2. 취지 및 기조 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="purpose" index={2} title="취지 및 기조" />
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
              <SectionHeading id="lineup" index={3} title="라인업 및 공연 타임테이블" />
              <div className="not-prose">
                {musiciansResource.isLoading ? (
                  <p className="text-center text-coastal-gray py-10" role="status">
                    {t('common.loading')}
                  </p>
                ) : musiciansResource.error ? (
                  <p className="text-center text-coastal-gray py-10" role="alert">
                    {t('common.no_results')}
                  </p>
                ) : (
                  <CampTimetable data={timetable2026} musicians={musicians} campYear={2026} />
                )}
              </div>
              <p className="mt-4 text-sm text-coastal-gray">
                ※ 우천 시 공연 타임테이블은 추후 별도 공유 예정입니다.
              </p>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 4. 부대 프로그램 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="programs" index={4} title="부대 프로그램" />
              <h3 className="text-base font-semibold text-jeju-ocean mb-2">장터 — (전쟁을) 끝내장터</h3>
              <BulletList items={['최대 15팀 모집', '우천 시 취소']} />
              <h3 className="text-base font-semibold text-jeju-ocean mt-5 mb-2">조직위 부스</h3>
              <BulletList items={BOOTH_ITEMS} />
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 5. 오시는 길 · 숙박 · 식사 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="access" index={5} title="오시는 길 · 숙박 · 식사" />

              {/* 오시는 길 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-2">오시는 길</h3>
              <p className="typo-body text-coastal-gray leading-relaxed mb-6">
                대중교통 이용 시, 제주공항 5번 게이트에서 600번 리무진 버스를 타고 <strong className="text-deep-ocean">‘강정농협’</strong>에서 하차하세요.
              </p>

              {/* 숙박 공통 안내 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-2">숙박 — 공통 안내사항</h3>
              <ol className="space-y-2 mb-6">
                {LODGING_NOTICE.map((n, i) => (
                  <li key={n.slice(0, 30)} className="flex gap-2 typo-body text-coastal-gray leading-relaxed">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-jeju-ocean text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span>{n}</span>
                  </li>
                ))}
              </ol>

              {/* 숙소 기본 정보 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-3">숙소 기본 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {LODGINGS.map((l) => (
                  <div key={l.name} className="rounded-xl border border-seafoam/40 bg-white p-4 shadow-sm">
                    <p className="font-bold text-deep-ocean">{l.name}</p>
                    <p className="text-xs text-coastal-gray mb-3">{l.address}</p>
                    <ul className="space-y-1 mb-3">
                      {l.rooms.map((r) => (
                        <li key={r} className="text-sm text-coastal-gray leading-snug">· {r}</li>
                      ))}
                    </ul>
                    <div className="space-y-1 border-t border-seafoam/30 pt-3">
                      {l.contacts.map((c) => (
                        <p key={c.when} className="text-sm text-coastal-gray">
                          <span className="text-coastal-gray/70">{c.when} · {c.name}</span>{' '}
                          <a href={phoneHref(c.phone)} className="font-semibold text-jeju-ocean hover:underline">
                            {c.phone}
                          </a>
                        </p>
                      ))}
                    </div>
                    {l.note && <p className="mt-2 text-xs text-coastal-gray/80">📍 {l.note}</p>}
                  </div>
                ))}
              </div>
              <p className="text-sm text-coastal-gray mb-8">
                ※ 강가히말라야, 삼각전파사 님의 숙소 안내는 별도로 진행 예정입니다.
              </p>

              {/* 숙소 배정 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-3">숙소 배정</h3>
              {ASSIGN_TABLES.map((tbl) => (
                <AssignmentTable key={tbl.title} table={tbl} />
              ))}

              {/* 기타 배정 */}
              <h4 className="text-base font-semibold text-jeju-ocean mb-2 mt-6">기타</h4>
              <div className="overflow-hidden rounded-xl border border-seafoam/40 mb-8">
                <ul className="divide-y divide-seafoam/30">
                  {ETC_LODGING.map((e) => (
                    <li key={e.name} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 px-4 py-3">
                      <span className="font-medium text-deep-ocean sm:w-48 sm:flex-shrink-0">{e.name}</span>
                      <span className="text-sm text-coastal-gray">{e.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 식사 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-2">식사</h3>
              <div className="rounded-xl border border-seafoam/40 bg-sky-horizon/40 p-4">
                <BulletList items={[
                  '6/5 — 김밥',
                  '6/6~6/7 — 비건 빠에야',
                  '6/4~6/8 스태프와 뮤지션에게 식사 1끼 및 뒤풀이 안주 제공',
                ]} />
              </div>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 6. 운영진 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="staff" index={6} title="운영진" />
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {STAFF.map((s) => (
                  <div key={s.role} className="flex flex-col sm:flex-row sm:gap-3 border-b border-seafoam/20 pb-2">
                    <dt className="text-sm font-semibold text-deep-ocean sm:w-1/2 sm:flex-shrink-0">{s.role}</dt>
                    <dd className="text-sm text-coastal-gray">{s.people}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 7. 예산 · 정산 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="budget" index={7} title="예산 및 정산·지원 원칙" />
              <BulletList items={BUDGET} />
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 운영지침 링크 */}
            <motion.div variants={itemVariants}>
              <div className="rounded-xl border border-seafoam/40 bg-ocean-sand/40 p-5 sm:p-6">
                <h3 className="text-base font-bold text-deep-ocean mb-1">운영지침 (우리의 약속)</h3>
                <p className="text-sm text-coastal-gray mb-3">
                  안전하고 평등한 캠프를 위한 행동 약속과 신고·대응 절차를 꼭 확인해주세요.
                </p>
                <Link
                  href="/camps/2026/guidelines"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-jeju-ocean hover:underline"
                >
                  운영지침 보기
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
            {t('nav.camp_2026', { defaultValue: '캠프 2026' })}
          </Link>
        </Container>
      </Section>
    </PageLayout>
  );
};

export default CampMusicianGuide2026Page;
