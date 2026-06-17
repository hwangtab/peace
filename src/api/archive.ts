interface ArchiveApiResponse<T> {
  source: 'cms' | 'static';
  items: T[];
}

export const fetchArchiveItems = async <T>(
  collection: 'videos' | 'gallery' | 'press',
  locale?: string
): Promise<T[] | null> => {
  const params = new URLSearchParams();
  if (locale) params.set('locale', locale);

  const response = await fetch(`/api/archive/${collection}?${params.toString()}`);
  if (!response.ok) return null;

  const payload = (await response.json()) as ArchiveApiResponse<T>;
  return Array.isArray(payload.items) ? payload.items : null;
};
