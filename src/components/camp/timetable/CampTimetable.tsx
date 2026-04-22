import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { Musician } from '@/types/musician';
import { Timetable } from './types';
import TimetableDayView from './TimetableDayView';

interface CampTimetableProps {
  data: Timetable;
  musicians: Musician[];
  campYear: number;
}

function hashForDate(date: string): string {
  return `timetable-day-${date}`;
}

function readHashIndex(dates: string[]): number {
  if (typeof window === 'undefined') return 0;
  const hash = window.location.hash.replace(/^#/, '');
  const idx = dates.findIndex((d) => hashForDate(d) === hash);
  return idx >= 0 ? idx : 0;
}

const CampTimetable: React.FC<CampTimetableProps> = ({ data, musicians, campYear }) => {
  const { t } = useTranslation();
  const dates = useMemo(() => data.days.map((d) => d.date), [data.days]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const musicianById = useMemo(() => {
    const m = new Map<number, Musician>();
    for (const mus of musicians) m.set(mus.id, mus);
    return m;
  }, [musicians]);

  const selectTab = useCallback((i: number) => {
    setActiveIndex(i);
    const date = dates[i];
    if (date && typeof window !== 'undefined') {
      window.history.replaceState({}, '', `#${hashForDate(date)}`);
    }
  }, [dates]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      const next = (i + delta + dates.length) % dates.length;
      selectTab(next);
      const el = document.getElementById(`timetable-tab-${next}`);
      el?.focus();
    }
  }, [dates.length, selectTab]);

  useEffect(() => {
    const sync = () => setActiveIndex(readHashIndex(dates));
    sync(); // reconcile on mount
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [dates]);

  const activeDay = data.days[activeIndex] ?? data.days[0];
  if (!activeDay) return null;

  return (
    <div>
      <div role="tablist" aria-label={t('timetable.title')} className="mb-6 grid grid-cols-3 overflow-hidden rounded-xl border border-seafoam bg-white">
        {data.days.map((day, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={day.date}
              id={`timetable-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`timetable-panel-${i}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => selectTab(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`relative px-2 py-3 text-center text-xs sm:text-sm transition-colors ${
                isActive
                  ? 'bg-jeju-ocean text-white'
                  : 'bg-white text-coastal-gray hover:bg-ocean-sand'
              }`}
            >
              <span className="block font-bold">
                {t('timetable.tab_day_label', {
                  date: day.dayLabel.split(' ')[0],
                  weekday: t(`timetable.weekday.${day.weekday}`),
                  count: day.teamCount,
                })}
              </span>
              <span className="mt-0.5 block text-[10px] opacity-80 sm:text-xs">
                {t('timetable.tab_day_time', { start: day.startTime, end: day.endTime })}
              </span>
              {isActive && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-golden-sun" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay.date}
          id={`timetable-panel-${activeIndex}`}
          role="tabpanel"
          aria-labelledby={`timetable-tab-${activeIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <TimetableDayView day={activeDay} musicianById={musicianById} campYear={campYear} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CampTimetable;
