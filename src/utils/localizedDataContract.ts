export type LocalizedDataCandidateKey = string | null;

export const buildLocalizedDataCandidateKeys = (locale: string): LocalizedDataCandidateKey[] => {
  if (locale === 'ko') return [null];
  if (locale === 'en') return ['en', null];
  return [locale, 'en', null];
};

export const mergeItemsByKey = <T>(dataSets: T[][], key: string): T[] => {
  const merged: T[] = [];
  const seen = new Set<unknown>();

  for (const dataSet of dataSets) {
    for (const item of dataSet) {
      const id = (item as Record<string, unknown>)[key];
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(item);
      }
    }
  }

  return merged;
};
