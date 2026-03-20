import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import WaveDivider from '../common/WaveDivider';

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
        <div className="bg-white pb-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <Link
              href={backHref}
              className="inline-flex items-center px-5 py-2.5 bg-ocean-sand text-jeju-ocean rounded-lg hover:bg-ocean-mist transition-colors text-sm font-medium"
            >
              &larr; {backLabel}
            </Link>
          </div>
        </div>
      )}
      <WaveDivider className={`${!hasOtherMusicians && hasRelatedVideos ? 'text-ocean-sand' : 'text-white'} -mt-[60px] sm:-mt-[100px] relative z-10`} />
      <section className="bg-jeju-ocean py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="typo-h2 text-white mb-4">{t('camp.cta_final_heading')}</h2>
            <p className="typo-body text-gray-200 mb-8 max-w-lg mx-auto">{t('camp.cta_final_body')}</p>
            <a
              href={`${fundingUrl}?utm_source=website&utm_medium=cta&utm_campaign=gpmc3&utm_content=musician-final-cta-${musicianId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3.5 bg-golden-sun text-gray-900 font-bold rounded-full text-base shadow-lg hover:bg-yellow-400 transition-colors"
            >
              {t('camp.cta_final_button')}
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
