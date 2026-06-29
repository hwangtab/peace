import { useState } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/admin/AdminLayout';
// SEO/LCP를 위해 ssr:true 유지. 뷰어 섹션에서만 렌더되므로 번들 분리 효과 있음.
const MarkdownView = dynamic(() => import('@/components/admin/MarkdownView'), {
  ssr: true,
  loading: () => (
    <div className="space-y-3 motion-safe:animate-pulse">
      <div className="h-4 rounded bg-deep-ocean/10 w-3/4" />
      <div className="h-4 rounded bg-deep-ocean/10 w-full" />
      <div className="h-4 rounded bg-deep-ocean/10 w-5/6" />
    </div>
  ),
});
import { getAdminSession, canEditContent, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import {
  CAMP_EDITION_YEARS,
  campEditionLabel,
  whitepaperSlug,
  parseWhitepaperYear,
} from '@/lib/campEditions';
import { formatDateTime } from '@/utils/format';
import type { AdminDocument, AdminMember } from '@/types/cms';

interface WhitepaperPageProps {
  years: number[];
  selectedYear: number;
  document: AdminDocument | null;
  member: AdminMember;
  initialError?: string;
}

function WhitepaperEditor({
  years,
  selectedYear,
  document: initialDocument,
  member,
  initialError = '',
}: WhitepaperPageProps) {
  const router = useRouter();
  const canEdit = member.role !== 'viewer';
  const defaultTitle = `${campEditionLabel(selectedYear)} 운영 백서`;
  const [document, setDocument] = useState(initialDocument);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialDocument?.title || defaultTitle);
  const [body, setBody] = useState(initialDocument?.body_md ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(initialError);

  const startEditing = () => {
    setTitle(document?.title || defaultTitle);
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

    const response = await fetch(`/api/admin/documents/${whitepaperSlug(selectedYear)}`, {
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
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="wp-year" className="text-sm font-semibold text-deep-ocean">
          회차
        </label>
        <select
          id="wp-year"
          value={selectedYear}
          onChange={(e) => {
            void router.push(`/admin/whitepaper?year=${e.target.value}`);
          }}
          className="rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {campEditionLabel(year)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {/* 회차는 위 드롭다운, 정식 제목은 본문(md)에 있으므로 페이지 제목은 일반 명칭만. */}
          <h1 className="font-display text-3xl font-bold">운영 백서</h1>
          <p className="mt-2 max-w-2xl text-coastal-gray">
            관리자만 열람할 수 있는 비공개 문서입니다. 본문은 공개 저장소에 저장되지 않습니다.
          </p>
          {document && (
            <p className="mt-1 text-xs text-coastal-gray">
              마지막 수정 {formatDateTime(document.updated_at)}
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
        <section className="rounded border border-deep-ocean/10 bg-white p-8 text-center text-balance text-coastal-gray">
          {campEditionLabel(selectedYear)} 백서가 아직 없습니다.
          {canEdit ? " '편집'으로 작성하세요." : ' 편집 권한이 있는 관리자에게 등록을 요청하세요.'}
        </section>
      )}
    </AdminLayout>
  );
}

export default function AdminWhitepaperPage(props: WhitepaperPageProps) {
  return <WhitepaperEditor key={props.selectedYear} {...props} />;
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);
  if (!canEditContent(session.member)) {
    return { redirect: { destination: '/admin', permanent: false } };
  }

  const supabase = createSupabaseServerClient(context.req, context.res);
  // 존재하는 모든 회차 백서(camp-*-whitepaper)를 한 번에 로드.
  const { data, error } = await supabase
    .from('admin_documents')
    .select('*')
    .like('slug', 'camp-%-whitepaper');

  const docs = (data as AdminDocument[] | null) ?? [];
  const docByYear: Record<number, AdminDocument> = {};
  for (const d of docs) {
    const y = parseWhitepaperYear(d.slug);
    if (y != null) docByYear[y] = d;
  }
  // 회차 목록 = 상수 회차 ∪ 백서가 존재하는 연도, 내림차순.
  const years = Array.from(
    new Set<number>([...CAMP_EDITION_YEARS, ...Object.keys(docByYear).map(Number)])
  ).sort((a, b) => b - a);

  const requestedYear =
    typeof context.query.year === 'string' && /^\d{4}$/.test(context.query.year)
      ? Number(context.query.year)
      : null;
  const selectedYear = requestedYear ?? years[0] ?? 2026;

  return {
    props: {
      years,
      selectedYear,
      document: docByYear[selectedYear] ?? null,
      member: session.member,
      initialError: error?.message ?? '',
    },
  };
};
