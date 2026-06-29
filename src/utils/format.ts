import { getLanguageCode } from './localization';

/**
 * 관리자 화면에서 타임스탬프를 ko-KR 날짜+시간으로 표기한다(예: 2026. 6. 29. 오후 1:50).
 * 게시판 본문의 날짜 전용 표기는 lib/boardForms 의 formatBoardDate 를 쓴다.
 */
export const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  );

export const formatOrdinal = (value: number, language?: string): string => {
  if (!Number.isFinite(value) || value < 0) return String(value);
  const lang = getLanguageCode(language);
  if (lang !== 'en') {
    return String(value);
  }

  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${value}th`;
  }

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
};
