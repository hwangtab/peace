import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/components/auth/AuthProvider';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { validateComment } from '@/lib/boardForms';
import { safeRedirectPath } from '@/lib/memberAuth';

export interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  status: 'published' | 'hidden';
  created_at: string;
  updated_at: string;
  author_nickname: string;
}

interface Props {
  postId: string;
  initialComments: CommentRow[];
}

async function fetchComments(postId: string): Promise<CommentRow[]> {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase
    .from('post_comments')
    .select('*, profiles!post_comments_author_id_fkey(nickname)')
    .eq('post_id', postId)
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
    id: String(r.id),
    post_id: String(r.post_id),
    author_id: String(r.author_id),
    body: String(r.body),
    status: r.status as 'published' | 'hidden',
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
    author_nickname: (r.profiles as { nickname?: string } | null)?.nickname ?? '익명',
  }));
}

export default function CommentSection({ postId, initialComments }: Props) {
  const { t } = useTranslation('board');
  const router = useRouter();
  const auth = useAuth();
  const user = auth.user;

  const [comments, setComments] = useState<CommentRow[]>(initialComments);
  const [body, setBody] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loginHref = `/login?next=${safeRedirectPath(router.asPath)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const result = validateComment(body);
    if (!result.ok) {
      setValidationError(result.reason);
      return;
    }

    if (!user) return;

    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from('post_comments').insert({
        post_id: postId,
        author_id: user.id,
        body: result.value,
      });
      setBody('');
      const refreshed = await fetchComments(postId);
      setComments(refreshed);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeleteId(commentId);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from('post_comments').delete().eq('id', commentId);
      const refreshed = await fetchComments(postId);
      setComments(refreshed);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <section className="mt-10 border-t border-seafoam pt-8">
      <h2 className="mb-4 text-base font-semibold text-deep-ocean">
        {t('comment.heading')}
      </h2>

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-sm text-coastal-gray">{t('comment.empty')}</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => {
            const dateStr = new Date(c.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const isOwn = user?.id === c.author_id;
            const isDeleting = deleteId === c.id;

            return (
              <li key={c.id} className="rounded-xl border border-seafoam bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-coastal-gray">
                    <span className="font-semibold text-deep-ocean">
                      {c.author_nickname}
                    </span>
                    <span>·</span>
                    <span>{dateStr}</span>
                  </div>
                  {isOwn && (
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => { void handleDelete(c.id); }}
                      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                    >
                      {t('comment.delete')}
                    </button>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-deep-ocean">
                  {c.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add comment form / login prompt */}
      <div className="mt-6">
        {user ? (
          <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('comment.placeholder')}
              rows={3}
              className="w-full rounded-xl border border-seafoam p-3 text-sm text-deep-ocean placeholder-coastal-gray focus:border-jeju-ocean focus:outline-none"
            />
            {validationError && (
              <p className="mt-1 text-xs text-red-500">{validationError}</p>
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-jeju-ocean px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {t('comment.submit')}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-coastal-gray">
            <Link href={loginHref} className="text-jeju-ocean underline hover:opacity-80">
              {t('error.loginRequired')}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
