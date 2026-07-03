import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '@/pages/PressPage';
import { PressItem } from '@/types/press';
import { loadPublishedPress } from '@/lib/archivePublicData';
import { normalizePressItems } from '@/api/press';

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
      ...(await serverSideTranslations(
        resolvedLocale,
        ['translation', 'press'],
        nextI18NextConfig
      )),
      initialPressItems: normalizePressItems((await loadPublishedPress(resolvedLocale)).items),
      initialLocale: resolvedLocale,
    },
    // 언론보도도 거의 안 바뀌므로 1h→24h (archive_press_items 재조회 빈도 축소).
    revalidate: 86400,
  };
}
