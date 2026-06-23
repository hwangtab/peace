import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import type { MeetingAttachment } from '@/types/meeting';

interface AttachmentSectionProps {
  meetingId: string;
  attachments: MeetingAttachment[];
  canEdit: boolean;
}

const ALLOWED_EXT = [
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'hwp',
  'hwpx',
  'txt',
  'md',
];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

const makeRandomSlug = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const formatSize = (bytes: number | null): string => {
  if (bytes === null || bytes === undefined) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AttachmentSection({
  meetingId,
  attachments,
  canEdit,
}: AttachmentSectionProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const refresh = () => router.replace(router.asPath);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    const ext =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, '') || '';
    if (!ALLOWED_EXT.includes(ext)) {
      setError(`허용되지 않는 형식입니다. (${ALLOWED_EXT.join(', ')})`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('파일 크기는 20MB 이하여야 합니다.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    const path = `${meetingId}/${makeRandomSlug()}.${ext}`;
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from('meeting-files')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) {
        setError(`업로드 실패: ${uploadError.message}`);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const response = await fetch('/api/admin/meeting-attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting_id: meetingId,
          file_path: path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.attachment) {
        // 메타 등록 실패 → 업로드한 객체 best-effort 정리
        try {
          await supabase.storage.from('meeting-files').remove([path]);
        } catch {
          // 무시
        }
        setError(payload.error || '첨부 등록에 실패했습니다.');
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const download = async (att: MeetingAttachment) => {
    if (downloadingId) return;
    setError('');
    setDownloadingId(att.id);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signError } = await supabase.storage
        .from('meeting-files')
        .createSignedUrl(att.file_path, 60);
      if (signError || !data?.signedUrl) {
        setError('다운로드 링크 생성에 실패했습니다.');
        return;
      }
      window.open(data.signedUrl, '_blank', 'noopener');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setDownloadingId(null);
    }
  };

  const deleteAttachment = async (id: string) => {
    if (!window.confirm('이 첨부 파일을 삭제할까요?')) return;
    setError('');
    setBusyId(id);
    try {
      const response = await fetch('/api/admin/meeting-attachments', {
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
      <h2 className="mb-3 font-display text-lg font-bold text-deep-ocean">
        첨부 파일 ({attachments.length})
      </h2>

      {error && (
        <p className="mb-3 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      {attachments.length === 0 ? (
        <p className="mb-4 text-sm text-deep-ocean/50">등록된 첨부 파일이 없습니다.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center justify-between gap-3 rounded border border-deep-ocean/10 px-3 py-2"
            >
              <button
                type="button"
                onClick={() => download(att)}
                disabled={downloadingId !== null}
                className="min-w-0 truncate text-left text-sm font-semibold text-jeju-ocean hover:underline disabled:opacity-60"
              >
                {att.file_name}
              </button>
              <div className="flex shrink-0 items-center gap-3">
                {att.file_size !== null && (
                  <span className="text-xs text-deep-ocean/50">{formatSize(att.file_size)}</span>
                )}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => deleteAttachment(att.id)}
                    disabled={busyId === att.id}
                    className="text-xs font-semibold text-sunset-coral hover:underline disabled:opacity-60"
                  >
                    삭제
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div className="border-t border-deep-ocean/10 pt-4">
          <input
            ref={fileInputRef}
            type="file"
            aria-label="첨부 파일 선택 (최대 20MB)"
            onChange={handleUpload}
            disabled={isUploading}
            className="block w-full text-sm text-deep-ocean/70 file:mr-3 file:rounded file:border-0 file:bg-deep-ocean file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-jeju-ocean disabled:opacity-60"
          />
          <p className="mt-2 text-xs text-deep-ocean/50">
            {isUploading ? '업로드 중…' : `최대 20MB · ${ALLOWED_EXT.join(', ')}`}
          </p>
        </div>
      )}
    </section>
  );
}
