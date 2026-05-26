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
  STAFF,
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

/* ------------------------------------------------------------------ *
 * 스태프 전용 비공개 운영 안내 — 제3회 강정피스앤뮤직캠프.
 * 자료 출처: '자원봉사 및 운영계획안' PDF + docs(기획안·체크리스트) + 웹 콘텐츠.
 * 검색 차단(noIndex) 페이지로, 기획단·자원봉사자 대상 내부 운영 안내 용도.
 * 숙소·배정 등 공유 데이터는 @/data/camp2026Guide 에서 가져온다.
 * ------------------------------------------------------------------ */

// 장터 셀러 모집 구글폼
const MARKET_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScJuJdaoJ7r6VQCPIGGxR83krpcAHx0EVgqCPwMPb8M1U4clw/viewform';

// 1) 기본 운영 일정 — 사전 준비부터 철수까지. 담당: 이상 (역할 관계없이 가능한 사람 결합)
const OPERATION_SCHEDULE: { date: string; tasks: string[] }[] = [
  { date: '6/2', tasks: ['새방밧 이불 세탁 및 청소'] },
  { date: '6/3', tasks: ['강정평화센터 정리 및 나무 빠레트 가져오기, 깃발 준비작업 (오후부터 시작)'] },
  {
    date: '6/4',
    tasks: ['빠레트 제작 작업 (오후부터 시작)', '아시바, 무대 현수막, 깃발 설치 (오후부터 시작)', '조명 작업 (밤)'],
  },
  {
    date: '6/5',
    tasks: [
      '음향 세팅, 자바라 설치, 의자·테이블 등 준비물 옮기기, 공간 세팅 (10시부터 시작)',
      '전기 관련 장비 철거, 조직위 부스 정리 (종료 직후)',
    ],
  },
  {
    date: '6/6',
    tasks: ['철거할 것 다시 세팅 (10시부터 시작)', '철거할 것들 정리 (종료 직후)'],
  },
  {
    date: '6/7',
    tasks: ['철거할 것 다시 세팅 (9시부터 시작)', '철거할 것들 정리 (종료 직후)'],
  },
  { date: '6/8', tasks: ['강정체육공원 정리, 숙소 정리, 최종 정리 (9시부터 시작)'] },
];

// 2) 역할 분담
const ROLE_ASSIGNMENTS: { role: string; people: string; notes: string[] }[] = [
  {
    role: '자봉 소통 총괄',
    people: '이상, 장하나',
    notes: ['자원봉사자 조직 / 업무 가이드라인 공유 / 소통 총괄'],
  },
  {
    role: '조직위 부스',
    people: '장하나, 윰, 애나, 유니타, 찬',
    notes: [
      '티켓·티셔츠 확인·판매·안내 (3~4인 업무, 1~2인 휴식 로테이션)',
      '행사 1시간 전까지 도착 · 업무내용은 장하나·윰이 현장에서 안내',
    ],
  },
  {
    role: '실크스크린 보조',
    people: '까르',
    notes: ['5일·6일 진행 (5일 한 타임, 6일 세 타임)', '그린씨와 소통하여 도착 시간 확인'],
  },
  {
    role: '빠에야 보조',
    people: '6일 자파리 3인 / 7일 조은, 타라',
    notes: [
      '6일·7일 진행 (1인 업무, 1인 휴식 로테이션)',
      '판매지원(계좌안내·이체확인·서빙 등), 설거지',
      '6일 낮 12시 콜, 7일 오전 11시 콜',
    ],
  },
  {
    role: '장터 및 뮤지션 안내',
    people: '남수, 자이, 밍키(금일)',
    notes: [
      '장터 셀러 소통 및 문의 창구 담당',
      '뮤지션 명단 확인·명찰 제공·물 나눠주기·대기 안내',
      '업무내용·콜시간 남수가 밍키에게 전달',
    ],
  },
  {
    role: '주차 안내',
    people: '정진석, 진석 지인, 버들',
    notes: ['주차 안내 (2인 업무, 1인 휴식 로테이션)', '콜시간 오전 10시 (7일은 9시) · 업무내용 5일 전달'],
  },
  {
    role: '화장실 안내',
    people: '정훈, 양상',
    notes: ['성중립화장실 운영·중간 청소 등 (1인 업무, 1인 휴식 로테이션)', '행사 1시간 전 도착'],
  },
  {
    role: '숙소 매니저',
    people: '장하나, 남수, 밍키',
    notes: [
      '매일 체크인/아웃 확인 → 오전 11시 방문 앞 명단 부착 · 숙소 문의 창구 · 쓰레기 분리수거 확인',
      '마을 도착하는 대로 업무내용 전달',
    ],
  },
  {
    role: '성평등 매니저',
    people: '이상, 윰',
    notes: ['성폭력 사건 발생 시 피해호소인 지원 및 가해지목인 격리 역할'],
  },
  { role: '기타 민원 매니저', people: '장하나', notes: ['기타 민원 대응'] },
  {
    role: '무대·행사장 공간 구획/제작/세팅',
    people: '가능한 모두',
    notes: ['무대 제작, 흡연 구역, 부스별 이름표, 기기 세팅 등'],
  },
  { role: '철수 및 뒷정리', people: '가능한 모두', notes: ['마치 아무 일도 없었던 것처럼'] },
];

