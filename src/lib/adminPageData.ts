import type { GetServerSidePropsContext } from 'next';
import { getAdminSession, redirectToAdminLogin } from './adminAuth';
import { getAdminCollectionConfig, type AdminCollection } from './adminArchive';
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

  const supabase = createSupabaseServerClient(context.req, context.res);
  const { data, error } = await supabase
    .from(config.table)
    .select('*')
    .eq('locale', selectedLocale)
    .order('updated_at', { ascending: false });

  if (error) {
    return {
      props: {
        config,
        initialItems: [],
        member: session.member,
        selectedLocale,
        initialError: error.message,
      },
    };
  }

  return {
    props: {
      config,
      initialItems: data ?? [],
      member: session.member,
      selectedLocale,
    },
  };
};
