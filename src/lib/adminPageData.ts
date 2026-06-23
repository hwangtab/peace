import type { GetServerSidePropsContext } from 'next';
import { getAdminSession, redirectToAdminLogin } from './adminAuth';
import {
  ADMIN_COLLECTION_PAGE_SIZE,
  getAdminCollectionConfig,
  getAdminPaginationRange,
  parseAdminFacetValue,
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

  // 카테고리(연도) facet — 쿼리에 없으면 설정된 기본값 사용(예: 갤러리 = camp 2026).
  const facet = config.facet;
  const selectedFacet = facet
    ? typeof context.query[facet.param] === 'string'
      ? (context.query[facet.param] as string)
      : (facet.default ?? '')
    : '';
  const filters = facet ? parseAdminFacetValue(facet, selectedFacet) : null;

  const supabase = createSupabaseServerClient(context.req, context.res);
  const range = getAdminPaginationRange({ offset: 0, limit: ADMIN_COLLECTION_PAGE_SIZE });
  let query = supabase
    .from(config.table)
    .select('*', { count: 'exact' })
    .eq('locale', selectedLocale);
  if (filters) {
    for (const [field, value] of Object.entries(filters)) {
      query = query.eq(field, value);
    }
  }
  const { data, error, count } = await query
    .order('updated_at', { ascending: false })
    .range(range.from, range.to);

  if (error) {
    return {
      props: {
        config,
        initialItems: [],
        initialTotalCount: 0,
        initialNextOffset: 0,
        initialHasMore: false,
        member: session.member,
        selectedLocale,
        selectedFacet,
        initialError: error.message,
      },
    };
  }

  return {
    props: {
      config,
      initialItems: data ?? [],
      initialTotalCount: count ?? data?.length ?? 0,
      initialNextOffset: data?.length ?? 0,
      initialHasMore: (data?.length ?? 0) < (count ?? 0),
      member: session.member,
      selectedLocale,
      selectedFacet,
    },
  };
};
