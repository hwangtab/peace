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

interface GuidePageProps {
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ------------------------------------------------------------------ *
 * 안내 책자 콘텐츠 — 제3회 강정피스앤뮤직캠프 뮤지션 안내 책자 기반.
 * 비공개(검색 차단) 페이지로, 뮤지션·스태프 대상 내부 안내 용도.
 * ------------------------------------------------------------------ */

const OVERVIEW: { label: string; value: string }[] = [
  { label: '행사명', value: '제3회 강정피스앤뮤직캠프 "전쟁을 끝내자!"' },
  { label: '일시', value: '2026년 6월 5일(금) ~ 7일(일) · 2박 3일' },
  { label: '장소', value: '강정체육공원 (제주도 서귀포시 이어도로 667)' },
];

const PURPOSE: string[] = [
  '한국전쟁 정전 74년, 러우전쟁, 이스라엘의 팔레스타인 학살, 미국의 베네수엘라·이란 침략 등 끊이지 않는 전쟁과 국제정세의 불안 속에서 음악을 통해 반전과 평화의 메시지를 되새기고 연대의 경험을 공유합니다.',
  '제주해군기지 준공 10년을 맞아 미중 패권다툼의 전초기지가 되어가고 있는 현실에 맞서, 해군기지 폐쇄와 비무장 평화의 섬 실현을 위해 19년째 투쟁하고 있는 강정평화운동과의 연대망을 형성합니다.',
];

const BOOTH_ITEMS: string[] = [
  '인포메이션 센터 — 티켓 및 리워드 확인',
  '현장 판매 — 티켓, 티셔츠, 뮤지션 MD, 주류, 빠에야 등',
  '타투라쿤 현장 타투 — 1만원 이상 후원, 전액 기부',
  '그린씨 실크스크린 — 1만원, 2일~5일 / 6일 하루 3타임, 회차당 30명 참여 가능, 전액 기부',
];

const LODGING_NOTICE: string[] = [
  '2일 이상 머무르시는 경우 일자별로 숙소가 변경될 수 있습니다. 꼼꼼히 확인 바랍니다.',
  '체크인/아웃 시간은 오전 11시입니다. 다음 입주자를 위해 이부자리 및 객실을 깨끗이 정리하고 퇴실해주시기 바랍니다.',
  '오전 11시를 기준으로 방문 앞에 당일 숙박 명단을 부착할 예정입니다.',
];

interface LodgingInfo {
  name: string;
  address: string;
  rooms: string[];
  contacts: { when: string; name: string; phone: string }[];
  note?: string;
}

const LODGINGS: LodgingInfo[] = [
  {
    name: '성프란치스코평화센터',
    address: '서귀포시 말질로 187',
    rooms: [
      '3층 방 6개 (화장실/샤워실 복도 공용)',
      '4층 공동식당 및 방 1개 (화장실/샤워실 복도 공용)',
      '5층 다락 방 1개 (화장실/샤워실 포함)',
    ],
    contacts: [
      { when: '입소 전', name: '이상', phone: '010-2379-0760' },
      { when: '입소 후', name: '남수', phone: '010-5150-9407' },
    ],
    note: '주차장 만차 시 농협 주차장 이용',
  },
  {
    name: '서부민박',
    address: '서귀포시 이어도로 602',
    rooms: [
      '2층 방 4개 (화장실/샤워실 포함), 주방 및 공용거실',
      '3층 방 2개 (주방 및 공용거실 통으로, 화장실/샤워실 포함)',
    ],
    contacts: [
      { when: '입소 전', name: '이상', phone: '010-2379-0760' },
      { when: '입소 후', name: '장하나', phone: '010-3693-3971' },
    ],
    note: '김영관센터 주차장에 주차 후 도보로 이동',
  },
  {
    name: '새방밧',
    address: '서귀포시 강정통물로 53',
    rooms: ['2층 방 2개 (화장실/샤워실/공용주방 바깥에)'],
    contacts: [
      { when: '입소 전', name: '이상', phone: '010-2379-0760' },
      { when: '입소 후', name: '밍키', phone: '010-5464-5232' },
    ],
  },
];

interface AssignTable {
  title: string;
  headers: string[];
  rows: string[][];
}

const ASSIGN_TABLES: AssignTable[] = [
  {
    title: '성프란치스코평화센터',
    headers: ['방', '6/4', '6/5', '6/6', '6/7'],
    rows: [
      ['3층 1번', '남수', '남수, 뮁', '남수, 까르', '남수, 까르'],
      ['3층 2번', '뮁', '지누콘다, 나무꾼민건', '뮁, 온가영', '뮁, 온가영'],
      ['3층 3번', '자이', '자이, 윤선애', '자이, 손현숙', '자이, 손현숙'],
      ['3층 4번', '장하나', '손지연', '모모', '장하나'],
      ['3층 5번', '타투라쿤', 'HANASH', '블로꾸 남자 1인, 제트싸이저', '타투라쿤'],
      ['3층 사제관', '', '머티리얼즈 파운드', '지누콘다, 메리디에스, 사바하, 사이트', '불가사리 즉흥세션 3인'],
      ['4층 쉼팡', '', '키타와 올겐', '임정득', '임정득'],
      ['5층 다락', '', '메리디에스, 허정혁, 태준', '허니위스키', '태준'],
    ],
  },
  {
    title: '서부민박',
    headers: ['방', '6/5', '6/6', '6/7'],
    rows: [
      ['2층 1번', '김동산과 블루이웃 4인', '김동산과 블루이웃 4인', '권동희'],
      ['2층 2번', '치치, 황경하, 권동희', '치치, 황경하, 권동희, 김동산과 블루이웃 1인', '치치, 황경하'],
      ['2층 3번', '블로꾸 남자 4인', 'Joon Lee (2)', '하주원, 오재환'],
      ['2층 4번', '치치 동반 여성 2인', '치치 동반 여성 2인', '치치 동반 여성 2인'],
      ['3층', '블로꾸 여성 9인, 장하나, 두리, 타투라쿤, 윤숭', '블로꾸 여성 3인, 장하나, 두리, 타투라쿤, 윤숭', '김동산과 블루이웃 5인'],
    ],
  },
  {
    title: '새방밧',
    headers: ['방', '6/4', '6/5', '6/6', '6/7'],
    rows: [
      ['2층 왼쪽방', 'TAGI', 'TAGI', 'TAGI', 'TAGI'],
      ['2층 오른쪽방', '정진석, 치치, 황경하', '제트싸이저, 사이트, 사바하', '안티 스트레스, 태준', '제트싸이저, 사이트, 사바하'],
    ],
  },
];

const ETC_LODGING: { name: string; detail: string }[] = [
  { name: '강가희말라야 + 1인', detail: '2일~9일 낭&탄탄 집 숙박' },
  { name: '삼각전파사 + 반려견', detail: '6일, 7일 카페 공간 숙박' },
  { name: '치치', detail: '3·4·8일 새방밧 숙박 / 5·6·7일 위 숙소 중 배분' },
  { name: '정진석', detail: '3·4·8일 새방밧 숙박 / 5·6·7일 이상 집 숙박' },
  { name: '황경하', detail: '3·4·8일 새방밧 숙박 / 5·6·7일 위 숙소 중 배분' },
  { name: '김동산과 블루이웃', detail: '8일(4인)·9일(2인) 새방밧 숙박 / 5·6·7일 위 숙소 중 배분' },
];

const STAFF: { role: string; people: string }[] = [
  { role: '총괄 디렉터', people: '이상' },
  { role: '장터 기획 및 담당', people: '남수, 자이' },
  { role: '자원봉사자 조직 및 소통 총괄', people: '이상, 장하나' },
  { role: '아티스트 소통', people: '곽민, 박예찬, 자이, 황경하' },
  { role: '텀블벅', people: '장하나' },
  { role: '현장 기반 준비', people: '이상, 장하나' },
  { role: '단체 조직', people: '이상, 장하나' },
  { role: '홍보', people: '이상, 장하나, 황경하, 치치' },
  { role: '디자인', people: '김홍범' },
  { role: '회계', people: '장하나' },
  { role: '무대 및 기술 감독', people: '황경하' },
  { role: '음향 감독', people: '황경하, 곽민' },
  { role: '현장 운영 / 자원봉사자 조직·운영 / 무대 및 공간 디자인·제작', people: '윰, 이상, 이한주, 정진석, 장하나' },
  { role: '다큐 제작', people: '치치, 하띠, 황경하' },
  { role: '아카이브 기록(사진)', people: '권동희, 김동희' },
  { role: '자원봉사자', people: '타투라쿤, 그린씨, 조은, 애나, 유니타, 양상, 버들, 타라, 자파리 3인' },
];

const BUDGET: string[] = [
  '수익 배분 — 총수익금을 참여 뮤지션 및 스태프(자원봉사자 포함)가 1/N로 배분합니다. ※ 수익이 없을 경우 지급 불가 (사전 고지)',
  '숙박 지원 — 참여 뮤지션 및 스태프에게 강정마을 내 숙박을 무료로 제공합니다.',
  '스태프 명찰 제공',
  '뮤지션 제공 물품 — 식사권, 물(부스 비치), 지도 노트 커버(팀당 1~2장), 티셔츠',
  '뮤지션은 공연하는 날 1끼 식사를 제공합니다. 공연하지 않는 날은 관객으로 참여하실 수 있습니다.',
];

const NAV_SECTIONS: { id: string; label: string }[] = [
  { id: 'overview', label: '개요' },
  { id: 'purpose', label: '취지·기조' },
  { id: 'lineup', label: '공연 타임테이블' },
  { id: 'programs', label: '부대 프로그램' },
  { id: 'access', label: '오시는 길·숙박·식사' },
  { id: 'staff', label: '운영진' },
  { id: 'budget', label: '예산·정산' },
];

/* --- 재사용 소형 컴포넌트 --- */

const SectionHeading: React.FC<{ id: string; index: number; title: string }> = ({ id, index, title }) => (
  <h2 id={id} className="scroll-mt-28 text-xl sm:text-2xl font-bold text-deep-ocean mb-4 flex items-baseline gap-2">
    <span className="text-jeju-ocean tabular-nums">{index}.</span>
    <span>{title}</span>
  </h2>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item) => (
      <li key={item.slice(0, 60)} className="flex gap-2 typo-body text-coastal-gray leading-relaxed">
        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-jeju-ocean" aria-hidden="true" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const phoneHref = (phone: string) => `tel:${phone.replace(/-/g, '')}`;

const AssignmentTable: React.FC<{ table: AssignTable }> = ({ table }) => (
  <div className="mb-6">
    <h4 className="text-base font-semibold text-jeju-ocean mb-2">{table.title}</h4>
    <div className="overflow-x-auto rounded-xl border border-seafoam/40">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="bg-sky-horizon/60">
            {table.headers.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={`px-3 py-2 text-left font-semibold text-deep-ocean whitespace-nowrap ${
                  i === 0 ? 'sticky left-0 bg-sky-horizon/60 z-10' : ''
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row[0]} className="border-t border-seafoam/30 even:bg-ocean-sand/30">
              {row.map((cell, i) => (
                <td
                  key={i}
                  className={`px-3 py-2 align-top text-coastal-gray ${
                    i === 0
                      ? 'sticky left-0 bg-white even:bg-ocean-sand/30 font-medium text-deep-ocean whitespace-nowrap z-10'
                      : ''
                  }`}
                >
                  {cell || <span className="text-coastal-gray/40">–</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

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
                ※ 강가희말라야, 삼각전파사 님의 숙소 안내는 별도로 진행 예정입니다.
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

export default CampMusicianGuide2026Page;
