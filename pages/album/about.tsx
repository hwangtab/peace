import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '../../src/pages/album/AlbumAboutPage';

export default function WrappedPage() {
  return <Page />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ko', ['translation'], nextI18NextConfig)),
    },
  };
}
