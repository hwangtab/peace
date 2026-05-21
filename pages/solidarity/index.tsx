import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import { Musician } from '@/types/musician';
import { loadLocalizedData } from '@/utils/dataLoader';
import Page from '@/pages/SolidarityPage';

export default function WrappedPage(props: { initialMusicians: Musician[]; initialLocale: string }) {
  return <Page {...props} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const lang = locale ?? 'ko';

  const lineupIds = new Set([7, 12, 14, 15, 34]);
  const allMusicians = loadLocalizedData<Musician>(lang, 'musicians.json');
  const initialMusicians = allMusicians.filter((m) => lineupIds.has(m.id));

  return {
    props: {
      ...(await serverSideTranslations(lang, ['translation'], nextI18NextConfig)),
      initialMusicians,
      initialLocale: lang,
    },
    revalidate: 3600,
  };
}
