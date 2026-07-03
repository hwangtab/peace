import { useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { useAuth } from '@/components/auth/AuthProvider';
import { boardImagePath } from '@/lib/boardData';

interface PostImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGES = 10; // 게시글당 이미지 장수 상한

// Returns a random slug (file-name-safe) for storage path generation.
// Defined outside the component to avoid false positives from the purity lint rule.
const makeRandomSlug = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function PostImageUploader({ value, onChange }: PostImageUploaderProps) {
  const { t } = useTranslation('board');
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // 여러 장을 한 번에 올릴 때 진행 상황(done/total)을 버튼에 노출한다.
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Track URLs uploaded during this session so we only delete storage for new uploads.
  // Pre-existing images (seeded from initial.images in edit mode) are not in this set.
  const sessionUploadedRef = useRef<Set<string> | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    // Reset input so the same file(s) can be re-selected
    e.target.value = '';
    if (files.length === 0) return;

    setError(null);

    if (!user) {
      setError(t('error.loginRequired'));
      return;
    }

    const remaining = MAX_IMAGES - value.length;
    if (remaining <= 0) {
      setError(t('error.tooManyImages', { max: MAX_IMAGES }));
      return;
    }
    // 남은 슬롯보다 많이 고르면 앞에서부터 채우고 초과분은 버린다.
    const batch = files.slice(0, remaining);
    const truncated = files.length > remaining;

    // Ensure the session set is initialised before entering try/catch
    if (!sessionUploadedRef.current) sessionUploadedRef.current = new Set<string>();
    const sessionSet = sessionUploadedRef.current;

    setUploading(true);
    setProgress({ done: 0, total: batch.length });
    const supabase = createSupabaseBrowserClient();
    // value 는 배치 시작 시점 스냅샷 — 매 장 업로드 후 [...value, ...added] 로 미리보기를 점진 갱신.
    const added: string[] = [];
    try {
      for (let i = 0; i < batch.length; i++) {
        const file = batch[i];
        if (!file) continue;
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError(t('error.invalidImageType'));
          setProgress({ done: i + 1, total: batch.length });
          continue;
        }
        if (file.size > MAX_SIZE) {
          setError(t('error.imageTooLarge'));
          setProgress({ done: i + 1, total: batch.length });
          continue;
        }
        const ext =
          file.name
            .split('.')
            .pop()
            ?.toLowerCase()
            .replace(/[^a-z0-9]/g, '') || 'jpg';
        // RLS requires first path segment = user.id
        const path = `${user.id}/${makeRandomSlug()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('board-images')
          .upload(path, file, { cacheControl: '31536000', upsert: false });

        if (uploadError) {
          setError(t('error.saveFailed'));
          setProgress({ done: i + 1, total: batch.length });
          continue;
        }

        const { data } = supabase.storage.from('board-images').getPublicUrl(path);
        sessionSet.add(data.publicUrl);
        added.push(data.publicUrl);
        onChange([...value, ...added]);
        setProgress({ done: i + 1, total: batch.length });
      }
      if (truncated) setError(t('error.tooManyImages', { max: MAX_IMAGES }));
    } catch {
      setError(t('error.saveFailed'));
      if (added.length > 0) onChange([...value, ...added]);
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const handleRemove = (idx: number) => {
    const removedUrl = value[idx];
    onChange(value.filter((_, i) => i !== idx));
    // Only delete from storage if this URL was uploaded in the current session.
    // Pre-existing images (from saved post) are left for PostForm's save-time cleanup.
    if (removedUrl && sessionUploadedRef.current?.has(removedUrl)) {
      sessionUploadedRef.current.delete(removedUrl);
      const path = boardImagePath(removedUrl);
      if (path) {
        const supabase = createSupabaseBrowserClient();
        void supabase.storage.from('board-images').remove([path]);
      }
    }
  };

  return (
    <div>
      {/* Preview grid */}
      {value.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {value.map((url, idx) => (
            <div
              key={url}
              className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-seafoam"
            >
              <Image
                src={url}
                alt={t('post.imageAlt', { n: idx + 1 })}
                fill
                sizes="96px"
                className="object-cover"
              />
              <button
                type="button"
                aria-label={t('post.removeImage')}
                onClick={() => handleRemove(idx)}
                className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          void handleFileChange(e);
        }}
      />
      <button
        type="button"
        disabled={uploading || value.length >= MAX_IMAGES}
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-jeju-ocean px-4 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-seafoam disabled:opacity-50"
      >
        {uploading
          ? progress && progress.total > 1
            ? `${t('post.uploading')} ${progress.done}/${progress.total}`
            : t('post.uploading')
          : t('post.uploadImage')}
      </button>
      <span className="ms-2 text-xs text-coastal-gray">
        {value.length} / {MAX_IMAGES}
      </span>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
