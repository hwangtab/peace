import { useState } from 'react';
import { useRouter } from 'next/router';
import { validateAttendeeName, validateAttendeeNote } from '@/lib/meetingForms';
import type { MeetingAttendee } from '@/types/meeting';

interface AttendeeSectionProps {
  meetingId: string;
  attendees: MeetingAttendee[];
  canEdit: boolean;
}

export default function AttendeeSection({ meetingId, attendees, canEdit }: AttendeeSectionProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = () => router.replace(router.asPath);

  const addAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const nameResult = validateAttendeeName(name);
    if (!nameResult.ok) {
      setError(nameResult.reason);
      return;
    }
    const noteResult = validateAttendeeNote(note);
    if (!noteResult.ok) {
      setError(noteResult.reason);
      return;
    }
    setIsBusy(true);
    try {
      const response = await fetch('/api/admin/meeting-attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_id: meetingId, name: nameResult.value, note: noteResult.value }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.attendee) {
        setError(payload.error || '참석자 추가에 실패했습니다.');
        setIsBusy(false);
        return;
      }
      setName('');
      setNote('');
      setIsBusy(false);
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsBusy(false);
    }
  };

  const deleteAttendee = async (id: string) => {
    if (!window.confirm('이 참석자를 삭제할까요?')) return;
    setError('');
    setBusyId(id);
    try {
      const response = await fetch('/api/admin/meeting-attendees', {
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

  return (
    <section className="rounded border border-deep-ocean/10 bg-white p-5">
      <h2 className="mb-3 font-display text-lg font-bold text-deep-ocean">참석자 ({attendees.length})</h2>

      {error && (
        <p className="mb-3 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      {attendees.length === 0 ? (
        <p className="mb-4 text-sm text-deep-ocean/50">등록된 참석자가 없습니다.</p>
      ) : (
        <ul className="mb-4 flex flex-wrap gap-2">
          {attendees.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-full border border-deep-ocean/15 bg-ocean-sand/50 px-3 py-1 text-sm text-deep-ocean"
            >
              <span className="font-semibold">{p.name}</span>
              {p.note && <span className="text-deep-ocean/60">· {p.note}</span>}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => deleteAttendee(p.id)}
                  disabled={busyId === p.id}
                  className="text-sunset-coral hover:text-sunset-coral/70 disabled:opacity-60"
                  aria-label={`${p.name} 삭제`}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <form onSubmit={addAttendee} className="flex flex-wrap gap-2 border-t border-deep-ocean/10 pt-4">
          <input
            className="min-w-[8rem] flex-1 rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
          />
          <input
            className="min-w-[8rem] flex-1 rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="비고(선택, 예: 진행)"
          />
          <button
            type="submit"
            disabled={isBusy}
            className="rounded bg-deep-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            {isBusy ? '추가 중…' : '참석자 추가'}
          </button>
        </form>
      )}
    </section>
  );
}
