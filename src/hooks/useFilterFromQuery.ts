import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { FilterId, isValidFilter } from '@/utils/filtering';

export function useFilterFromQuery(): [FilterId, (filter: FilterId) => void] {
  const router = useRouter();

  const queryKey = `${router.isReady}:${String(router.query.filter ?? '')}`;

  const queryFilter = useMemo<FilterId>(() => {
    if (!router.isReady) return 'all';
    const raw = router.query.filter;
    return typeof raw === 'string' && isValidFilter(raw) ? raw : 'all';
  }, [router.isReady, router.query.filter]);

  const [override, setOverride] = useState<{ filter: FilterId; key: string } | null>(null);

  const selectedFilter: FilterId =
    override && override.key === queryKey ? override.filter : queryFilter;

  const setSelectedFilter = useCallback(
    (filter: FilterId) => {
      setOverride({ filter, key: queryKey });
    },
    [queryKey]
  );

  return [selectedFilter, setSelectedFilter];
}
