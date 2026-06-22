import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { useAuth } from '@/components/auth/AuthProvider';
import { validatePostTitle, validatePostBody, validateRating } from '@/lib/boardForms';
import PostImageUploader from '@/components/board/PostImageUploader';
import RatingStars from '@/components/board/RatingStars';
import type { Board, PostWithMeta } from '@/types/board';
import { boardImagePath } from '@/lib/boardData';

interface PostFormProps {
  board: Board;
  initial?: PostWithMeta;
  mode: 'create' | 'edit';
}

export default function PostForm({ board, initial, mode }: PostFormProps) {
  const { t } = useTranslation('board');
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [rating, setRating] = useState<number | null>(initial?.rating ?? null);
  const [imageUrls, setImageUrls] = useState<string[]>(
    initial?.images.map((img) => img.image_url) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    body?: string;
    rating?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate
    const titleResult = validatePostTitle(title);
    const bodyResult = validatePostBody(body);
    const ratingResult = validateRating(rating, board.has_rating);

    const newFieldErrors: typeof fieldErrors = {};
    if (!titleResult.ok) newFieldErrors.title = titleResult.reason;
    if (!bodyResult.ok) newFieldErrors.body = bodyResult.reason;
    if (!ratingResult.ok) newFieldErrors.rating = ratingResult.reason;

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }
    setFieldErrors({});
    setError(null);

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === 'create') {
        // Insert post
        const { data: postData, error: insertError } = await supabase
          .from('posts')
          .insert({
            board_id: board.id,
            author_id: user.id,
            title: titleResult.ok ? titleResult.value : title,
            body: bodyResult.ok ? bodyResult.value : body,
            rating: ratingResult.ok ? ratingResult.value : null,
          })
          .select('id')
          .single();

        if (insertError || !postData) {
          setError(t('error.saveFailed'));
          // Best-effort clean up any already-uploaded storage objects
          if (imageUrls.length > 0) {
            const paths = imageUrls
              .map((u) => boardImagePath(u))
              .filter((p): p is string => p !== null);
            if (paths.length > 0) {
              void supabase.storage.from('board-images').remove(paths);
            }
          }
          return;
        }

        const newId = (postData as { id: string }).id;

        // Insert images
        if (imageUrls.length > 0) {
          const imageRows = imageUrls.map((image_url, sort_order) => ({
            post_id: newId,
            image_url,
            sort_order,
          }));
          const { error: imgInsertError } = await supabase.from('post_images').insert(imageRows);
          if (imgInsertError) {
            // Roll back the orphan post, then clean up storage
            await supabase.from('posts').delete().eq('id', newId);
            const paths = imageUrls
              .map((u) => boardImagePath(u))
              .filter((p): p is string => p !== null);
            if (paths.length > 0) {
              void supabase.storage.from('board-images').remove(paths);
            }
            setError(t('error.saveFailed'));
            return;
          }
        }

        await router.push(`/board/${board.slug}/${newId}`);
      } else {
        // Edit mode — must have initial
        if (!initial) return;

        const { error: updateError } = await supabase
          .from('posts')
          .update({
            title: titleResult.ok ? titleResult.value : title,
            body: bodyResult.ok ? bodyResult.value : body,
            rating: ratingResult.ok ? ratingResult.value : null,
          })
          .eq('id', initial.id);

        if (updateError) {
          setError(t('error.saveFailed'));
          return;
        }

        // Capture old images before mutating to know which storage objects to clean up
        const oldImages = initial.images ?? [];
        const oldImageIds = oldImages.map((img) => img.id);
        const finalImageUrlSet = new Set(imageUrls);

        // Insert the new image rows FIRST, then delete the old rows. If the insert
        // fails the old rows are still intact (no data loss). Re-inserting the full
        // final set keeps sort_order contiguous regardless of the user's remove/add order.
        if (imageUrls.length > 0) {
          const imageRows = imageUrls.map((image_url, sort_order) => ({
            post_id: initial.id,
            image_url,
            sort_order,
          }));
          const { error: imgInsertError } = await supabase.from('post_images').insert(imageRows);
          if (imgInsertError) {
            setError(t('error.saveFailed'));
            return;
          }
        }

        // New rows are saved; now remove the previous rows by id (best-effort —
        // a failure here leaves harmless duplicates, never missing images).
        if (oldImageIds.length > 0) {
          await supabase.from('post_images').delete().in('id', oldImageIds);
        }

        // Remove storage objects for images that are no longer in the final set (best-effort)
        const removedImages = oldImages.filter((img) => !finalImageUrlSet.has(img.image_url));
        if (removedImages.length > 0) {
          const removedPaths = removedImages
            .map((img) => boardImagePath(img.image_url))
            .filter((p): p is string => p !== null);
          if (removedPaths.length > 0) {
            void supabase.storage.from('board-images').remove(removedPaths);
          }
        }

        await router.push(`/board/${board.slug}/${initial.id}`);
      }
    } catch {
      setError(t('error.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit' && initial) {
      void router.push(`/board/${board.slug}/${initial.id}`);
    } else {
      void router.push(`/board/${board.slug}`);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      className="space-y-6"
    >
      {/* Title */}
      <div>
        <label htmlFor="post-title" className="block text-sm font-semibold text-deep-ocean">
          {t('post.title')}
        </label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="mt-1 w-full rounded-lg border border-seafoam px-3 py-2 text-base text-deep-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean"
        />
        {fieldErrors.title && <p className="mt-1 text-sm text-red-500">{fieldErrors.title}</p>}
      </div>

      {/* Body */}
      <div>
        <label htmlFor="post-body" className="block text-sm font-semibold text-deep-ocean">
          {t('post.body')}
        </label>
        <textarea
          id="post-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          maxLength={10000}
          className="mt-1 w-full rounded-lg border border-seafoam px-3 py-2 text-base text-deep-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean"
        />
        {fieldErrors.body && <p className="mt-1 text-sm text-red-500">{fieldErrors.body}</p>}
      </div>

      {/* Rating — only when board.has_rating */}
      {board.has_rating && (
        <div>
          <span className="block text-sm font-semibold text-deep-ocean">{t('post.rating')}</span>
          <div className="mt-2">
            <RatingStars value={rating ?? 0} onSelect={setRating} />
          </div>
          {fieldErrors.rating && <p className="mt-1 text-sm text-red-500">{fieldErrors.rating}</p>}
        </div>
      )}

      {/* Images */}
      <div>
        <span className="block text-sm font-semibold text-deep-ocean">{t('post.images')}</span>
        <div className="mt-2">
          <PostImageUploader value={imageUrls} onChange={setImageUrls} />
        </div>
      </div>

      {/* Global error */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-jeju-ocean px-6 py-2 text-sm font-semibold text-white transition hover:bg-deep-ocean disabled:opacity-50"
        >
          {saving ? t('post.saving') : t('post.save')}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-lg border border-coastal-gray px-6 py-2 text-sm font-semibold text-coastal-gray transition hover:bg-seafoam"
        >
          {t('post.cancel')}
        </button>
      </div>
    </form>
  );
}