// 정산·리워드 — 기획안 §5.7 + 자원봉사 운영계획 반영
const REWARDS: string[] = [
  '수익 배분 — 총수익금을 참여 뮤지션 및 스태프(자원봉사자 포함)가 1/N로 배분합니다. ※ 수익이 없을 경우 지급 불가 (사전 고지)',
  '기획단·자원봉사자 — 참여한 일 수만큼 초대권 등을 제공합니다.',
  '숙박·식사 지원 — 강정마을 내 숙박을 무료로 제공하고, 참여일에 식사 1끼 및 뒤풀이 안주를 제공합니다.',
  '스태프 명찰 제공',
];

const NAV_SECTIONS: { id: string; label: string }[] = [
  { id: 'info', label: '핵심 정보' },
  { id: 'schedule', label: '운영 일정' },
  { id: 'roles', label: '역할 분담' },
  { id: 'timetable', label: '공연 타임테이블' },
  { id: 'lodging', label: '숙소 배정' },
  { id: 'market', label: '장터 운영' },
  { id: 'rewards', label: '정산·리워드' },
  { id: 'org', label: '운영진' },
];

const CampStaff2026Page: React.FC<StaffPageProps> = ({
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
      title="제3회 강정피스앤뮤직캠프 스태프 운영 안내"
      description="제3회 강정피스앤뮤직캠프 기획단·자원봉사자를 위한 내부 운영 안내 페이지입니다."
      noIndex
      disableTopPadding
    >
      <PageHero
        title="스태프 운영 안내"
        subtitle='제3회 강정피스앤뮤직캠프 "전쟁을 끝내자!"'
        backgroundImage="/images-webp/camps/2026/hero-gangjeong-2026.webp"
      />

      <Section background="white" paddingTop="loose" paddingBottom="loose">
        <Container size="content">
          {/* 비공개 안내 배너 */}
          <div className="mb-8 rounded-xl border border-golden-sun/50 bg-sunlight-glow/40 p-4 text-sm text-coastal-gray">
            <p className="font-semibold text-deep-ocean mb-1">기획단·자원봉사자 전용 운영 안내</p>
            <p>
              이 페이지는 검색에 노출되지 않는 비공개 운영 안내입니다. 개인 연락처·숙소 배정 등 민감한 정보가 포함되어
              있으니, 공유 시 운영진 외부로 유출되지 않도록 주의해주세요. 가능한 참여 일정을 미리 알려주시면 배치에 큰
              도움이 됩니다.
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
            {/* 1. 핵심 정보 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="info" index={1} title="핵심 정보" />
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

            {/* 2. 운영 일정 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="schedule" index={2} title="운영 일정 (사전 준비 ~ 철수)" />
              <p className="text-sm text-coastal-gray mb-5">
                역할에 관계없이 가능한 사람이 결합합니다. <strong className="text-deep-ocean">가능하신 일정을 미리 알려주세요!</strong>{' '}
                (기본 담당: 이상)
              </p>
              <ol className="space-y-3">
                {OPERATION_SCHEDULE.map((d) => (
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
              <SectionHeading id="roles" index={3} title="역할 분담" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROLE_ASSIGNMENTS.map((r) => (
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

            {/* 4. 공연 타임테이블 — 원본 타임테이블(timetable-2026)에서 직접 읽어옴 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="timetable" index={4} title="공연 타임테이블" />
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

            {/* 5. 숙소 배정 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="lodging" index={5} title="숙소 배정" />

              {/* 공통 안내 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-2">공통 안내사항</h3>
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

              {/* 일자별 배정 */}
              <h3 className="text-base font-semibold text-jeju-ocean mb-3">일자별 배정</h3>
              {ASSIGN_TABLES.map((tbl) => (
                <AssignmentTable key={tbl.title} table={tbl} />
              ))}

              {/* 기타 배정 */}
              <h4 className="text-base font-semibold text-jeju-ocean mb-2 mt-6">기타</h4>
              <div className="overflow-hidden rounded-xl border border-seafoam/40">
                <ul className="divide-y divide-seafoam/30">
                  {ETC_LODGING.map((e) => (
                    <li key={e.name} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 px-4 py-3">
                      <span className="font-medium text-deep-ocean sm:w-48 sm:flex-shrink-0">{e.name}</span>
                      <span className="text-sm text-coastal-gray">{e.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 6. 장터 운영 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="market" index={6} title="장터 운영 — (전쟁을) 끝내장터" />
              <BulletList
                items={[
                  '최대 15팀 셀러 모집 · 우천 시 취소',
                  '장터 셀러 소통 및 문의 창구는 남수·자이가 담당합니다.',
                ]}
              />
              <div className="mt-5 rounded-xl border border-seafoam/40 bg-ocean-sand/40 p-5 sm:p-6">
                <h3 className="text-base font-bold text-deep-ocean mb-1">장터 셀러 모집 신청</h3>
                <p className="text-sm text-coastal-gray mb-4">
                  셀러로 참여를 원하시면 아래 구글폼으로 신청해주세요.
                </p>
                <a
                  href={MARKET_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-jeju-ocean px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-deep-ocean"
                >
                  장터 신청 구글폼 열기
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 7. 정산 · 리워드 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="rewards" index={7} title="정산 및 리워드" />
              <BulletList items={REWARDS} />
            </motion.div>

            <hr className="border-coastal-gray/20 my-10" />

            {/* 8. 운영진 */}
            <motion.div variants={itemVariants}>
              <SectionHeading id="org" index={8} title="운영진" />
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

            {/* 운영지침 + 뮤지션 안내 링크 */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-seafoam/40 bg-ocean-sand/40 p-5 sm:p-6">
                <h3 className="text-base font-bold text-deep-ocean mb-1">캠프 운영지침 (우리의 약속)</h3>
                <p className="text-sm text-coastal-gray mb-3">
                  안전하고 평등한 캠프를 위한 행동 약속과 신고·대응 절차를 꼭 숙지해주세요.
                </p>
                <Link
                  href="/camps/2026/guidelines"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-jeju-ocean hover:underline"
                >
                  운영지침 보기
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="rounded-xl border border-seafoam/40 bg-ocean-sand/40 p-5 sm:p-6">
                <h3 className="text-base font-bold text-deep-ocean mb-1">뮤지션 안내</h3>
                <p className="text-sm text-coastal-gray mb-3">
                  참여 뮤지션 대상 안내(부대 프로그램·예산 등)도 함께 확인할 수 있습니다.
                </p>
                <Link
                  href="/camps/2026/guide"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-jeju-ocean hover:underline"
                >
                  뮤지션 안내 보기
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
            className="inline-flex items-center gap-2 text-sm text-jeju-ocean hover:underline font-medium"
          >
            <span aria-hidden="true">←</span>
            {t('nav.camp_2026', { defaultValue: '캠프 2026' })}
          </Link>
        </Container>
      </Section>
    </PageLayout>
  );
};

export default CampStaff2026Page;
