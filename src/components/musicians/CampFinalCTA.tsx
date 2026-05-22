import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import Image from 'next/image';
import Button from '../common/Button';
import Container from '../layout/Container';
import Section from '../layout/Section';

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
  backHref,
  backLabel,
}: CampFinalCTAProps) {
  const { t } = useTranslation();

  return (
    <>
      {!hasOtherMusicians && (
        <div className="bg-white pb-24 md:pb-32">
          <Container size="prose">
            <Button to={backHref} variant="back" size="sm" shape="rounded">
              &larr; {backLabel}
            </Button>
          </Container>
        </div>
      )}
      <Section background="deep-ocean" paddingTop="loose" paddingBottom="loose" className="relative overflow-hidden">
        <Image
          src="/images-webp/camps/2023/20230610밤 전쟁을끝내자.webp"
          alt={t('camp.cta_final_image_alt')}
          fill
          sizes="100vw"
          quality={60}
          loading="lazy"
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/70" aria-hidden="true" />
        <Container size="content" className="text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="typo-h2 text-white mb-4 break-words">{t('camp.cta_final_heading')}</h2>
            <p className="typo-body text-cloud-white/80 mb-8 max-w-lg mx-auto break-words">{t('camp.cta_final_body')}</p>
            <Button href={fundingUrl} variant="gold" external utmContent={`musician-final-cta-${musicianId}`}>
              {t('camp.cta_final_button')}
            </Button>
          </motion.div>
        </Container>
      </Section>
    </>
  );
}
