import { useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { useAuth } from '@/components/auth/AuthProvider';

interface PostImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export default function PostImageUploader({ value, onChange }: PostImageUploaderProps) {
  const { t } = useTranslation('board');
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setUploading(true);
    try {
      const ext =
        file.name
          .split('.')
          .pop()
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, '') || 'jpg';
      const rand = Math.random().toString(36).slice(2);
      // RLS requires first path segment = user.id
      const path = `${user.id}/${Date.now()}-${rand}.${ext}`;

      const supabase = createSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from('board-images')
        .upload(path, file, { cacheControl: '31536000', upsert: false });

      if (uploadError) {
        setError(t('error.saveFailed'));
        return;
      }

      const { data } = supabase.storage.from('board-images').getPublicUrl(path);
      onChange([...value, data.publicUrl]);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
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
                aria-label="사진 제거"
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
