import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '@/pages/PressPage';
import { PressItem } from '@/types/press';
import { loadPublishedPress, loadSiteContentMap } from '@/lib/archivePublicData';
import { normalizePressItems } from '@/api/press';
import type { SiteContentMap } from '@/types/cms';

interface PressWrappedPageProps {
  initialPressItems: PressItem[];
  initialLocale: string;
  siteContent: SiteContentMap;
}

export default function WrappedPage({
  initialPressItems,
  initialLocale,
  siteContent,
}: PressWrappedPageProps) {
  return (
    <Page
      initialPressItems={initialPressItems}
      initialLocale={initialLocale}
      siteContent={siteContent}
    />
  );
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
      siteContent: await loadSiteContentMap(resolvedLocale, '/press'),
    },
    revalidate: 3600,
  };
}
