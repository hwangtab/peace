import { useState } from 'react';
import type { GetServerSidePropsContext } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import MarkdownView from '@/components/admin/MarkdownView';
import { getAdminSession, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { AdminDocument, AdminMember } from '@/types/cms';

const WHITEPAPER_SLUG = 'camp-2026-whitepaper';
const DEFAULT_TITLE = '제3회 강정 피스앤뮤직캠프 운영 백서';

interface WhitepaperPageProps {
  document: AdminDocument | null;
  member: AdminMember;
  initialError?: string;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  );

export default function AdminWhitepaperPage({
  document: initialDocument,
  member,
  initialError = '',
}: WhitepaperPageProps) {
  const canEdit = member.role !== 'viewer';
  const [document, setDocument] = useState(initialDocument);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialDocument?.title || DEFAULT_TITLE);
  const [body, setBody] = useState(initialDocument?.body_md ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(initialError);

  const startEditing = () => {
    setTitle(document?.title || DEFAULT_TITLE);
    setBody(document?.body_md ?? '');
    setMessage('');
    setError('');
    setIsEditing(true);
  };

  const loadMarkdownFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.md') && file.type !== 'text/markdown') {
      setError('.md 파일만 올릴 수 있습니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setBody(typeof reader.result === 'string' ? reader.result : '');
      setMessage(`"${file.name}" 내용을 불러왔습니다. 저장을 눌러 반영하세요.`);
      setError('');
    };
    reader.onerror = () => setError('파일을 읽지 못했습니다.');
    reader.readAsText(file);
  };

  const save = async () => {
    setIsSaving(true);
    setMessage('');
    setError('');

    const response = await fetch(`/api/admin/documents/${WHITEPAPER_SLUG}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body_md: body }),
    });
    const payload = (await response.json()) as { document?: AdminDocument; error?: string };

    setIsSaving(false);
    if (!response.ok || !payload.document) {
      setError(payload.error || '저장하지 못했습니다.');
      return;
    }

    setDocument(payload.document);
    setIsEditing(false);
    setMessage('저장했습니다.');
  };

  return (
    <AdminLayout title="운영 백서" member={member}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">{document?.title || DEFAULT_TITLE}</h1>
          <p className="mt-2 max-w-2xl text-coastal-gray">
            관리자만 열람할 수 있는 비공개 문서입니다. 본문은 공개 저장소에 저장되지 않습니다.
          </p>
          {document && (
            <p className="mt-1 text-xs text-coastal-gray">
              마지막 수정 {formatDate(document.updated_at)}
              {document.updated_by ? ` · ${document.updated_by}` : ''}
            </p>
          )}
        </div>
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={startEditing}
            className="shrink-0 rounded bg-jeju-ocean px-4 py-2 font-semibold text-white transition hover:bg-deep-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            {document ? '편집' : '백서 등록'}
          </button>
        )}
      </div>

      {message && (
        <p className="mb-4 rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">{message}</p>
      )}
      {error && (
        <p className="mb-4 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      {isEditing ? (
        <section className="space-y-4 rounded border border-deep-ocean/10 bg-white p-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-deep-ocean">제목</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            />
          </label>

          <label className="block rounded border border-dashed border-deep-ocean/20 bg-ocean-sand/30 px-3 py-4">
            <span className="mb-1 block text-sm font-semibold text-deep-ocean">
              마크다운(.md) 파일 불러오기
            </span>
            <input
              type="file"
              accept=".md,text/markdown"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) loadMarkdownFile(file);
                event.target.value = '';
              }}
              className="block w-full text-sm text-coastal-gray file:mr-3 file:rounded file:border-0 file:bg-jeju-ocean file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-deep-ocean"
            />
            <span className="mt-2 block text-xs text-coastal-gray">
              파일을 고르면 아래 본문에 채워집니다. 저장을 눌러야 반영됩니다.
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-deep-ocean">
              본문 (Markdown)
            </span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={24}
              className="w-full rounded border border-deep-ocean/15 px-3 py-2 font-mono text-xs leading-relaxed focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={save}
              disabled={isSaving}
              className="rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
            >
              {isSaving ? '저장 중' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError('');
                setMessage('');
              }}
              disabled={isSaving}
              className="rounded border border-deep-ocean/20 bg-white px-4 py-2 font-semibold text-deep-ocean transition hover:bg-ocean-sand/40 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
            >
              취소
            </button>
          </div>
        </section>
      ) : document && document.body_md ? (
        <section className="rounded border border-deep-ocean/10 bg-white px-5 py-6 sm:px-8">
          <MarkdownView content={document.body_md} />
        </section>
      ) : (
        <section className="rounded border border-deep-ocean/10 bg-white p-8 text-center text-coastal-gray">
          아직 등록된 백서가 없습니다.
          {canEdit
            ? ' 상단의 “백서 등록”으로 .md 파일을 올려 주세요.'
            : ' 편집 권한이 있는 관리자에게 등록을 요청하세요.'}
        </section>
      )}
    </AdminLayout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);

  const supabase = createSupabaseServerClient(context.req, context.res);
  const { data, error } = await supabase
    .from('admin_documents')
    .select('*')
    .eq('slug', WHITEPAPER_SLUG)
    .maybeSingle();

  return {
    props: {
      document: data ?? null,
      member: session.member,
      initialError: error?.message ?? '',
    },
  };
};
