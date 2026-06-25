import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GROUP_LABEL,
  GROUP_TYPES,
  personalizeBody,
  parseManualRecipients,
} from '@/lib/mailContactsForms';
import { CAMP_EDITION_YEARS, campEditionShortLabel } from '@/lib/campEditions';
import type { MailContact, MailGroupType } from '@/types/mailContacts';

export default function ComposePanel({ canEdit }: { canEdit: boolean }) {
  const [group, setGroup] = useState<'' | MailGroupType>('');
  const [cohort, setCohort] = useState('');
  const [contacts, setContacts] = useState<MailContact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [manualText, setManualText] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    sent: number;
    failed: { email: string; error: string }[];
  } | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (group) params.set('group', group);
    if (cohort) params.set('cohort', cohort);
    const res = await fetch(`/api/admin/mail-contacts?${params.toString()}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setContacts((data.items ?? []).filter((c: MailContact) => c.is_active));
    } else {
      setError(data.error ?? '연락처를 불러오지 못했습니다.');
    }
    setSelected(new Set());
  }, [group, cohort]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const selectAll = () => setSelected(new Set(contacts.map((c) => c.id)));
  const clearAll = () => setSelected(new Set());

  const preview = useMemo(() => {
    const first = contacts.find((c) => selected.has(c.id));
    return first ? personalizeBody(text, first.name) : '';
  }, [contacts, selected, text]);

  // 직접 입력 수신자 — 명단 선택과 합산해 총 인원을 보여준다(이메일 기준 중복 제거).
  const manualParsed = useMemo(() => parseManualRecipients(manualText), [manualText]);
  const totalCount = useMemo(() => {
    const emails = new Set(manualParsed.recipients.map((r) => r.email));
    for (const c of contacts) if (selected.has(c.id)) emails.add(c.email.toLowerCase());
    return emails.size;
  }, [contacts, selected, manualParsed]);

  const send = async () => {
    setError('');
    setResult(null);
    const ids = [...selected];
    if (totalCount === 0) return setError('수신자를 선택하거나 직접 입력하세요.');
    if (!subject.trim() || !text.trim()) return setError('제목과 본문을 입력하세요.');
    if (!window.confirm(`${totalCount}명에게 발송합니다. 발신: admin@peaceandmusic.net`)) return;
    setBusy(true);
    const res = await fetch('/api/admin/mailbox/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactIds: ids, manualText, subject, text }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? '발송 실패');
    setResult({ sent: data.sent, failed: data.failed ?? [] });
    // 성공 후 선택·직접입력을 비워 같은 본문 중복 발송을 막는다(결과 요약은 그대로 노출).
    setSelected(new Set());
    setManualText('');
  };

  if (!canEdit)
    return <p className="text-sm text-coastal-gray">발송 권한이 없습니다(editor 이상).</p>;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
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
        <select
          value={cohort}
          onChange={(e) => setCohort(e.target.value)}
          className="rounded border border-deep-ocean/15 px-3 py-2 text-sm"
        >
          <option value="">전체 회차</option>
          {CAMP_EDITION_YEARS.map((year) => (
            <option key={year} value={String(year)}>
              {campEditionShortLabel(year)}
            </option>
          ))}
        </select>
        <button type="button" onClick={selectAll} className="text-xs text-jeju-ocean">
          전체선택
        </button>
        <button type="button" onClick={clearAll} className="text-xs text-coastal-gray">
          해제
        </button>
        <span className="ml-auto text-sm font-semibold text-deep-ocean">
          명단 {selected.size}명 · 총 {totalCount}명
        </span>
      </div>

      <ul className="max-h-48 divide-y divide-deep-ocean/10 overflow-y-auto rounded border border-deep-ocean/10 bg-white">
        {contacts.map((c) => (
          <li key={c.id} className="flex items-center gap-2 px-3 py-1.5 text-sm">
            <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} />
            <span className="text-deep-ocean">{c.name}</span>
            <span className="text-coastal-gray">{c.email}</span>
            <span className="ml-auto text-xs text-jeju-ocean">{GROUP_LABEL[c.group_type]}</span>
          </li>
        ))}
        {contacts.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-coastal-gray">
            해당 조건의 연락처가 없습니다.
          </li>
        )}
      </ul>

      <div>
        <label
          htmlFor="manual-recipients"
          className="mb-1 block text-sm font-semibold text-deep-ocean"
        >
          직접 입력 수신자
          <span className="ml-1 font-normal text-coastal-gray">
            (한 줄에 한 명, `이메일` 또는 `이름 &lt;이메일&gt;`)
          </span>
        </label>
        <textarea
          id="manual-recipients"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          rows={3}
          placeholder={'hong@example.com\n까르 <kkar@example.com>'}
          className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm"
        />
        {manualText.trim() && (
          <p className="mt-1 text-xs text-coastal-gray">
            인식된 직접 입력 {manualParsed.recipients.length}명
            {manualParsed.errors.length > 0 && (
              <span className="text-sunset-coral">
                {' '}
                · 형식 오류 {manualParsed.errors.length}건: {manualParsed.errors.join(', ')}
              </span>
            )}
          </p>
        )}
      </div>

      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="제목"
        className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="본문 — {이름} 을 쓰면 받는 사람 이름으로 치환됩니다."
        className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm"
      />
      {preview && (
        <p className="rounded bg-ocean-sand/30 px-3 py-2 text-xs text-coastal-gray">
          미리보기(첫 수신자): {preview}
        </p>
      )}
      {error && (
        <p className="rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">{error}</p>
      )}
      {result && (
        <div className="rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">
          발송 완료 — 성공 {result.sent}건
          {result.failed.length > 0 ? `, 실패 ${result.failed.length}건` : ''}
          {result.failed.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-xs text-sunset-coral">
              {result.failed.map((f) => (
                <li key={f.email}>
                  {f.email}: {f.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={send}
        className="rounded bg-deep-ocean px-5 py-2 font-semibold text-white disabled:opacity-60"
      >
        {busy ? '발송 중…' : `${totalCount}명에게 발송`}
      </button>
    </section>
  );
}
