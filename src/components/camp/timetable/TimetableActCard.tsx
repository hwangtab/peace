import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Musician } from '@/types/musician';
import { TimetableAct } from './types';
import ScaleBadge from './ScaleBadge';

interface TimetableActCardProps {
  act: TimetableAct;
  musicianById: Map<number, Musician>;
  campYear: number;
  index?: number;
}

function getInitials(name: string): string {
  // For short names (<=2 chars), show only first char to avoid duplicating full name
  if (name.length <= 2) return name.slice(0, 1);
  return name.slice(0, 2);
}

function resolveMusicians(ids: number[] | undefined, lookup: Map<number, Musician>): Musician[] {
  if (!ids) return [];
  return ids.map((id) => lookup.get(id)).filter((m): m is Musician => m !== undefined);
}

const TimetableActCard: React.FC<TimetableActCardProps> = ({ act, musicianById, campYear, index = 0 }) => {
  const musicians = resolveMusicians(act.musicianIds, musicianById);
  const primary = musicians[0];
  const isLinkable = musicians.length === 1 && primary !== undefined;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative flex-shrink-0">
        {musicians.length > 0 ? (
          <div className="flex">
            {musicians.map((m, i) => (
              <div
                key={m.id}
                className={`h-16 w-16 overflow-hidden rounded-full border-2 border-white sm:h-20 sm:w-20 ${i > 0 ? '-ml-4' : ''}`}
                style={{ zIndex: musicians.length - i }}
              >
                <Image
                  src={m.imageUrl}
                  alt={m.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-jeju-ocean text-lg font-bold text-white sm:h-20 sm:w-20"
            aria-hidden="true"
          >
            {getInitials(act.name)}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-lg font-bold text-deep-ocean">{act.name}</p>
        <p className="text-sm text-coastal-gray">
          <time dateTime={act.start}>{act.start}</time>
          {' – '}
          <time dateTime={act.end}>{act.end}</time>
        </p>
        {act.scale && (
          <div>
            <ScaleBadge scale={act.scale} />
          </div>
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
