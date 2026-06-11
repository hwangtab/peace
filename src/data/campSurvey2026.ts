// 제3회 강정 피스앤뮤직캠프 뮤지션 설문 문항 정의.
// 각 문항 key 는 Supabase `camp_survey_responses` 테이블의 컬럼명과 1:1로 일치시킨다
// (제출 시 그대로 spread 하므로 이름이 어긋나면 저장이 깨진다).

export const CAMP_EDITION = 3;

export interface RatingQuestion {
  key: string;
  label: string;
  minLabel?: string;
  maxLabel?: string;
}

export interface TextQuestion {
  key: string;
  label: string;
  placeholder?: string;
  maxLength: number;
  rows?: number;
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  ratings: RatingQuestion[];
  texts: TextQuestion[];
}

const SATISFACTION = { minLabel: '매우 불만족', maxLabel: '매우 만족' } as const;
const AGREEMENT = { minLabel: '전혀 아니다', maxLabel: '매우 그렇다' } as const;

export const SURVEY_SECTIONS: SurveySection[] = [
  {
    id: 'overall',
    title: '전반 평가',
    ratings: [
      {
        key: 'overall_rating',
        label: '이번 캠프에 전반적으로 얼마나 만족하셨나요?',
        ...SATISFACTION,
      },
      {
        key: 'recommend_rating',
        label: '동료 뮤지션에게 "너도 꼭 서봐"라고 추천하고 싶은 정도',
        ...AGREEMENT,
      },
    ],
    texts: [
      {
        key: 'best_moment',
        label: '가장 좋았던 순간 한 가지를 들려주세요',
        placeholder: '무대, 사람, 풍경 — 어떤 장면이든 좋아요.',
        maxLength: 2000,
        rows: 3,
      },
    ],
  },
  {
    id: 'operation',
    title: '영역별 운영 평가',
    description: '다음 회차를 더 낫게 만들기 위한 질문입니다. 해당 없는 항목은 비워 두셔도 됩니다.',
    ratings: [
      {
        key: 'stage_sound_rating',
        label: '무대·음향/모니터, 리허설·사운드체크 운영',
        ...SATISFACTION,
      },
      { key: 'timetable_rating', label: '타임테이블·진행 흐름', ...SATISFACTION },
      { key: 'lodging_rating', label: '숙소(2박 환경)', ...SATISFACTION },
      { key: 'meals_rating', label: '식사', ...SATISFACTION },
      { key: 'transport_rating', label: '제주/강정 이동·교통', ...SATISFACTION },
      { key: 'staff_comm_rating', label: '스태프·자원봉사자 소통과 응대', ...SATISFACTION },
      { key: 'pre_comm_rating', label: '출연 안내·정산 등 사전 커뮤니케이션', ...SATISFACTION },
    ],
    texts: [
      {
        key: 'improvement',
        label: '가장 불편했거나 꼭 고쳐졌으면 하는 점',
        placeholder: '솔직할수록 큰 힘이 됩니다.',
        maxLength: 2000,
        rows: 3,
      },
      {
        key: 'suggestion',
        label: '그 외 운영진에게 제안하고 싶은 아이디어 (선택)',
        maxLength: 2000,
        rows: 3,
      },
    ],
  },
  {
    id: 'open',
    title: '열린 캠프',
    description: '이번 캠프가 시도한 포용적·개방적 환경에 대한 질문입니다.',
    ratings: [
      {
        key: 'genderneutral_restroom_rating',
        label: '성중립 화장실 운영은 어땠나요?',
        ...SATISFACTION,
      },
      {
        key: 'open_access_rating',
        label: '티켓 없이도 드나들 수 있던 개방적인 출입 환경은 어땠나요?',
        ...SATISFACTION,
      },
    ],
    texts: [
      {
        key: 'genderneutral_restroom_comment',
        label: '성중립 화장실에 대해 느낀 점이나 제안이 있다면 (선택)',
        maxLength: 2000,
        rows: 2,
      },
      {
        key: 'open_access_comment',
        label: '티켓 없는 개방적 출입 환경에 대해 느낀 점이 있다면 (선택)',
        maxLength: 2000,
        rows: 2,
      },
    ],
  },
  {
    id: 'peace',
    title: '평화, 우리의 무대',
    description: '이 캠프만이 던질 수 있는 질문입니다.',
    ratings: [
      {
        key: 'peace_comfort_rating',
        label: '무대에서 평화·강정·연대 메시지를 표현하기에 편안했다',
        ...AGREEMENT,
      },
      {
        key: 'peace_attitude_rating',
        label: '이번 캠프 참여가 전쟁·평화·강정 문제에 대한 나의 관심/태도에 영향을 줬다',
        ...AGREEMENT,
      },
      {
        key: 'peace_empathy_rating',
        label: '가자·강정·팔레스타인 연대라는 캠프의 메시지에 공감했다',
        ...AGREEMENT,
      },
    ],
    texts: [
      {
        key: 'peace_reflection',
        label: '이번 캠프에서 평화에 대해 새롭게 느끼거나 다짐한 것이 있다면 (선택)',
        maxLength: 2000,
        rows: 3,
      },
    ],
  },
  {
    id: 'next',
    title: '다음을 위하여',
    ratings: [{ key: 'rejoin_rating', label: '내년 제4회 캠프에도 함께하고 싶다', ...AGREEMENT }],
    texts: [
      {
        key: 'recommend_musicians',
        label: '함께 무대에 서면 좋을 동료 뮤지션을 추천해 주세요 (선택)',
        placeholder: '팀명 / 알고 계시면 연락처나 인스타도 함께 적어주세요.',
        maxLength: 1000,
        rows: 2,
      },
      {
        key: 'one_line_intro',
        label: '다른 뮤지션·관객에게 이 캠프를 한 줄로 소개한다면?',
        placeholder: '홍보에 인용될 수 있는 한 줄 ✨',
        maxLength: 300,
        rows: 2,
      },
      {
        key: 'last_words',
        label: '마지막으로 운영진에게 하고 싶은 말 (선택)',
        maxLength: 2000,
        rows: 3,
      },
    ],
  },
];

