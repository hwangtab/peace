import { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { getCamps } from '@/data/camps';
import { CampEvent } from '@/types/camp';

/**
 * Memoized access to the localized camps list.
 *
 * `getCamps(lang, t)` rebuilds all camp entries (title/description/location
 * via i18n lookups + localized participants/staff) on every call. Calling it
 * directly inside a component causes a fresh array and fresh `t()` lookups
 * on every render — which is especially costly because `<Footer />` is
 * rendered on every page.
 *
 * Use this hook instead. It recomputes only when the active language changes.
 */
export function useCamps(): CampEvent[] {
  const { t, i18n } = useTranslation();
  return useMemo(() => getCamps(i18n.language, t), [i18n.language, t]);
}

/**
 * Convenience wrapper: look up a single camp by id with the same memoization
 * semantics as `useCamps()`.
 */
export function useCamp(id: string): CampEvent | undefined {
  const camps = useCamps();
  return useMemo(() => camps.find((c) => c.id === id), [camps, id]);
}
