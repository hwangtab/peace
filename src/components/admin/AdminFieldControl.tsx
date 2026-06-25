import { composeIsoDuration, parseIsoDuration, type AdminField } from '@/lib/adminArchive';
import type { PhotographerOption } from '@/data/photographers';

export interface MusicianOption {
  id: number;
  name: string;
}

interface AdminFieldControlProps {
  field: AdminField;
  value: string;
  disabled?: boolean;
  musicians: MusicianOption[];
  photographers: PhotographerOption[];
  onChange: (value: string) => void;
}

const inputClass =
  'w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20';
const selectClass =
  'w-full rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20';

const parseCsvIds = (value: string): number[] =>
  value
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

export default function AdminFieldControl({
  field,
  value,
  disabled,
  musicians,
  photographers,
  onChange,
}: AdminFieldControlProps) {
  if (field.kind === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={field.name === 'value' || field.name === 'description' ? 6 : 3}
        placeholder={field.placeholder}
        disabled={disabled}
        className={inputClass}
      />
    );
  }

  if (field.kind === 'select') {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={selectClass}
      >
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.kind === 'duration') {
    const { minutes, seconds } = parseIsoDuration(value);
    const update = (nextMinutes: string, nextSeconds: string) =>
      onChange(composeIsoDuration(nextMinutes, nextSeconds));
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={minutes}
          onChange={(event) => update(event.target.value, seconds)}
          disabled={disabled}
          className={inputClass}
          aria-label="분"
        />
        <span className="text-sm text-coastal-gray">분</span>
        <input
          type="number"
          min={0}
          max={59}
          inputMode="numeric"
          value={seconds}
          onChange={(event) => update(minutes, event.target.value)}
          disabled={disabled}
          className={inputClass}
          aria-label="초"
        />
        <span className="text-sm text-coastal-gray">초</span>
      </div>
    );
  }

  if (field.kind === 'photographer') {
    // 적응형: 등록 작가가 2명 이상일 때만 드롭다운, 아니면 slug 직접 입력.
    if (photographers.length < 2) {
      return (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          className={inputClass}
        />
      );
    }
    // 현재 값이 목록에 없으면(미등록 slug) 데이터 유실을 막기 위해 옵션으로 함께 노출.
    const known = photographers.some((option) => option.slug === value);
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={selectClass}
      >
        <option value="">— 선택 안 함 —</option>
        {photographers.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.name} ({option.slug})
          </option>
        ))}
        {value && !known ? <option value={value}>(미등록) {value}</option> : null}
      </select>
    );
  }

  // 뮤지션 목록을 아직 못 불러왔으면 기존 방식(id 직접 입력)으로 안전하게 폴백한다.
  const musiciansReady = musicians.length > 0;

  if (field.kind === 'musician' && musiciansReady) {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={selectClass}
      >
        <option value="">— 선택 안 함 —</option>
        {musicians.map((musician) => (
          <option key={musician.id} value={String(musician.id)}>
            {musician.name} (#{musician.id})
          </option>
        ))}
      </select>
    );
  }

  if (field.kind === 'musician-multi' && musiciansReady) {
    const selectedIds = parseCsvIds(value);
    const selectedSet = new Set(selectedIds);
    const toggle = (id: number) => {
      const next = selectedSet.has(id)
        ? selectedIds.filter((current) => current !== id)
        : [...selectedIds, id];
      onChange(next.join(', '));
    };
    return (
      <div className="space-y-2">
        <div className="max-h-56 space-y-1 overflow-y-auto rounded border border-deep-ocean/15 p-2">
          {musicians.map((musician) => (
            <label
              key={musician.id}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-ocean-sand/40"
            >
              <input
                type="checkbox"
                checked={selectedSet.has(musician.id)}
                onChange={() => toggle(musician.id)}
                disabled={disabled}
                className="h-4 w-4"
              />
              <span>
                {musician.name} <span className="text-coastal-gray">(#{musician.id})</span>
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-coastal-gray">
          선택 {selectedIds.length}명{selectedIds.length > 0 ? ` — ${selectedIds.join(', ')}` : ''}
        </p>
      </div>
    );
  }

  if (field.kind === 'musician' || field.kind === 'musician-multi') {
    // 폴백: 뮤지션 데이터를 못 불러온 경우 id를 직접 입력한다.
    return (
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.kind === 'musician-multi' ? '3, 11, 59' : '49'}
        disabled={disabled}
        className={inputClass}
      />
    );
  }

  return (
    <input
      type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : 'text'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder}
      disabled={disabled}
      className={inputClass}
    />
  );
}
