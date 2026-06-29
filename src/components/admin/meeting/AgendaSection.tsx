import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  AGENDA_STATUSES,
  AGENDA_STATUS_LABELS,
  validateAgendaTitle,
  validateAgendaContent,
} from '@/lib/meetingForms';
import type { MeetingAgenda, AgendaStatus } from '@/types/meeting';

interface AgendaSectionProps {
  meetingId: string;
  agendas: MeetingAgenda[];
  canEdit: boolean;
}

export default function AgendaSection({ meetingId, agendas, canEdit }: AgendaSectionProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const refresh = () => router.replace(router.asPath);

  const addAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const titleResult = validateAgendaTitle(title);
    if (!titleResult.ok) {
      setError(titleResult.reason);
      return;
    }
    const contentResult = validateAgendaContent(content);
    if (!contentResult.ok) {
      setError(contentResult.reason);
      return;
    }
    setIsBusy(true);
    try {
      const response = await fetch('/api/admin/meeting-agendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting_id: meetingId,
          title: titleResult.value,
          content: contentResult.value,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.agenda) {
        setError(payload.error || '안건 추가에 실패했습니다.');
        setIsBusy(false);
        return;
      }
      setTitle('');
      setContent('');
      setIsBusy(false);
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsBusy(false);
    }
  };

  const changeStatus = async (id: string, status: AgendaStatus) => {
    setError('');
    setBusyId(id);
    try {
      const response = await fetch('/api/admin/meeting-agendas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.agenda) {
        setError(payload.error || '상태 변경에 실패했습니다.');
        setBusyId(null);
        return;
      }
      setBusyId(null);
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setBusyId(null);
    }
  };

  const deleteAgenda = async (id: string) => {
    if (!window.confirm('이 안건을 삭제할까요?')) return;
    setError('');
    setBusyId(id);
    try {
      const response = await fetch('/api/admin/meeting-agendas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.error || '삭제에 실패했습니다.');
        setBusyId(null);
        return;
      }
      setBusyId(null);
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setBusyId(null);
    }
  };

  // 표시 순서대로 sort_order를 재부여한다. 전체 순서를 단일 요청으로 보내(서버가 일괄 적용)
  // 행마다 PATCH를 보내다 중간에 멈춰 sort_order가 깨지던 문제를 없앤다.
  const moveAgenda = async (index: number, dir: -1 | 1) => {
    if (isReordering) return;
    const target = index + dir;
    if (target < 0 || target >= agendas.length) return;
    const moving = agendas[index];
    const other = agendas[target];
    if (!moving || !other) return;

    setError('');
    setIsReordering(true);

    const reordered = [...agendas];
    reordered[index] = other;
    reordered[target] = moving;

    try {
      const response = await fetch('/api/admin/meeting-agendas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_id: meetingId, order: reordered.map((a) => a.id) }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.error || '순서 변경에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsReordering(false);
      refresh();
    }
  };

  return (
    <section className="rounded border border-deep-ocean/10 bg-white p-5">
      <h2 className="mb-3 font-display text-lg font-bold text-deep-ocean">
        안건 ({agendas.length})
      </h2>

      {error && (
        <p className="mb-3 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      {agendas.length === 0 ? (
        <p className="mb-4 text-sm text-deep-ocean/50">등록된 안건이 없습니다.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {agendas.map((a, idx) => (
            <li key={a.id} className="rounded border border-deep-ocean/10 px-3 py-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-deep-ocean">{a.title}</p>
                  {a.content && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-deep-ocean/70">
                      {a.content}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {canEdit && (
                    <span className="flex flex-col leading-none">
                      <button
                        type="button"
                        onClick={() => moveAgenda(idx, -1)}
                        disabled={idx === 0 || busyId === a.id || isReordering}
                        aria-label="위로 이동"
                        className="px-1 text-xs text-deep-ocean/50 hover:text-jeju-ocean disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveAgenda(idx, 1)}
                        disabled={idx === agendas.length - 1 || busyId === a.id || isReordering}
                        aria-label="아래로 이동"
                        className="px-1 text-xs text-deep-ocean/50 hover:text-jeju-ocean disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </span>
                  )}
                  {canEdit ? (
                    <select
                      value={a.status}
                      disabled={busyId === a.id || isReordering}
                      onChange={(e) => changeStatus(a.id, e.target.value as AgendaStatus)}
                      aria-label={`${a.title} 안건 상태`}
                      className="rounded border border-deep-ocean/15 px-2 py-1 text-xs focus:border-jeju-ocean focus:outline-none"
                    >
                      {AGENDA_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {AGENDA_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="rounded-full bg-ocean-sand px-2.5 py-1 text-xs font-semibold text-deep-ocean/70">
                      {AGENDA_STATUS_LABELS[a.status]}
                    </span>
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => deleteAgenda(a.id)}
                      disabled={busyId === a.id || isReordering}
                      className="text-xs font-semibold text-sunset-coral hover:underline disabled:opacity-60"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <form onSubmit={addAgenda} className="space-y-2 border-t border-deep-ocean/10 pt-4">
          <input
            aria-label="안건 제목"
            className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="안건 제목"
          />
          <textarea
            aria-label="안건 내용(선택)"
            className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="안건 내용(선택)"
            rows={2}
          />
          <button
            type="submit"
            disabled={isBusy || isReordering}
            className="rounded bg-deep-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            {isBusy ? '추가 중…' : '안건 추가'}
          </button>
        </form>
      )}
    </section>
  );
}