export interface ConsentOption {
  key: 'consent_quote_named' | 'consent_quote_anon' | 'consent_photo';
  label: string;
}

export type ConsentKey = ConsentOption['key'];
export type SurveyRatings = Record<string, number | null>;
export type SurveyTexts = Record<string, string>;
export type SurveyConsents = Record<ConsentKey, boolean>;
export type SurveyInsertPayload = Record<string, boolean | number | string | string[] | null>;

export const CONSENT_OPTIONS: ConsentOption[] = [
  {
    key: 'consent_quote_named',
    label: '내 후기(한 줄 소개 등)를 이름과 함께 홍보에 사용해도 좋습니다.',
  },
  { key: 'consent_quote_anon', label: '내 후기를 이름 없이(익명) 사용해도 좋습니다.' },
  { key: 'consent_photo', label: '캠프에서 찍힌 내 무대 사진·영상을 홍보에 사용해도 좋습니다.' },
];

// 응답자 유형 — 한 사람이 여러 역할을 겸할 수 있어 다중선택. key 는 respondent_roles 배열 값.
export interface RoleOption {
  key: string;
  label: string;
}
export const ROLE_OPTIONS: RoleOption[] = [
  { key: 'musician', label: '뮤지션' },
  { key: 'staff', label: '스태프·자원봉사' },
  { key: 'audience', label: '관객' },
  { key: 'seller', label: '셀러(마켓)' },
];

export const RATING_VALUES = [1, 2, 3, 4, 5] as const;

// 폼 초기화 / 제출 매핑에 쓰는 전체 컬럼 key 목록.
export const ALL_RATING_KEYS = SURVEY_SECTIONS.flatMap((s) => s.ratings.map((r) => r.key));
export const ALL_TEXT_KEYS = SURVEY_SECTIONS.flatMap((s) => s.texts.map((t) => t.key));

const TEXT_QUESTION_BY_KEY = new Map(
  SURVEY_SECTIONS.flatMap((section) => section.texts).map((question) => [question.key, question])
);

export const buildInitialSurveyRatings = (): SurveyRatings =>
  Object.fromEntries(ALL_RATING_KEYS.map((key) => [key, null])) as SurveyRatings;

export const buildInitialSurveyTexts = (): SurveyTexts =>
  Object.fromEntries(ALL_TEXT_KEYS.map((key) => [key, ''])) as SurveyTexts;

const normalizeRating = (value: number | null | undefined) =>
  RATING_VALUES.includes(value as (typeof RATING_VALUES)[number]) ? value : null;

const normalizeText = (key: string, value: string | undefined) => {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;

  const maxLength = TEXT_QUESTION_BY_KEY.get(key)?.maxLength;
  return maxLength ? trimmed.slice(0, maxLength) : trimmed;
};

export const buildSurveyInsertPayload = ({
  respondentName,
  contactInstagram,
  contactEmail,
  contactPhone,
  privacyConsent,
  roles,
  ratings,
  texts,
  consents,
  userAgent,
}: {
  respondentName: string;
  contactInstagram: string;
  contactEmail: string;
  contactPhone: string;
  privacyConsent: boolean;
  roles: string[];
  ratings: SurveyRatings;
  texts: SurveyTexts;
  consents: SurveyConsents;
  userAgent: string | null;
}): SurveyInsertPayload => ({
  camp_edition: CAMP_EDITION,
  respondent_name: respondentName.trim(),
  contact_instagram: contactInstagram.trim() || null,
  contact_email: contactEmail.trim() || null,
  contact_phone: contactPhone.trim() || null,
  consent_privacy: privacyConsent,
  respondent_roles: roles.length ? roles : null,
  ...Object.fromEntries(ALL_RATING_KEYS.map((key) => [key, normalizeRating(ratings[key])])),
  ...Object.fromEntries(ALL_TEXT_KEYS.map((key) => [key, normalizeText(key, texts[key])])),
  ...Object.fromEntries(CONSENT_OPTIONS.map(({ key }) => [key, Boolean(consents[key])])),
  locale: 'ko',
  user_agent: userAgent,
});
