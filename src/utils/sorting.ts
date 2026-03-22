interface DateItem {
  date: string;
}

/**
 * 날짜 내림차순 정렬 (최신순)
 * @param items 정렬할 아이템 배열
 * @returns 날짜 내림차순으로 정렬된 새 배열
 */
export const sortByDateDesc = <T extends DateItem>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    if (isNaN(ta) && isNaN(tb)) return 0;
    if (isNaN(ta)) return 1;
    if (isNaN(tb)) return -1;
    return tb - ta;
  });
};

/**
 * 날짜 오름차순 정렬 (오래된 순)
 * @param items 정렬할 아이템 배열
 * @returns 날짜 오름차순으로 정렬된 새 배열
 */
export const sortByDateAsc = <T extends DateItem>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    if (isNaN(ta) && isNaN(tb)) return 0;
    if (isNaN(ta)) return 1;
    if (isNaN(tb)) return -1;
    return ta - tb;
  });
};
