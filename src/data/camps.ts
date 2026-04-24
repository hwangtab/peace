/**
 * Camp Events Data
 * Structural data + localized participants/staff/collaborators.
 * Text fields (title, description, location, slogan, shortDescription) are
 * stored in translation JSON files under camp_data.{campId}.* keys.
 */

import { CampEvent, Participant, StaffSection } from '../types/camp';
import { getLanguageCode } from '../utils/localization';

// ---------------------------------------------------------------------------
// Structural data (language-independent)
// ---------------------------------------------------------------------------

interface CampStructural {
  id: string;
  eventType: 'camp';
  year: number;
  startDate: string;
  endDate?: string;
  fundingUrl?: string;
  images: string[];
}

const campsStructural: CampStructural[] = [
  {
    id: 'camp-2023',
    eventType: 'camp',
    year: 2023,
    startDate: '2023-06-10',
    images: [
      '/images-webp/camps/2023/IMG_2465.webp',
      '/images-webp/camps/2023/20230610둘리목걸이고르는.webp',
      '/images-webp/camps/2023/20230610밤 전쟁을끝내자.webp',
      '/images-webp/camps/2023/DSC00451.webp',
      '/images-webp/camps/2023/20230610여울과2.webp',
      '/images-webp/camps/2023/20230610지슬.webp',
      '/images-webp/camps/2023/20230610평화문화셀러.webp',
      '/images-webp/camps/2023/DSC00273.webp',
      '/images-webp/camps/2023/DSC00360.webp',
    ],
  },
  {
    id: 'camp-2025',
    eventType: 'camp',
    year: 2025,
    startDate: '2025-06-14',
    endDate: '2025-06-14',
    images: [
      '/images-webp/camps/2025/peacemusic-1.webp',
      '/images-webp/camps/2025/DSC00427.webp',
      '/images-webp/camps/2025/DSC00491.webp',
      '/images-webp/camps/2025/DSC00524.webp',
      '/images-webp/camps/2025/DSC00533.webp',
      '/images-webp/camps/2025/DSC00547.webp',
      '/images-webp/camps/2025/DSC00559.webp',
      '/images-webp/camps/2025/DSC00625.webp',
      '/images-webp/camps/2025/DSC00667.webp',
    ],
  },
  {
    id: 'camp-2026',
    eventType: 'camp',
    year: 2026,
    startDate: '2026-06-05',
    endDate: '2026-06-07',
    fundingUrl: 'https://tumblbug.com/gpmc3',
    images: [
      '/images-webp/camps/2023/IMG_2064.webp',
      '/images-webp/camps/2026/2026poster1-og.webp',
      '/images-webp/camps/2026/2026poster1.webp',
      '/images-webp/camps/2026/2026poster2.webp',
    ],
  },
];

// ---------------------------------------------------------------------------
// Localized data — participants, staff, collaborators (proper nouns)
// ---------------------------------------------------------------------------

interface CampLocalizedData {
  participants?: (string | Participant)[];
  staff?: StaffSection[];
  collaborators?: string[];
}

