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
  // 청크 발송 진행 상태(서버 job 커서의 미러) — 발송 중 진행률 표시용.
  const [progress, setProgress] = useState<{ cursor: number; total: number } | null>(null);
  // 청크 연쇄가 중간에 끊긴 job id — '이어서 발송'으로 중복 없이 재개한다.
  const [resumeJobId, setResumeJobId] = useState<string | null>(null);

  // 발송 진행 중 새로고침·탭 닫기 경고(중간 이탈 방지).
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      const params = new URLSearchParams();
      if (group) params.set('group', group);
      if (cohort) params.set('cohort', cohort);
      try {
        const res = await fetch(`/api/admin/mail-contacts?${params.toString()}`, { signal });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setContacts((data.items ?? []).filter((c: MailContact) => c.is_active));
        } else {
          setError(data.error ?? '연락처를 불러오지 못했습니다.');
        }
        setSelected(new Set());
      } catch (e) {
        // 필터가 바뀌어 이전 요청이 취소된 경우는 무시한다(응답 역전 방지).
        if ((e as Error).name === 'AbortError') return;
        setError('연락처를 불러오지 못했습니다.');
      }
    },
    [group, cohort]
  );

  useEffect(() => {
    // 필터(group/cohort) 변경 시 이전 요청을 취소해 응답 역전으로 다른 그룹 명단이
    // 표시된 채 발송되는 사고를 막는다.
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
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

  // 서버는 한 요청당 소분량(청크)만 발송하고 진행 커서를 저장한다.
  // done=false면 jobId로 다음 청크를 연쇄 호출해 완료까지 진행한다.
  type ChunkResponse = {
    jobId: string;
    done: boolean;
    total: number;
    cursor: number;
    remaining: number;
    sentCount: number;
    failed: { email: string; error: string }[];
    error?: string;
  };

  const postSend = async (body: unknown): Promise<ChunkResponse> => {
    const res = await fetch('/api/admin/mailbox/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as Partial<ChunkResponse>;
    if (!res.ok) throw Object.assign(new Error(data.error ?? '발송 실패'), { jobId: data.jobId });
    return data as ChunkResponse;
  };

  // 첫 응답(job 생성) 이후 done까지 청크를 연쇄 호출한다.
  const runChunks = async (first: ChunkResponse) => {
    let chunk = first;
    setProgress({ cursor: chunk.cursor, total: chunk.total });
    while (!chunk.done) {
      try {
        chunk = await postSend({ jobId: chunk.jobId });
      } catch (e) {
        // 중단돼도 서버 커서·발송 기록이 남아 있어 같은 job 재개 시 중복 발송되지 않는다.
        setResumeJobId(chunk.jobId);
        setError(
          `발송이 중단되었습니다 (${chunk.cursor}/${chunk.total} 처리됨): ${(e as Error).message} — '이어서 발송'을 누르면 중복 없이 재개됩니다.`
        );
        return null;
      }
      setProgress({ cursor: chunk.cursor, total: chunk.total });
    }
    return chunk;
  };

  const finish = (last: ChunkResponse) => {
    setResult({ sent: last.sentCount, failed: last.failed ?? [] });
    setResumeJobId(null);
    // 성공 후 선택·직접입력을 비워 같은 본문 중복 발송을 막는다(결과 요약은 그대로 노출).
    setSelected(new Set());
    setManualText('');
  };

  const send = async () => {
    setError('');
    setResult(null);
    const ids = [...selected];
    if (totalCount === 0) return setError('수신자를 선택하거나 직접 입력하세요.');
    if (!subject.trim() || !text.trim()) return setError('제목과 본문을 입력하세요.');
    if (!window.confirm(`${totalCount}명에게 발송합니다. 발신: admin@peaceandmusic.net`)) return;
    setBusy(true);
    setResumeJobId(null);
    try {
      const first = await postSend({ contactIds: ids, manualText, subject, text });
      const last = await runChunks(first);
      if (last) finish(last);
    } catch (e) {
      // 첫 청크 처리 중 실패해도 서버가 jobId를 알려주면 재개할 수 있다.
      const jobId = (e as { jobId?: string }).jobId;
      if (jobId) {
        setResumeJobId(jobId);
        setError(`${(e as Error).message} — '이어서 발송'을 누르면 중복 없이 재개됩니다.`);
      } else {
        setError((e as Error).message);
      }
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  // 중단된 job 재개 — 서버가 이미 발송된 수신자를 건너뛰므로 중복 발송 없음.
  const resume = async () => {
    if (!resumeJobId) return;
    setError('');
    setBusy(true);
    try {
      const first = await postSend({ jobId: resumeJobId });
      const last = await runChunks(first);
      if (last) finish(last);
    } catch (e) {
      setError(
        `발송 재개에 실패했습니다: ${(e as Error).message} — 잠시 후 '이어서 발송'을 다시 눌러 주세요.`
      );
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  if (!canEdit)
    return <p className="text-sm text-coastal-gray">발송 권한이 없습니다(editor 이상).</p>;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value as '' | MailGroupType)}
          aria-label="수신자 그룹 필터"
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
          aria-label="수신자 회차 필터"
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
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.has(c.id)}
                onChange={() => toggle(c.id)}
                aria-label={`${c.name} 선택`}
              />
              <span className="text-deep-ocean">{c.name}</span>
            </label>
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
        aria-label="메일 제목"
        className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="본문 — {이름} 을 쓰면 받는 사람 이름으로 치환됩니다."
        aria-label="메일 본문"
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
      {busy && progress && (
        <div className="rounded bg-ocean-sand/30 px-3 py-2 text-sm text-deep-ocean">
          <p aria-live="polite">
            {progress.cursor}/{progress.total} 발송 중… 창을 닫거나 이동하지 마세요.
          </p>
          <div className="mt-1 h-1.5 overflow-hidden rounded bg-deep-ocean/10">
            <div
              className="h-full rounded bg-jeju-ocean transition-all"
              style={{
                width: `${progress.total > 0 ? Math.round((progress.cursor / progress.total) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={resumeJobId ? resume : send}
        className="rounded bg-deep-ocean px-5 py-2 font-semibold text-white disabled:opacity-60"
      >
        {busy
          ? progress
            ? `발송 중… ${progress.cursor}/${progress.total}`
            : '발송 중…'
          : resumeJobId
            ? '이어서 발송'
            : `${totalCount}명에게 발송`}
      </button>
    </section>
  );
}
