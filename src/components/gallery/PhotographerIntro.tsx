import React from 'react';
import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Photographer, photographerNameKey } from '@/data/photographers';

interface PhotographerIntroProps {
  photographers: Photographer[];
}

/**
 * 갤러리에서 특정 캠프 필터를 선택했을 때 그리드 위에 노출하는 사진 작가 소개 카드.
 * 제3회(2026) 캠프부터 적용. 작가가 없으면 렌더하지 않는다.
 */
const PhotographerIntro: React.FC<PhotographerIntroProps> = ({ photographers }) => {
  const { t } = useTranslation();

  if (!photographers.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      aria-label={t('gallery.photographers_heading')}
      className="mb-10 rounded-2xl border border-seafoam/40 bg-white/70 p-6 sm:p-8 shadow-sm"
    >
      <p className="text-xs uppercase tracking-[0.18em] text-jeju-ocean font-bold mb-5">
        {t('gallery.photographers_heading')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {photographers.map(({ slug, image }) => (
          <figure key={slug} className="flex flex-col">
            <figcaption className="flex items-center gap-3 mb-3">
              {image ? (
                <span className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden bg-ocean-sand ring-2 ring-seafoam/50">
                  <Image
                    src={image}
                    alt={t(photographerNameKey(slug))}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </span>
              ) : (
                <span aria-hidden="true" className="text-golden-sun text-lg leading-none">
                  ◎
                </span>
              )}
              <span className="typo-h4 text-deep-ocean">{t(photographerNameKey(slug))}</span>
            </figcaption>
            <blockquote className="typo-body text-coastal-gray whitespace-pre-line break-words">
              {t(`gallery.photographers.${slug}.bio`)}
            </blockquote>
            <Link
              href={`/photographers/${slug}`}
              className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-deep-ocean hover:text-jeju-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-sm"
            >
              {t('gallery.photographer_view_page')} →
            </Link>
          </figure>
        ))}
      </div>
    </motion.section>
  );
};

export default PhotographerIntro;
