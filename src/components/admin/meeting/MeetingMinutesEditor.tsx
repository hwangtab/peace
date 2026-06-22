import { useState } from 'react';
import { useRouter } from 'next/router';
import MarkdownView from '@/components/admin/MarkdownView';
import { validateMinutes } from '@/lib/meetingForms';

interface MeetingMinutesEditorProps {
  meetingId: string;
  initialMd: string;
  canEdit: boolean;
}

export default function MeetingMinutesEditor({
  meetingId,
  initialMd,
  canEdit,
}: MeetingMinutesEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialMd);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError('');
    const result = validateMinutes(draft);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes_md: result.value }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.meeting) {
        setError(payload.error || '회의록 저장에 실패했습니다.');
        setIsSaving(false);
        return;
      }
      setIsEditing(false);
      setIsSaving(false);
      router.replace(router.asPath);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded border border-deep-ocean/10 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-deep-ocean">회의록</h2>
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={() => {
              setDraft(initialMd);
              setIsEditing(true);
            }}
            className="rounded bg-jeju-ocean px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-deep-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            {initialMd.trim() ? '편집' : '작성'}
          </button>
        )}
      </div>

      {error && (
        <p className="mb-3 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            className="h-96 w-full rounded border border-deep-ocean/15 px-3 py-2 font-mono text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="마크다운으로 회의록을 작성하세요."
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
            >
              {isSaving ? '저장 중…' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError('');
              }}
              disabled={isSaving}
              className="rounded border border-deep-ocean/20 px-4 py-2 font-semibold text-deep-ocean transition hover:bg-deep-ocean/5 disabled:opacity-60"
            >
              취소
            </button>
          </div>
        </div>
      ) : initialMd.trim() ? (
        <MarkdownView content={initialMd} />
      ) : (
        <p className="text-sm text-deep-ocean/50">아직 작성된 회의록이 없습니다.</p>
      )}
    </section>
  );
}
