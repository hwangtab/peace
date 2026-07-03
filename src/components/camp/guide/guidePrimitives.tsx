import React from 'react';
import type { AssignTable } from '@/data/camp2026Guide';

/* ------------------------------------------------------------------ *
 * 캠프 비공개 안내(뮤지션·스태프) 공용 프리젠테이션 프리미티브.
 * 두 안내 페이지가 동일한 섹션 헤딩·불릿·배정표 스타일을 공유한다.
 * ------------------------------------------------------------------ */

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const phoneHref = (phone: string) => `tel:${phone.replace(/-/g, '')}`;

export const SectionHeading: React.FC<{ id: string; index: number; title: string }> = ({
  id,
  index,
  title,
}) => (
  <h2 id={id} className="scroll-mt-28 typo-h3 mb-4 flex items-baseline gap-2">
    <span className="text-jeju-ocean tabular-nums">{index}.</span>
    <span>{title}</span>
  </h2>
);

export const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item) => (
      <li
        key={item.slice(0, 60)}
        className="flex gap-2 typo-body text-coastal-gray leading-relaxed"
      >
        <span
          className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-jeju-ocean"
          aria-hidden="true"
        />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export const AssignmentTable: React.FC<{ table: AssignTable }> = ({ table }) => (
  <div className="mb-6">
    <h4 className="text-base font-semibold text-jeju-ocean mb-2">{table.title}</h4>
    <div className="overflow-x-auto rounded-xl border border-seafoam/40">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="bg-sky-horizon/60">
            {table.headers.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={`px-3 py-2 text-start font-semibold text-deep-ocean whitespace-nowrap ${
                  i === 0 ? 'sticky start-0 bg-sky-horizon/60 z-10' : ''
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row[0]} className="border-t border-seafoam/30 even:bg-ocean-sand/30">
              {row.map((cell, i) => (
                <td
                  key={i}
                  className={`px-3 py-2 align-top text-coastal-gray ${
                    i === 0
                      ? 'sticky start-0 bg-white even:bg-ocean-sand/30 font-medium text-deep-ocean whitespace-nowrap z-10'
                      : ''
                  }`}
                >
                  {cell || <span className="text-coastal-gray/40">–</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
