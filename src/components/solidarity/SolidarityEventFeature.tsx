import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Button from '../common/Button';
import { m as motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import {
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
} from '@/components/icons/SiteIcons';
import { SolidarityEvent } from '@/data/solidarity';
import { Musician } from '@/types/musician';

const MusicianModal = dynamic(() => import('../musicians/MusicianModal'), { ssr: false });

interface Props {
  event: SolidarityEvent;
  index: number;
  musicians: Musician[];
  detailHref?: string;
  compact?: boolean;
}

const SolidarityEventFeature: React.FC<Props> = ({
  event,
  index,
  musicians,
  detailHref,
  compact = false,
}) => {
  const { t } = useTranslation('translation');
  const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLineupClick = useCallback(
    (musicianId: number | null) => {
      if (!musicianId) return;
      const musician = musicians.find((m) => m.id === musicianId);
      if (musician) {
        setSelectedMusician(musician);
        setIsModalOpen(true);
      }
    },
    [musicians]
  );

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-ocean-sand"
      >
        {/* 상단: 포스터 + 주요 정보 2단 */}
        <div className="lg:grid lg:grid-cols-2">
          {/* Poster */}
          <div className="relative aspect-[4/5]">
            <Image
              src={event.poster}
              alt={event.posterAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              quality={75}
            />
          </div>

          {/* Key info */}
          <div className="p-6 flex flex-col justify-center gap-6">
            <h2 className="typo-h3 text-xl lg:text-2xl leading-snug break-words">{event.title}</h2>

            <div className="space-y-4">
              {/* Date */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-ocean-sand flex items-center justify-center text-jeju-ocean shrink-0">
                  <HiOutlineCalendar aria-hidden="true" className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-coastal-gray font-bold block">
                    {t('solidarity.label_date')}
                  </span>
                  <span className="font-medium">{event.date}</span>
                </div>
              </div>

              {/* Venue */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-ocean-sand flex items-center justify-center text-jeju-ocean shrink-0">
                  <HiOutlineLocationMarker aria-hidden="true" className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-coastal-gray font-bold block">
                    {t('solidarity.label_venue')}
                  </span>
                  <span className="font-medium">{event.venue}</span>
                  <p className="text-sm text-coastal-gray mt-0.5 break-words">
                    {event.venueAddress}
                  </p>
                </div>
              </div>

              {/* Lineup */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-ocean-sand flex items-center justify-center text-jeju-ocean shrink-0">
                  <HiOutlineUserGroup aria-hidden="true" className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-coastal-gray font-bold block mb-2">
                    {t('solidarity.label_lineup')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {event.lineup.map((entry) =>
                      entry.musicianId ? (
                        <button
                          key={entry.name}
                          type="button"
                          onClick={() => handleLineupClick(entry.musicianId)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleLineupClick(entry.musicianId);
                            }
                          }}
                          aria-label={entry.name}
                          className="px-3 py-1 bg-ocean-mist/5 text-ocean-mist/80 rounded-lg text-xs font-medium border border-ocean-mist/10 break-words hover:bg-jeju-ocean hover:text-white hover:border-jeju-ocean transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
                        >
                          {entry.name}
                        </button>
                      ) : (
                        <span
                          key={entry.name}
                          className="px-3 py-1 bg-ocean-mist/5 text-ocean-mist/80 rounded-lg text-xs font-medium border border-ocean-mist/10 break-words"
                        >
                          {entry.name}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* compact 모드: 자세히 보기 링크 */}
            {compact && detailHref && (
              <Button to={detailHref} variant="primary" className="self-start">
                {t('solidarity.detail_cta')} →
              </Button>
            )}
          </div>
        </div>

        {/* 하단: 본문 설명 + 노트 + 주최 + 문의 버튼 (전체폭) — 상세 뷰에서만 표시 */}
        {!compact && (
          <div className="px-8 lg:px-10 pb-8 lg:pb-10 pt-6 lg:pt-8 border-t border-ocean-sand flex flex-col gap-6">
            {/* Description */}
            <div className="space-y-3">
              {event.paragraphs.map((para, i) => (
                <p key={i} className="typo-body text-sm leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* Program note */}
            {event.note && (
              <p className="text-xs text-coastal-gray italic border-l-2 border-ocean-sand pl-3 leading-relaxed">
                {event.note}
              </p>
            )}

            {/* Organizers */}
            <div className="text-sm text-coastal-gray">
              <span className="text-[10px] uppercase tracking-wider font-bold block mb-1">
                {t('solidarity.label_organizers')}
              </span>
              <span className="break-words">{event.organizers}</span>
            </div>

            {/* Contact */}
            <div>
              <Button href={event.contact.url} variant="primary" external>
                {t('solidarity.contact_cta')} — {event.contact.name}
              </Button>
            </div>
          </div>
        )}
      </motion.article>

      {selectedMusician && (
        <MusicianModal
          musician={selectedMusician}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMusician(null);
          }}
        />
      )}
    </>
  );
};

export default SolidarityEventFeature;
