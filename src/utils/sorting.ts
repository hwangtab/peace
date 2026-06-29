interface DateItem {
  date: string;
}

/** 날짜 비교 헬퍼 — NaN(파싱 실패)은 항상 뒤로 보낸다. dir=1 내림차순, dir=-1 오름차순. */
const compareByDate = (a: DateItem, b: DateItem, dir: 1 | -1): number => {
  const ta = new Date(a.date).getTime();
  const tb = new Date(b.date).getTime();
  if (isNaN(ta) && isNaN(tb)) return 0;
  if (isNaN(ta)) return 1;
  if (isNaN(tb)) return -1;
  return dir * (tb - ta);
};

/**
 * 날짜 내림차순 정렬 (최신순)
 * @param items 정렬할 아이템 배열
 * @returns 날짜 내림차순으로 정렬된 새 배열
 */
export const sortByDateDesc = <T extends DateItem>(items: T[]): T[] =>
  [...items].sort((a, b) => compareByDate(a, b, 1));

/**
 * 날짜 오름차순 정렬 (오래된 순)
 * @param items 정렬할 아이템 배열
 * @returns 날짜 오름차순으로 정렬된 새 배열
 */
export const sortByDateAsc = <T extends DateItem>(items: T[]): T[] =>
  [...items].sort((a, b) => compareByDate(a, b, -1));
