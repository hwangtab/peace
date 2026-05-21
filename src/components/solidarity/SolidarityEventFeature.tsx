import React from 'react';
import Image from 'next/image';
import { m as motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUserGroup } from '@/components/icons/SiteIcons';
import { SolidarityEvent } from '@/data/solidarity';

interface Props {
  event: SolidarityEvent;
  index: number;
}

const SolidarityEventFeature: React.FC<Props> = ({ event, index }) => {
  const { t } = useTranslation('translation');

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
      className="bg-white rounded-3xl overflow-hidden shadow-lg border border-ocean-sand"
    >
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

        {/* Details */}
        <div className="p-8 lg:p-10 flex flex-col gap-6">
          <h2 className="typo-h3 text-xl lg:text-2xl leading-snug break-words">
            {event.title}
          </h2>

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
                <p className="text-sm text-coastal-gray mt-0.5 break-words">{event.venueAddress}</p>
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
                  {event.lineup.map((artist) => (
                    <span
                      key={artist}
                      className="px-3 py-1.5 bg-ocean-mist/5 text-ocean-mist/80 rounded-lg text-xs font-medium border border-ocean-mist/10 break-words"
                    >
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 border-t border-ocean-sand pt-5">
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
          <div className="mt-auto pt-2">
            <a
              href={event.contact.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-jeju-ocean text-white rounded-full text-sm font-medium hover:bg-jeju-ocean/90 transition-colors duration-200"
            >
              {t('solidarity.contact_cta')} — {event.contact.name}
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default SolidarityEventFeature;
