import { useState } from 'react';
import type { GetServerSidePropsContext } from 'next';
import classNames from 'classnames';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminSession, canEditContent, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { formatDateTime } from '@/utils/format';
import type { AdminMember, CmsChangeAction, CmsChangeLog } from '@/types/cms';

interface AdminHistoryPageProps {
  logs: CmsChangeLog[];
  member: AdminMember;
  initialError?: string;
}

const collectionLabel = (collection: CmsChangeLog['collection']) =>
  ({
    content: '문구',
    videos: '비디오',
    gallery: '갤러리',
    press: '언론보도',
  })[collection];

const actionLabel = (action: CmsChangeAction) =>
  ({
    create: '추가',
    update: '수정',
    hide: '내림',
    restore: '복구',
  })[action];

const actionClass = (action: CmsChangeAction) =>
  classNames(
    'rounded px-2 py-1 text-xs font-semibold',
    action === 'create' && 'bg-jeju-ocean/10 text-jeju-ocean',
    action === 'update' && 'bg-golden-sun/20 text-deep-ocean',
    action === 'hide' && 'bg-sunset-coral/10 text-sunset-coral',
    action === 'restore' && 'bg-deep-ocean/10 text-deep-ocean'
  );

const JsonBlock = ({ title, value }: { title: string; value: Record<string, unknown> | null }) => (
  <details className="rounded border border-deep-ocean/10 bg-ocean-sand/30">
    <summary className="cursor-pointer px-3 py-2 text-sm font-semibold">{title}</summary>
    <pre className="max-h-80 overflow-auto border-t border-deep-ocean/10 p-3 text-xs leading-relaxed">
      {value ? JSON.stringify(value, null, 2) : 'null'}
    </pre>
  </details>
);

export default function AdminHistoryPage({
  logs: initialLogs,
  member,
  initialError = '',
}: AdminHistoryPageProps) {
  const [logs, setLogs] = useState(initialLogs);
  const canEdit = member.role !== 'viewer';
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(initialError);

  const refreshLogs = async () => {
    const response = await fetch('/api/admin/history');
    if (!response.ok) return;
    const payload = (await response.json()) as { logs: CmsChangeLog[] };
    setLogs(payload.logs);
  };

  const restoreLog = async (log: CmsChangeLog) => {
    // 복구는 현재 공개 데이터를 과거 값으로 덮어쓰는 파괴적 작업이므로 확인을 받는다.
    if (!window.confirm('이 시점으로 복구하면 현재 내용을 과거 값으로 덮어씁니다. 진행할까요?'))
      return;
    setIsRestoring(log.id);
    setMessage('');
    setError('');

    const response = await fetch('/api/admin/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log_id: log.id }),
    });
    const payload = (await response.json()) as { error?: string; changeLogError?: string | null };

    setIsRestoring(null);
    if (!response.ok) {
      setError(payload.error || '복구하지 못했습니다.');
      return;
    }

    setMessage(
      payload.changeLogError
        ? `복구했지만 이력 기록 실패: ${payload.changeLogError}`
        : '복구했습니다.'
    );
    await refreshLogs();
  };

  return (
    <AdminLayout title="변경 이력" member={member}>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">변경 이력</h1>
        <p className="mt-2 max-w-2xl text-coastal-gray">
          웹사이트 문구와 아카이브 항목의 저장, 내리기, 복구 기록을 확인합니다.
        </p>
      </div>

      {message && (
        <p className="mb-4 rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">{message}</p>
      )}
      {error && (
        <p className="mb-4 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      <section className="rounded border border-deep-ocean/10 bg-white">
        <div className="border-b border-deep-ocean/10 px-4 py-3">
          <h2 className="font-semibold">최근 변경</h2>
        </div>
        {logs.length === 0 ? (
          <p className="p-6 text-coastal-gray">아직 변경 이력이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-deep-ocean/10">
            {logs.map((log) => {
              const canRestore = canEdit && Boolean(log.before_data);
              return (
                <li key={log.id} className="space-y-4 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={actionClass(log.action)}>{actionLabel(log.action)}</span>
                        <span className="font-semibold">
                          {collectionLabel(log.collection)}
                          {log.primary_label ? ` · ${log.primary_label}` : ''}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-coastal-gray">
                        {formatDateTime(log.created_at)} · {log.admin_email}
                        {log.locale ? ` · ${log.locale}` : ''}
                        {log.public_id ? ` · #${log.public_id}` : ''}
                      </p>
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => void restoreLog(log)}
                        disabled={!canRestore || isRestoring === log.id}
                        className="rounded border border-deep-ocean/20 bg-white px-3 py-2 text-sm font-semibold text-deep-ocean transition hover:border-jeju-ocean hover:text-jeju-ocean disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
                      >
                        {isRestoring === log.id ? '복구 중' : '이전 값으로 복구'}
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <JsonBlock title="변경 전" value={log.before_data} />
                    <JsonBlock title="변경 후" value={log.after_data} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AdminLayout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);
  if (!canEditContent(session.member)) {
    return { redirect: { destination: '/admin', permanent: false } };
  }

  const supabase = createSupabaseServerClient(context.req, context.res);
  const { data, error } = await supabase
    .from('cms_change_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(80);

  return {
    props: {
      logs: data ?? [],
      member: session.member,
      initialError: error?.message ?? '',
    },
  };
};
