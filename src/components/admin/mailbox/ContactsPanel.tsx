import { useCallback, useEffect, useState } from 'react';
import { GROUP_LABEL, GROUP_TYPES } from '@/lib/mailContactsForms';
import type { MailContact, MailGroupType } from '@/types/mailContacts';

export default function ContactsPanel({ canEdit }: { canEdit: boolean }) {
  const [items, setItems] = useState<MailContact[]>([]);
  const [group, setGroup] = useState<'' | MailGroupType>('');
  const [cohort, setCohort] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (group) params.set('group', group);
    if (cohort) params.set('cohort', cohort);
    const res = await fetch(`/api/admin/mail-contacts?${params.toString()}`);
    const data = await res.json();
    if (res.ok) setItems(data.items ?? []);
    else setError(data.error ?? '불러오지 못했습니다.');
  }, [group, cohort]);

  useEffect(() => {
    void load();
  }, [load]);

  const addContact = async (form: {
    name: string;
    email: string;
    group_type: MailGroupType;
    cohorts: string;
  }) => {
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/mail-contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? '추가 실패');
    await load();
  };

  const toggleActive = async (c: MailContact) => {
    const res = await fetch(`/api/admin/mail-contacts/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setError(data.error ?? '상태 변경에 실패했습니다.');
    }
    await load();
  };

  const removeContact = async (c: MailContact) => {
    if (!window.confirm(`${c.name} 연락처를 삭제할까요?`)) return;
    const res = await fetch(`/api/admin/mail-contacts/${c.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setError(data.error ?? '삭제에 실패했습니다.');
    }
    await load();
  };

  const importCsv = async (csv: string) => {
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/mail-contacts/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? '임포트 실패');
    setError(`추가 ${data.inserted}건, 중복 ${data.skipped}건, 오류 ${data.errors?.length ?? 0}건`);
    await load();
  };

  return (
    <section className="space-y-4">
      {/* 필터 */}
      <div className="flex flex-wrap gap-2">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value as '' | MailGroupType)}
          className="rounded border border-deep-ocean/15 px-3 py-2 text-sm"
        >
          <option value="">전체 그룹</option>
          {GROUP_TYPES.map((g) => (
            <option key={g} value={g}>
              {GROUP_LABEL[g]}
            </option>
          ))}
        </select>
        <input
          value={cohort}
          onChange={(e) => setCohort(e.target.value)}
          placeholder="회차 (예: 2026)"
          className="rounded border border-deep-ocean/15 px-3 py-2 text-sm"
        />
      </div>
      {error && (
        <p className="rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">{error}</p>
      )}
      <ul className="divide-y divide-deep-ocean/10 rounded border border-deep-ocean/10 bg-white">
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate">
              <strong className="text-deep-ocean">{c.name}</strong>{' '}
              <span className="text-coastal-gray">{c.email}</span>{' '}
              <span className="text-xs text-jeju-ocean">
                {GROUP_LABEL[c.group_type]} · {c.cohorts.join(',') || '회차없음'}
              </span>
            </span>
            {canEdit && (
              <span className="flex flex-shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(c)}
                  className="text-xs text-coastal-gray hover:text-deep-ocean"
                >
                  {c.is_active ? '활성' : '비활성'}
                </button>
                <button
                  type="button"
                  onClick={() => removeContact(c)}
                  className="text-xs text-sunset-coral"
                >
                  삭제
                </button>
              </span>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-coastal-gray">연락처가 없습니다.</li>
        )}
      </ul>
      {canEdit && <ContactAddForm busy={busy} onAdd={addContact} onImport={importCsv} />}
    </section>
  );
}

function ContactAddForm({
  busy,
  onAdd,
  onImport,
}: {
  busy: boolean;
  onAdd: (f: { name: string; email: string; group_type: MailGroupType; cohorts: string }) => void;
  onImport: (csv: string) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [groupType, setGroupType] = useState<MailGroupType>('musician');
  const [cohorts, setCohorts] = useState('2026');
  const [csv, setCsv] = useState('');
  return (
    <div className="space-y-3 rounded border border-deep-ocean/10 bg-ocean-sand/20 p-4">
      <div className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          className="rounded border border-deep-ocean/15 px-3 py-2 text-sm"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="rounded border border-deep-ocean/15 px-3 py-2 text-sm"
        />
        <select
          value={groupType}
          onChange={(e) => setGroupType(e.target.value as MailGroupType)}
          className="rounded border border-deep-ocean/15 px-3 py-2 text-sm"
        >
          {GROUP_TYPES.map((g) => (
            <option key={g} value={g}>
              {GROUP_LABEL[g]}
            </option>
          ))}
        </select>
        <input
          value={cohorts}
          onChange={(e) => setCohorts(e.target.value)}
          placeholder="회차(콤마구분)"
          className="rounded border border-deep-ocean/15 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            onAdd({ name, email, group_type: groupType, cohorts });
            setName('');
            setEmail('');
            setGroupType('musician');
            setCohorts('2026');
          }}
          className="rounded bg-deep-ocean px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          추가
        </button>
      </div>
      <details>
        <summary className="cursor-pointer text-sm text-coastal-gray">
          CSV 붙여넣기 (이름,이메일,그룹,회차)
        </summary>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={4}
          className="mt-2 w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm"
          placeholder="홍길동,hong@example.com,뮤지션,2026"
        />
        <button
          type="button"
          disabled={busy || !csv.trim()}
          onClick={() => onImport(csv)}
          className="mt-2 rounded border border-jeju-ocean/40 px-3 py-2 text-sm font-semibold text-jeju-ocean disabled:opacity-60"
        >
          일괄 추가
        </button>
      </details>
    </div>
  );
}
