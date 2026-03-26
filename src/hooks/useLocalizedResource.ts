import { useEffect, useState } from 'react';

interface UseLocalizedResourceOptions<T> {
  initialData: T[];
  initialLocale: string;
  currentLocale: string;
  fetchResource: (locale: string) => Promise<T[]>;
  enabled?: boolean;
}

interface UseLocalizedResourceResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
}

export const useLocalizedResource = <T>({
  initialData,
  initialLocale,
  currentLocale,
  fetchResource,
  enabled = true,
}: UseLocalizedResourceOptions<T>): UseLocalizedResourceResult<T> => {
  const [data, setData] = useState<T[]>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled && initialData.length === 0);

  useEffect(() => {
    if (!enabled) {
      setData(initialData);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (currentLocale === initialLocale) {
      setData(initialData);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const nextData = await fetchResource(currentLocale);
        if (!isCancelled) {
          setData(nextData);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, [currentLocale, enabled, fetchResource, initialData, initialLocale]);

  return { data, isLoading, error };
};
