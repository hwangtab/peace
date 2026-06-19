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

// Returns a random slug (file-name-safe) for storage path generation.
// Defined outside the component to avoid false positives from the purity lint rule.
const makeRandomSlug = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function PostImageUploader({ value, onChange }: PostImageUploaderProps) {
  const { t } = useTranslation('board');
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track URLs uploaded during this session so we only delete storage for new uploads.
  // Pre-existing images (seeded from initial.images in edit mode) are not in this set.
  const sessionUploadedRef = useRef<Set<string> | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = '';

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t('error.invalidImageType'));
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(t('error.imageTooLarge'));
      return;
    }
    if (!user) {
      setError(t('error.loginRequired'));
      return;
    }

    // Ensure the session set is initialised before entering try/catch
    if (!sessionUploadedRef.current) sessionUploadedRef.current = new Set<string>();
    const sessionSet = sessionUploadedRef.current;

    setUploading(true);
    try {
      const ext =
        file.name
          .split('.')
          .pop()
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, '') || 'jpg';
      // RLS requires first path segment = user.id
      const path = `${user.id}/${makeRandomSlug()}.${ext}`;

      const supabase = createSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from('board-images')
        .upload(path, file, { cacheControl: '31536000', upsert: false });

      if (uploadError) {
        setError(t('error.saveFailed'));
        return;
      }

      const { data } = supabase.storage.from('board-images').getPublicUrl(path);
      sessionSet.add(data.publicUrl);
      onChange([...value, data.publicUrl]);
    } catch {
      setError(t('error.saveFailed'));
    } finally {
      setUploading(false);
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
              <Image src={url} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                aria-label={t('post.removeImage')}
                onClick={() => handleRemove(idx)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
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
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => { void handleFileChange(e); }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-jeju-ocean px-4 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-seafoam disabled:opacity-50"
      >
        {uploading ? t('post.uploading') : t('post.uploadImage')}
      </button>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
