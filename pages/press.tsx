import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '@/pages/PressPage';
import { PressItem } from '@/types/press';
import { loadLocalizedData } from '@/utils/dataLoader';

interface PressWrappedPageProps {
  initialPressItems: PressItem[];
  initialLocale: string;
}

export default function WrappedPage({ initialPressItems, initialLocale }: PressWrappedPageProps) {
  return <Page initialPressItems={initialPressItems} initialLocale={initialLocale} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      initialPressItems: loadLocalizedData<PressItem>(resolvedLocale, 'press.json'),
      initialLocale: resolvedLocale,
    },
    revalidate: 3600,
  };
}
