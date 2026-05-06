import { useEffect, useState } from 'react';

interface UseLocalizedResourceOptions<T> {
  initialData: T[];
  initialLocale: string;
  currentLocale: string;
  fetchResource: (locale: string) => Promise<T[]>;
  enabled?: boolean;
  /**
   * true 시 초기 로케일이 일치하더라도 클라이언트 마운트 후 풀 데이터를 다시 가져온다.
   * SSG 단계에서 pageProps 절감을 위해 일부 필드를 제거한 부분 데이터만 보낸 경우,
   * 모달 등 필드를 요구하는 UI 가 마운트 후 정상 동작하도록 보강하는 용도.
   */
  alwaysRefetch?: boolean;
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
  alwaysRefetch = false,
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

    if (currentLocale === initialLocale && !alwaysRefetch) {
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
  }, [currentLocale, enabled, fetchResource, initialData, initialLocale, alwaysRefetch]);

  return { data, isLoading, error };
};