const localizedData: Record<string, Record<string, CampLocalizedData>> = {
  ko: {
    'camp-2023': {
      participants: [
        { name: '리테스 마하르잔', musicianId: 1 },
        '블로꾸 빨라지다',
        { name: '여유와 설빈', musicianId: 9 },
        { name: '출장작곡가 김동산', musicianId: 3 },
        { name: '까르', musicianId: 5 },
        { name: '오재환', musicianId: 36 },
        '항아와 민지',
        { name: '태히언', musicianId: 51 },
        'DJ 옥과',
        'DJ 조수간만',
        'Kohey',
      ],
      staff: [
        { role: '기획', members: ['장하나', '이상', '황경하', '자리타', '읭', '안드레아'] },
        { role: '조명', members: ['이상'] },
        { role: '무대', members: ['응'] },
        { role: '음향', members: ['황경하'] },
        { role: '진행', members: ['이상'] },
        { role: '디자인', members: ['여울', '장하나'] },
        { role: '사진', members: ['종은'] },
        { role: '스텝 및 도움 주신 분들', members: ['달해', '도토', '록키', '모레', '민상', '박용성', '산호', '성준', '소설', '여울', '영', '조은', '준후'] },
      ],
      collaborators: [
        '강정마을 해군기지 반대주민회', '강정친구들', '강정평화네트워크',
        '열린 군대를 위한 시민연대', '(재)성프란치스코평화센터',
        '정전 70년 한반도 평화행동', '정치하는 엄마들', '평화바람',
      ],
    },
    'camp-2025': {
      participants: [
        { name: '까르', musicianId: 5 },
        { name: '남수', musicianId: 4 },
        { name: '블로꾸 자파리 & 뽈레뽈레', musicianId: 13 },
        { name: '모레도토요일', musicianId: 7 },
        { name: '오재환', musicianId: 36 },
        { name: '이서영', musicianId: 12 },
        { name: '자이(Jai)', musicianId: 11 },
        { name: '정진석', musicianId: 2 },
        { name: '출장작곡가 김동산', musicianId: 3 },
        { name: '태히언', musicianId: 51 },
        { name: 'HANASH', musicianId: 59 },
      ],
      staff: [
        { role: '기획', members: ['장하나', '이상', '황경하'] },
        { role: '조명', members: ['이상'] },
        { role: '음향', members: ['강경덕'] },
        { role: '진행', members: ['장하나'] },
        { role: '디자인', members: ['도토'] },
        { role: '영상', members: ['황경하'] },
        { role: '사진', members: ['김동희'] },
        { role: '스텝 및 도움 주신 분들', members: ['든든', '려강', '카레', '개미', '수산', '지혜', '버들', '김성환', '이성준'] },
      ],
      collaborators: [
        '가장자리에서', '개척자들', '강정마을 해군기지 반대주민회',
        '강정친구들', '강정평화네트워크', '공간()', '(재)성프란치스코평화센터',
        '전쟁 없는 세상', '정치하는 엄마들', '핫핑크돌핀스',
        '비무장 평화의 섬 제주를 만드는 사람들',
      ],
    },
    'camp-2026': {
      participants: [
        { name: '강가히말라야', musicianId: 14 },
        { name: '까르', musicianId: 5 },
        { name: '길가는밴드 장현호', musicianId: 15 },
        { name: '김동산과 블루이웃', musicianId: 3 },
        { name: '남수', musicianId: 4 },
        { name: '나무꾼민건', musicianId: 17 },
        { name: 'Dear Arcadian', musicianId: 18 },
        { name: 'Rainbow99', musicianId: 20 },
        { name: 'Meridies', musicianId: 21 },
        { name: '모모', musicianId: 10 },
        { name: '모허', musicianId: 22 },
        { name: '모레도토요일', musicianId: 7 },
        { name: '뮁', musicianId: 23 },
        { name: 'Materials Pound', musicianId: 24 },
        { name: '블로꾸 자파리 X 뽈레뽈레 X 북짝북짝', musicianId: 13 },
        { name: '불가사리 즉흥세션', musicianId: 25 },
        { name: 'Sabbaha', musicianId: 26 },
        { name: 'Sight X Zsthyger', musicianId: 27 },
        { name: '선경', musicianId: 29 },
        { name: '손지연', musicianId: 30 },
        { name: '손현숙', musicianId: 31 },
        { name: '송인상', musicianId: 32 },
        { name: '송인효', musicianId: 33 },
        { name: '삼각전파사', musicianId: 34 },
        { name: '안티스트레스', musicianId: 35 },
        { name: '오재환', musicianId: 36 },
        { name: '온가영', musicianId: 37 },
        { name: '여울', musicianId: 38 },
        { name: '윤숭', musicianId: 39 },
        { name: '윤선애', musicianId: 40 },
        { name: '이서영', musicianId: 12 },
        { name: '임정득', musicianId: 42 },
        { name: '자이', musicianId: 11 },
        { name: 'Joon Lee', musicianId: 43 },
        { name: '정진석', musicianId: 2 },
        { name: '조약골', musicianId: 44 },
        { name: '조성일', musicianId: 45 },
        { name: 'Jinu Konda', musicianId: 46 },
        { name: '찬', musicianId: 47 },
        { name: '최상돈 × 김강곤', musicianId: 48 },
        { name: '치치', musicianId: 49 },
        { name: '키타와 올겐', musicianId: 50 },
        { name: '태히언', musicianId: 51 },
        { name: '피움', musicianId: 52 },
        { name: 'TAGI', musicianId: 60 },
        { name: 'HANASH', musicianId: 59 },
        { name: '호와호', musicianId: 53 },
        { name: 'Honey Whiskey', musicianId: 54 },
        { name: '허정혁', musicianId: 55 },
        { name: '황명하', musicianId: 56 },
        { name: '하주원', musicianId: 57 },
        { name: '뺄라지다 X 동백작은학교', musicianId: 58 },
      ],
    },
  },
  en: {
    'camp-2023': {
      participants: [
        { name: 'Project Around Surround', musicianId: 1 },
        'Bloco Palazida',
        { name: 'Yeoyu & Seolbin', musicianId: 9 },
        { name: 'Guest Composer Kim Dongsan', musicianId: 3 },
        { name: 'Caru', musicianId: 5 },
        { name: 'Oh Jaehwan', musicianId: 36 },
        'Hanga & Minji',
        { name: 'Taehyeon', musicianId: 51 },
        'DJ Okgwa',
        'DJ Josuganman',
        'Kohey',
      ],
      staff: [
        { role: 'Planning', members: ['Jang Hana', 'Lee Sang', 'Hwang Gyeongha', 'Jarita', 'Eung', 'Andrea'] },
        { role: 'Lighting', members: ['Lee Sang'] },
        { role: 'Stage', members: ['Eung'] },
        { role: 'Sound', members: ['Hwang Gyeongha'] },
        { role: 'Program', members: ['Lee Sang'] },
        { role: 'Design', members: ['Yeoul', 'Jang Hana'] },
        { role: 'Photography', members: ['Jongeun'] },
        { role: 'Staff and Helpers', members: ['Dalhae', 'Doto', 'Rocky', 'More', 'Minsang', 'Park Yongseong', 'Sanho', 'Seongjun', 'Soseol', 'Yeoul', 'Young', 'Joeun', 'Junhu'] },
      ],
      collaborators: [
        "Gangjeong Village Residents' Committee Against the Naval Base", 'Gangjeong Friends', 'Gangjeong Peace Network',
        "Citizens' Solidarity for an Open Military", 'St. Francis Peace Center Foundation',
        'Korean Peninsula Peace Action for 70 Years of Armistice', 'Mothers Who Do Politics', 'Peace Breeze',
      ],
    },
    'camp-2025': {
      participants: [
        { name: 'Caru', musicianId: 5 },
        { name: 'Namsu', musicianId: 4 },
        { name: 'Bloco Jafari & PollePolle', musicianId: 13 },
        { name: 'MoredoSaturday', musicianId: 7 },
        { name: 'Oh Jaehwan', musicianId: 36 },
        { name: 'Lee Seoyoung', musicianId: 12 },
        { name: 'Jai', musicianId: 11 },
        { name: 'Jeong Jinseok', musicianId: 2 },
        { name: 'Guest Composer Kim Dongsan', musicianId: 3 },
        { name: 'Taehyeon', musicianId: 51 },
        { name: 'HANASH', musicianId: 59 },
      ],
      staff: [
        { role: 'Planning', members: ['Jang Hana', 'Lee Sang', 'Hwang Gyeongha'] },
        { role: 'Lighting', members: ['Lee Sang'] },
        { role: 'Sound', members: ['Kang Kyungdeok'] },
        { role: 'Program', members: ['Jang Hana'] },
        { role: 'Design', members: ['Doto'] },
        { role: 'Video', members: ['Hwang Gyeongha'] },
        { role: 'Photography', members: ['Kim Donghee'] },
        { role: 'Staff and Helpers', members: ['Deundeun', 'Ryeogang', 'Kare', 'Gaemi', 'Susan', 'Jihye', 'Beodeul', 'Kim Seonghwan', 'Lee Seongjun'] },
      ],
      collaborators: [
        'At the Margins', 'Pioneers', "Gangjeong Village Residents' Committee Against the Naval Base",
        'Gangjeong Friends', 'Gangjeong Peace Network', 'Space ()', 'St. Francis Peace Center Foundation',
        'A World Without War', 'Mothers Who Do Politics', 'Hot Pink Dolphins',
        'People Creating Jeju, the Demilitarized Peace Island',
      ],
    },
    'camp-2026': {
      participants: [
        { name: 'Ganghahimalaya', musicianId: 14 },
        { name: 'Caru', musicianId: 5 },
        { name: 'Gilganeun Band Janghyeonho', musicianId: 15 },
        { name: 'Kim Dongsan & Blue Neighbors', musicianId: 3 },
        { name: 'Namsu', musicianId: 4 },
        { name: 'Namukkunmingeon', musicianId: 17 },
        { name: 'Dear Arcadian', musicianId: 18 },
        { name: 'Rainbow99', musicianId: 20 },
        { name: 'Meridies', musicianId: 21 },
        { name: 'Momo', musicianId: 10 },
        { name: 'Moheo', musicianId: 22 },
        { name: 'MoredoSaturday', musicianId: 7 },
        { name: 'Mwing', musicianId: 23 },
        { name: 'Materials Pound', musicianId: 24 },
        { name: 'Bloco Jafari X PollePolle X Bukjakbukjak', musicianId: 13 },
        { name: 'Bulgasari Impromptu Session', musicianId: 25 },
        { name: 'Sabbaha', musicianId: 26 },
        { name: 'Sight X Zsthyger', musicianId: 27 },
        { name: 'Seongyeong', musicianId: 29 },
        { name: 'Son Jiyeon', musicianId: 30 },
        { name: 'Son Hyunsuk', musicianId: 31 },
        { name: 'Song Insang', musicianId: 32 },
        { name: 'Song Inhyo', musicianId: 33 },
        { name: 'Samgak Jeonpasa', musicianId: 34 },
        { name: 'Anti Stress', musicianId: 35 },
        { name: 'Oh Jaehwan', musicianId: 36 },
        { name: 'On Gayeong', musicianId: 37 },
        { name: 'Yeoul', musicianId: 38 },
        { name: 'Yoon Soong', musicianId: 39 },
        { name: 'Yoon Seonae', musicianId: 40 },
        { name: 'Lee Seoyoung', musicianId: 12 },
        { name: 'Lim Jeongdeuk', musicianId: 42 },
        { name: 'Jai', musicianId: 11 },
        { name: 'Joon Lee', musicianId: 43 },
        { name: 'Jeong Jinseok', musicianId: 2 },
        { name: 'Joyakgol', musicianId: 44 },
        { name: 'Jo Seongil', musicianId: 45 },
        { name: 'Jinukonda', musicianId: 46 },
        { name: 'Chan', musicianId: 47 },
        { name: 'Choi Sangdon × Kim Ganggon', musicianId: 48 },
        { name: 'Chichi', musicianId: 49 },
        { name: 'Kita & Olgen', musicianId: 50 },
        { name: 'Taehyeon', musicianId: 51 },
        { name: 'Pium', musicianId: 52 },
        { name: 'TAGI', musicianId: 60 },
        { name: 'HANASH', musicianId: 59 },
        { name: 'Howaho', musicianId: 53 },
        { name: 'Honey Whiskey', musicianId: 54 },
        { name: 'Heo Jeonghyeok', musicianId: 55 },
        { name: 'Hwang Myeongha', musicianId: 56 },
        { name: 'Ha Juwon', musicianId: 57 },
        { name: 'Ppalajida X Dongbaek Small School', musicianId: 58 },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

type TranslationFn = (key: string) => string;

/**
 * Get camps with translated text fields.
 * @param language - locale code
 * @param t - i18next translation function (optional — omit in getStaticProps where text fields aren't needed)
 */
export const getCamps = (language?: string, t?: TranslationFn): CampEvent[] => {
  const lang = getLanguageCode(language);
  return campsStructural.map((camp) => {
    const localized = localizedData[lang]?.[camp.id] || localizedData['en']?.[camp.id] || {};
    return {
      ...camp,
      title: t ? t(`camp_data.${camp.id}.title`) : '',
      description: t ? t(`camp_data.${camp.id}.description`) : '',
      shortDescription: t ? t(`camp_data.${camp.id}.short_description`) : undefined,
      location: t ? t(`camp_data.${camp.id}.location`) : '',
      slogan: t ? t(`camp_data.${camp.id}.slogan`) : undefined,
      ...localized,
    };
  });
};

/** Convenience: structural data only (for getStaticProps where only IDs/dates matter) */
export const camps = getCamps();

// Exposed for build scripts: 2026 한국어 참가자 이름 ↔ musicianId 매핑
export function getCamp2026ParticipantsKo(): Array<{ name: string; musicianId?: number }> {
  const entries = localizedData.ko?.['camp-2026']?.participants ?? [];
  return entries.map((p) => {
    if (typeof p === 'string') return { name: p };
    return { name: p.name, musicianId: p.musicianId };
  });
}
