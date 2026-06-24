import type { ArchiveFilterOption } from '@/lib/adminArchive';

interface AdminArchiveFilterBarProps {
  typeOptions: ArchiveFilterOption[];
  yearOptions: ArchiveFilterOption[];
  selectedType: string;
  selectedYear: string;
  onChangeType: (value: string) => void;
  onChangeYear: (value: string) => void;
}

// 아카이브 목록 상단 필터: 유형 탭(pill) + 연도 드롭다운.
export default function AdminArchiveFilterBar({
  typeOptions,
  yearOptions,
  selectedType,
  selectedYear,
  onChangeType,
  onChangeYear,
}: AdminArchiveFilterBarProps) {
  return (
    <div className="space-y-2">
      {typeOptions.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-coastal-gray">유형</span>
          {typeOptions.map((opt) => {
            const active = selectedType === opt.value;
            return (
              <button
                key={opt.value || 'all'}
                type="button"
                onClick={() => onChangeType(opt.value)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean ${
                  active
                    ? 'bg-jeju-ocean font-semibold text-white'
                    : 'bg-white text-deep-ocean ring-1 ring-deep-ocean/15 hover:bg-ocean-sand/40'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
      {yearOptions.length > 1 && (
        <label
          htmlFor="archive-year-filter"
          className="flex items-center gap-2 text-xs font-semibold text-coastal-gray"
        >
          연도
          <select
            id="archive-year-filter"
            value={selectedYear}
            onChange={(e) => onChangeYear(e.target.value)}
            className="rounded border border-deep-ocean/15 bg-white px-3 py-1.5 text-sm font-normal text-deep-ocean focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
          >
            {yearOptions.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
