import React from 'react';
import { Musician } from '@/types/musician';
import { TimetableDay } from './types';
import TimetableActCard from './TimetableActCard';
import TimetableTransition from './TimetableTransition';

interface TimetableDayViewProps {
  day: TimetableDay;
  musicianById: Map<number, Musician>;
  campYear: number;
  railClassName?: string;
}

const TimetableDayView: React.FC<TimetableDayViewProps> = ({
  day,
  musicianById,
  campYear,
  railClassName = 'bg-ocean-gradient',
}) => {
  let perfIndex = 0;
  return (
    <div className="relative flex flex-col gap-3 pl-0 sm:pl-16 lg:pl-20">
      <div
        className={`pointer-events-none absolute left-6 top-0 hidden h-full w-1 rounded-full opacity-60 sm:block lg:left-8 ${railClassName}`}
        aria-hidden="true"
      />
      {day.acts.map((act, i) => {
        if (act.type === 'transition') {
          return (
            <TimetableTransition
              key={`t-${i}`}
              minutes={act.transitionMinutes ?? 5}
            />
          );
        }
        const idx = perfIndex++;
        return (
          <TimetableActCard
            key={`p-${i}`}
            act={act}
            musicianById={musicianById}
            campYear={campYear}
            index={idx}
          />
        );
      })}
    </div>
  );
};

export default TimetableDayView;
