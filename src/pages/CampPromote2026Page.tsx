import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/layout/Section';
import Container from '@/components/layout/Container';
import ShareImageCard from '@/components/camp/promote/ShareImageCard';
import PromoTextBlock from '@/components/camp/promote/PromoTextBlock';
import { getFullUrl } from '@/config/env';

interface HowToStep {
  title: string;
  body: string;
}

export interface PromoTexts {
  feed: string;
  story: string;
  hashtags: string;
}

export interface CampPromote2026PageProps {
  /** 항상 한국어 홍보글 — UI 로케일과 무관하게 노출 */
  promoKo: PromoTexts;
  /** 항상 영어 홍보글 — UI 로케일과 무관하게 노출 */
  promoEn: PromoTexts;
}

const POSTER_OG = '/images-webp/camps/2026/2026poster1-og.webp';

const SHARE_IMAGES = [
  {
    src: '/images-webp/camps/2026/2026poster1.webp',
    labelKey: 'image_poster1_label',
    download: 'gangjeong-camp-2026-poster.webp',
  },
  {
    src: '/images-webp/camps/2026/2026poster2.webp',
    labelKey: 'image_poster2_label',
    download: 'gangjeong-camp-2026-poster-alt.webp',
  },
  {
    src: '/images-webp/camps/2026/timetable-2026.webp',
    labelKey: 'image_timetable_label',
    download: 'gangjeong-camp-2026-timetable.webp',
  },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CampPromote2026Page: React.FC<CampPromote2026PageProps> = ({ promoKo, promoEn }) => {
  const { t } = useTranslation(['camp_promote_2026', 'translation']);

  const g = useCallback(
    (key: string, opts?: Record<string, unknown>) => t(`camp_promote_2026.${key}`, opts) as string,
    [t]
  );

  const steps = t('camp_promote_2026.howto_steps', { returnObjects: true }) as HowToStep[];

  const copyLabel = g('copy_button');
  const copiedLabel = g('copied');

  const breadcrumbs = useMemo(
    () => [
      { name: t('translation:nav.home'), url: getFullUrl('/') },
      { name: t('translation:nav.camp_2026'), url: getFullUrl('/camps/2026') },
      { name: g('breadcrumb'), url: getFullUrl('/camps/2026/promote') },
    ],
    [t, g]
  );

  return (
    <PageLayout
      title={g('seo_title')}
      description={g('seo_description')}
      ogImage={getFullUrl(POSTER_OG)}
      ogImageAlt={g('hero_title')}
      breadcrumbs={breadcrumbs}
      noIndex
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      <PageHero title={g('hero_title')} subtitle={g('hero_subtitle')} backgroundImage={POSTER_OG} />

      {/* 인트로 */}
      <Section background="white" paddingTop="loose" paddingBottom="normal">
        <Container size="prose" className="text-center">
          <motion.p
            className="typo-subtitle text-coastal-gray"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            {g('intro_lead')}
          </motion.p>
        </Container>
      </Section>

      {/* ① 이렇게 올려주세요 */}
      <Section
        background="sky-horizon"
        paddingTop="normal"
        paddingBottom="normal"
        ariaLabel={g('howto_title')}
      >
        <Container size="content">
          <h2 className="typo-h3 mb-8 text-center text-deep-ocean">{g('howto_title')}</h2>
          <motion.ol
            className="grid grid-cols-1 gap-5 sm:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {Array.isArray(steps) &&
              steps.map((step, i) => (
                <motion.li
                  key={step.title}
                  variants={itemVariants}
                  className="rounded-xl border border-seafoam/40 bg-white p-5"
                >
                  <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-jeju-ocean text-base font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="typo-body mb-1 font-semibold text-deep-ocean">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-coastal-gray">{step.body}</p>
                </motion.li>
              ))}
          </motion.ol>
        </Container>
      </Section>

      {/* ② 포스터 · 타임테이블 내려받기 */}
      <Section
        background="white"
        paddingTop="normal"
        paddingBottom="normal"
        ariaLabel={g('images_title')}
      >
        <Container size="content">
          <h2 className="typo-h3 mb-2 text-center text-deep-ocean">{g('images_title')}</h2>
          <p className="typo-body mx-auto mb-8 max-w-xl text-center text-sm text-coastal-gray">
            {g('images_note')}
          </p>
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {SHARE_IMAGES.map((img) => {
              const label = g(img.labelKey);
              return (
                <motion.div key={img.src} variants={itemVariants}>
                  <ShareImageCard
                    src={img.src}
                    label={label}
                    downloadName={img.download}
                    downloadLabel={g('download_button')}
                    downloadAria={g('download_aria', { label })}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </Container>
      </Section>

      {/* ③ 복사용 홍보글 (한국어) + ④ (English) */}
      <Section
        background="ocean-sand"
        paddingTop="normal"
        paddingBottom="normal"
        ariaLabel={g('ko_block_title')}
      >
        <Container size="prose">
          <div className="space-y-10">
            {/* 한국어 */}
            <div>
              <h2 className="typo-h3 mb-5 text-deep-ocean">{g('ko_block_title')}</h2>
              <div className="space-y-4">
                <PromoTextBlock
                  label={g('feed_label')}
                  text={promoKo.feed}
                  copyLabel={copyLabel}
                  copiedLabel={copiedLabel}
                />
                <PromoTextBlock
                  label={g('story_label')}
                  text={promoKo.story}
                  copyLabel={copyLabel}
                  copiedLabel={copiedLabel}
                />
                <PromoTextBlock
                  label={g('hashtags_label')}
                  text={promoKo.hashtags}
                  copyLabel={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>

            {/* English */}
            <div>
              <h2 className="typo-h3 mb-5 text-deep-ocean">{g('en_block_title')}</h2>
              <div className="space-y-4">
                <PromoTextBlock
                  label={g('feed_label')}
                  text={promoEn.feed}
                  copyLabel={copyLabel}
                  copiedLabel={copiedLabel}
                />
                <PromoTextBlock
                  label={g('story_label')}
                  text={promoEn.story}
                  copyLabel={copyLabel}
                  copiedLabel={copiedLabel}
                />
                <PromoTextBlock
                  label={g('hashtags_label')}
                  text={promoEn.hashtags}
                  copyLabel={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ⑤ 핵심 정보 */}
      <Section
        background="white"
        paddingTop="normal"
        paddingBottom="normal"
        ariaLabel={g('info_title')}
      >
        <Container size="prose">
          <h2 className="typo-h3 mb-5 text-center text-deep-ocean">{g('info_title')}</h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoRow label={g('info_date_label')} value={g('info_date')} />
            <InfoRow label={g('info_place_label')} value={g('info_place')} />
            <InfoRow label={g('info_program_label')} value={g('info_program')} />
            <InfoRow
              label={g('info_web_label')}
              value={
                <a
                  href="https://peaceandmusic.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-jeju-ocean hover:underline"
                >
                  peaceandmusic.net
                </a>
              }
            />
            <div className="sm:col-span-2">
              <InfoRow
                label={g('info_tag_label')}
                value={
                  <a
                    href="https://www.instagram.com/peace_music_in_gangjeong"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-jeju-ocean hover:underline"
                  >
                    {g('info_tag_note')}
                  </a>
                }
              />
            </div>
          </dl>
        </Container>
      </Section>

      {/* ⑥ 감사 + 캠프로 */}
      <Section background="sky-horizon" paddingTop="normal" paddingBottom="normal">
        <Container size="prose" className="text-center">
          <h2 className="typo-h3 mb-3 text-deep-ocean">{g('thanks_title')}</h2>
          <p className="typo-body mx-auto mb-8 max-w-xl text-coastal-gray">{g('thanks_body')}</p>
          <Link
            href="/camps/2026"
            className="inline-flex items-center gap-2 rounded text-sm font-medium text-jeju-ocean hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            <span aria-hidden="true">←</span>
            {g('back_to_camp')}
          </Link>
        </Container>
      </Section>
    </PageLayout>
  );
};

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="rounded-lg border border-seafoam/30 bg-sky-horizon/40 p-3">
    <dt className="text-xs font-semibold uppercase tracking-wide text-jeju-ocean">{label}</dt>
    <dd className="typo-body mt-0.5 text-sm text-deep-ocean">{value}</dd>
  </div>
);

export default CampPromote2026Page;
