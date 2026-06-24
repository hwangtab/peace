import type { GetServerSidePropsContext } from 'next';
import { getAdminSession, redirectToAdminLogin } from './adminAuth';
import {
  ADMIN_COLLECTION_PAGE_SIZE,
  getAdminCollectionConfig,
  getAdminPaginationRange,
  buildArchiveFilters,
  buildArchiveFacetOptions,
  type ArchiveFilterOption,
  type AdminCollection,
} from './adminArchive';
import { createSupabaseServerClient } from './supabaseServer';
import { isSupportedLocale } from '@/constants/locales';

export const loadAdminCollectionPageProps = async (
  context: GetServerSidePropsContext,
  collection: AdminCollection
) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);

  const config = getAdminCollectionConfig(collection);
  if (!config) return { notFound: true };
  const selectedLocale =
    typeof context.query.locale === 'string' && isSupportedLocale(context.query.locale)
      ? context.query.locale
      : 'ko';

  const readParam = (key: string) =>
    typeof context.query[key] === 'string' ? (context.query[key] as string) : '';
  const selectedType = config.yearTypeFilter ? readParam('type') : '';
  const selectedYear = config.yearTypeFilter ? readParam('year') : '';
  const filters = config.yearTypeFilter
    ? buildArchiveFilters({ type: selectedType, year: selectedYear })
    : {};

  const supabase = createSupabaseServerClient(context.req, context.res);

  let typeOptions: ArchiveFilterOption[] = [];
  let yearOptions: ArchiveFilterOption[] = [];
  if (config.yearTypeFilter) {
    const { data: facetRows } = await supabase.from(config.table).select('event_type, event_year');
    const opts = buildArchiveFacetOptions(
      (facetRows as { event_type: string | null; event_year: number | null }[] | null) ?? []
    );
    typeOptions = opts.typeOptions;
    yearOptions = opts.yearOptions;
  }

  const range = getAdminPaginationRange({ offset: 0, limit: ADMIN_COLLECTION_PAGE_SIZE });
  let query = supabase
    .from(config.table)
    .select('*', { count: 'exact' })
    .eq('locale', selectedLocale);
  for (const [field, value] of Object.entries(filters)) {
    query = query.eq(field, value);
  }
  const { data, error, count } = await query
    .order('updated_at', { ascending: false })
    .range(range.from, range.to);

  const baseProps = {
    config,
    member: session.member,
    selectedLocale,
    selectedType,
    selectedYear,
    typeOptions,
    yearOptions,
  };

  if (error) {
    return {
      props: {
        ...baseProps,
        initialItems: [],
        initialTotalCount: 0,
        initialNextOffset: 0,
        initialHasMore: false,
        initialError: error.message,
      },
    };
  }

  return {
    props: {
      ...baseProps,
      initialItems: data ?? [],
      initialTotalCount: count ?? data?.length ?? 0,
      initialNextOffset: data?.length ?? 0,
      initialHasMore: (data?.length ?? 0) < (count ?? 0),
    },
  };
};
