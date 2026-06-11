import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config';
import { camps } from '@/data/camps';
import { Musician } from '@/types/musician';
import { loadLocalizedData } from '@/utils/dataLoader';
import CampStaff2026Page from '@/pages/CampStaff2026Page';

export default CampStaff2026Page;

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const lang = locale ?? 'ko';

  // 타임테이블 렌더에 필요한 뮤지션만 추려 payload 절감 (guide.tsx 와 동일 패턴).
  const camp = camps.find((c) => c.year === 2026);
  const allMusicians = loadLocalizedData<Musician>(lang, 'musicians.json');
  const referencedIds = new Set<number>(
    (camp?.participants ?? [])
      .map((p) =>
        typeof p === 'object' && p !== null && 'musicianId' in p ? p.musicianId : undefined
      )
      .filter((id): id is number => typeof id === 'number')
  );
  const initialMusicians = allMusicians
    .filter((m) => referencedIds.has(m.id))
    .map((m) => ({ ...m, description: '' }));

  return {
    props: {
      ...(await serverSideTranslations(
        lang,
        ['translation', 'camp_staff_2026'],
        nextI18NextConfig
      )),
      initialMusicians,
      initialLocale: lang,
    },
    revalidate: 3600,
  };
}
