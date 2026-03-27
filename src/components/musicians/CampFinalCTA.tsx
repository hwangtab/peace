import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import WaveDivider from '../common/WaveDivider';
import Button from '../common/Button';

interface CampFinalCTAProps {
  musicianId: number;
  fundingUrl: string;
  hasOtherMusicians: boolean;
  hasRelatedVideos: boolean;
  backHref: string;
  backLabel: string;
}

export default function CampFinalCTA({
  musicianId,
  fundingUrl,
  hasOtherMusicians,
  hasRelatedVideos,
  backHref,
  backLabel,
}: CampFinalCTAProps) {
  const { t } = useTranslation();

  return (
    <>
      {!hasOtherMusicians && (
        <div className="bg-white pb-24 md:pb-32">
          <div className="container mx-auto px-4 max-w-3xl">
            <Button to={backHref} variant="back" size="sm" shape="rounded">
              &larr; {backLabel}
            </Button>
          </div>
        </div>
      )}
      <WaveDivider className="text-jeju-ocean -mt-[60px] sm:-mt-[100px] relative z-10" />
      <section
        className="bg-jeju-ocean py-20 md:py-28 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images-webp/camps/2023/20230610%EB%B0%A4%20%EC%A0%84%EC%9F%81%EC%9D%84%EB%81%9D%EB%82%B4%EC%9E%90.webp)', backgroundBlendMode: 'overlay' }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="typo-h2 text-white mb-4 break-words">{t('camp.cta_final_heading')}</h2>
            <p className="typo-body text-gray-200 mb-8 max-w-lg mx-auto break-words">{t('camp.cta_final_body')}</p>
            <Button href={fundingUrl} variant="gold" external utmContent={`musician-final-cta-${musicianId}`}>
              {t('camp.cta_final_button')}
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
