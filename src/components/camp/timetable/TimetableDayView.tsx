import React from 'react';
import { Musician } from '@/types/musician';
import { TimetableDay } from './types';
import TimetableActCard from './TimetableActCard';

interface TimetableDayViewProps {
  day: TimetableDay;
  musicianById: Map<number, Musician>;
  campYear: number;
  railClassName?: string;
  accentTimeClass?: string;
  accentRuleClass?: string;
}

const TimetableDayView: React.FC<TimetableDayViewProps> = ({
  day,
  musicianById,
  campYear,
  railClassName = 'bg-ocean-gradient',
  accentTimeClass = 'text-jeju-ocean',
  accentRuleClass = 'bg-coastal-gray/30',
}) => {
  // 'transition' 항목(다음 공연까지 대기 시간)은 관객에게 필요 없는 무대 운영 정보라
  // 화면에서 제외. 데이터(timetable-2026.ts)에는 보존되어 PNG 추출 등 내부 도구가 활용.
  const performances = day.acts.filter((act) => act.type === 'performance');
  return (
    <div className="relative flex flex-col gap-3 pl-0 sm:pl-16 lg:pl-20">
      <div
        className={`pointer-events-none absolute left-6 top-0 hidden h-full w-1 rounded-full opacity-60 sm:block lg:left-8 ${railClassName}`}
        aria-hidden="true"
      />
      {performances.map((act, idx) => (
        <TimetableActCard
          key={act.order ?? act.name}
          act={act}
          musicianById={musicianById}
          campYear={campYear}
          date={day.date}
          index={idx}
          accentTimeClass={accentTimeClass}
          accentRuleClass={accentRuleClass}
        />
      ))}
    </div>
  );
};

export default TimetableDayView;
