import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import Image from 'next/image';
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
      <WaveDivider className={`${!hasOtherMusicians && hasRelatedVideos ? 'text-ocean-sand' : 'text-white'} -mt-[60px] sm:-mt-[100px] relative z-10`} />
      <section className="bg-jeju-ocean py-20 md:py-28 relative">
        <Image
          src="/images-webp/camps/2023/20230610밤 전쟁을끝내자.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-20"
          aria-hidden="true"
        />
        <div className="container mx-auto px-4 text-center relative z-10">
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
