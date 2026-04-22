import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Musician } from '@/types/musician';
import { TimetableAct } from './types';

interface TimetableActCardProps {
  act: TimetableAct;
  musicianById: Map<number, Musician>;
  campYear: number;
  index?: number;
  accentTimeClass?: string;
  accentRuleClass?: string;
}

function getInitials(name: string): string {
  if (name.length <= 2) return name.slice(0, 1);
  return name.slice(0, 2);
}

function resolveMusicians(ids: number[] | undefined, lookup: Map<number, Musician>): Musician[] {
  if (!ids) return [];
  return ids.map((id) => lookup.get(id)).filter((m): m is Musician => m !== undefined);
}

const TimetableActCard: React.FC<TimetableActCardProps> = ({
  act,
  musicianById,
  campYear,
  index = 0,
  accentTimeClass = 'text-jeju-ocean',
  accentRuleClass = 'bg-coastal-gray/30',
}) => {
  const musicians = resolveMusicians(act.musicianIds, musicianById);
  const primary = musicians[0];
  const isLinkable = musicians.length === 1 && primary !== undefined;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      className="group flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg sm:gap-4 sm:p-4"
    >
      <div className="flex w-12 flex-shrink-0 flex-col items-center text-center sm:w-16">
        <time
          dateTime={act.start}
          className={`text-lg font-bold leading-none tabular-nums sm:text-xl ${accentTimeClass}`}
        >
          {act.start}
        </time>
        <span aria-hidden="true" className={`mt-1 block h-px w-4 sm:w-6 ${accentRuleClass}`} />
        <time
          dateTime={act.end}
          className="mt-1 text-[11px] leading-none tabular-nums text-coastal-gray/70 sm:text-xs"
        >
          {act.end}
        </time>
      </div>

      <div className="relative flex-shrink-0">
        {musicians.length > 0 ? (
          <div className="flex">
            {musicians.map((m, i) => (
              <div
                key={m.id}
                className={`h-14 w-14 overflow-hidden rounded-full border-2 border-white sm:h-20 sm:w-20 ${i > 0 ? '-ml-4' : ''}`}
                style={{ zIndex: musicians.length - i }}
              >
                <Image
                  src={m.imageUrl}
                  alt={m.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-jeju-ocean text-base font-bold text-white sm:h-20 sm:w-20 sm:text-lg"
            aria-hidden="true"
          >
            {getInitials(act.name)}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="break-words text-base font-bold leading-tight text-deep-ocean sm:text-lg">
          {act.name}
        </p>
        {primary?.shortDescription && (
          <p className="break-words text-pretty text-sm text-gray-600 transition-colors group-hover:text-gray-800">
            {primary.shortDescription}
          </p>
        )}
      </div>
    </motion.div>
  );

  if (isLinkable) {
    return (
      <Link
        href={`/camps/${campYear}/musicians/${primary.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
        aria-label={`${act.start} ${act.name}`}
      >
        {content}
      </Link>
    );
  }

  return <div aria-label={`${act.start} ${act.name}`}>{content}</div>;
};

export default TimetableActCard;
