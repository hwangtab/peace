import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { Musician } from '@/types/musician';
import { Timetable } from './types';
import { DAY_MOOD } from '@/data/timetableTokens';
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

  const selectTab = useCallback(
    (i: number) => {
      setActiveIndex(i);
      const date = dates[i];
      if (date && typeof window !== 'undefined') {
        window.history.replaceState({}, '', `#${hashForDate(date)}`);
      }
    },
    [dates]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const delta = e.key === 'ArrowRight' ? 1 : -1;
        const next = (i + delta + dates.length) % dates.length;
        selectTab(next);
        const el = document.getElementById(`timetable-tab-${next}`);
        el?.focus();
      }
    },
    [dates.length, selectTab]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent<HTMLButtonElement>, i: number) => {
      e.preventDefault();
      selectTab(i);
    },
    [selectTab]
  );

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
      <div
        role="tablist"
        aria-label={t('timetable.title')}
        className="mb-6 grid grid-cols-3 overflow-hidden rounded-xl border border-seafoam bg-white"
      >
        {data.days.map((day, i) => {
          const isActive = i === activeIndex;
          const mood = DAY_MOOD[day.weekday];
          const weekdayLabel = t(`timetable.weekday.${day.weekday}`);
          const tabLabel = t('timetable.tab_day_label', {
            date: day.dayLabel.split(' ')[0],
            weekday: weekdayLabel,
            count: day.teamCount,
          });
          const tabTime = t('timetable.tab_day_time', { start: day.startTime, end: day.endTime });
          return (
            <button
              key={day.date}
              id={`timetable-tab-${i}`}
              role="tab"
              type="button"
              aria-label={`${tabLabel} ${tabTime}`}
              aria-selected={isActive}
              aria-controls={`timetable-panel-${i}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => selectTab(i)}
              onTouchStart={(e) => onTouchStart(e, i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`relative px-2 py-3 text-center text-xs transition-colors sm:text-sm ${
                isActive ? mood.activeTab : 'bg-white text-deep-ocean hover:bg-ocean-sand'
              }`}
            >
              <span className="block font-bold">{tabLabel}</span>
              <span className="mt-0.5 block text-[10px] sm:text-xs">{tabTime}</span>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-golden-sun"
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        id={`timetable-panel-${activeIndex}`}
        role="tabpanel"
        aria-labelledby={`timetable-tab-${activeIndex}`}
        className={`rounded-xl px-2 py-4 transition-colors duration-200 sm:px-4 ${DAY_MOOD[activeDay.weekday].panelTint}`}
      >
        <TimetableDayView
          day={activeDay}
          musicianById={musicianById}
          campYear={campYear}
          railClassName={DAY_MOOD[activeDay.weekday].rail}
          accentTimeClass={DAY_MOOD[activeDay.weekday].accentTime}
          accentRuleClass={DAY_MOOD[activeDay.weekday].accentRule}
        />
      </div>
    </div>
  );
};

export default CampTimetable;
