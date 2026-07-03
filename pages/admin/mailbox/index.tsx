import { useState } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getAdminSession,
  canEditContent,
  redirectToAdminLogin,
  redactMember,
} from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { replySubject } from '@/lib/mailboxForms';
import type { MailboxMessage } from '@/types/mailbox';
import type { AdminMember } from '@/types/cms';
import ContactsPanel from '@/components/admin/mailbox/ContactsPanel';
import ComposePanel from '@/components/admin/mailbox/ComposePanel';

interface AdminMailboxPageProps {
  messages: MailboxMessage[];
  member: AdminMember;
  initialError?: string;
}

const fmt = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Seoul',
});
const formatTs = (iso: string) => fmt.format(new Date(iso));

export default function AdminMailboxPage({
  messages,
  member,
  initialError = '',
}: AdminMailboxPageProps) {
  const router = useRouter();
  const canEdit = canEditContent(member);
  const [tab, setTab] = useState<'inbox' | 'compose' | 'contacts'>('inbox');
  const inbound = messages.filter((m) => m.direction === 'inbound');
  const [selectedId, setSelectedId] = useState<string | null>(inbound[0]?.id ?? null);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const selected = messages.find((m) => m.id === selectedId && m.direction === 'inbound') ?? null;
  const replies = selected
    ? messages.filter((m) => m.direction === 'outbound' && m.reply_to_id === selected.id)
    : [];

  const refresh = () => router.replace(router.asPath);

  const openMessage = async (m: MailboxMessage) => {
    setSelectedId(m.id);
    setError('');
    setMessage('');
    setReplyText('');
    if (!m.is_read && canEdit) {
      try {
        await fetch(`/api/admin/mailbox/${m.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_read: true }),
        });
        refresh();
      } catch {
        // 읽음 표시 실패는 무시
      }
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError('');
    setMessage('');
    if (!replyText.trim()) {
      setError('답장 내용을 입력해 주세요.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/admin/mailbox/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply_to_id: selected.id,
          to: selected.from_email,
          subject: replySubject(selected.subject),
          text: replyText,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.error || '답장 발송에 실패했습니다.');
        setBusy(false);
        return;
      }
      setReplyText('');
      // recorded=false: 메일은 발송됐지만 메일함 기록 저장만 실패한 경우.
      // '실패'로 보이면 관리자가 재전송해 수신자에게 중복 발송되므로, 발송됨을 분명히 알린다.
      setMessage(
        payload.recorded === false
          ? '답장은 발송되었습니다. 다만 메일함 기록 저장에 실패해 보낸 목록에 남지 않을 수 있습니다. 다시 보내지 마세요.'
          : '답장을 보냈습니다.'
      );
      setBusy(false);
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="메일함" member={member}>
      {/* 탭 버튼 줄 */}
      <div className="mb-4 flex gap-2 border-b border-deep-ocean/10">
        {(
          [
            ['inbox', '받은 메일함'],
            ['compose', '보내기'],
            ['contacts', '연락처'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === key
                ? 'border-jeju-ocean text-jeju-ocean'
                : 'border-transparent text-coastal-gray hover:text-deep-ocean'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'compose' && <ComposePanel canEdit={canEdit} />}
      {tab === 'contacts' && <ContactsPanel canEdit={canEdit} />}

      {tab === 'inbox' && (
        <>
          {(initialError || error) && (
            <p className="mb-4 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
              {initialError || error}
            </p>
          )}
          {message && (
            <p className="mb-4 rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">
              {message}
            </p>
          )}

          <p className="mb-4 text-sm text-deep-ocean/70">
            admin@peaceandmusic.net 수신함 · 받은 메일 {inbound.length}건
          </p>

          {inbound.length === 0 ? (
            <p className="rounded border border-deep-ocean/10 bg-white px-4 py-10 text-center text-sm text-balance text-deep-ocean/60">
              받은 메일이 없습니다.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
              {/* 목록 */}
              <ul className="space-y-1">
                {inbound.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => openMessage(m)}
                      className={
                        'w-full rounded border px-3 py-2 text-left transition ' +
                        (m.id === selectedId
                          ? 'border-jeju-ocean/50 bg-jeju-ocean/5'
                          : 'border-deep-ocean/10 bg-white hover:border-jeju-ocean/30')
                      }
                    >
                      <span
                        className={
                          'block truncate text-sm ' +
                          (m.is_read ? 'text-deep-ocean/70' : 'font-bold text-deep-ocean')
                        }
                      >
                        {m.subject || '(제목 없음)'}
                      </span>
                      <span className="block truncate text-xs text-deep-ocean/50">
                        {m.from_name || m.from_email} · {formatTs(m.created_at)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* 상세 + 답장 */}
              <div>
                {selected ? (
                  <article className="rounded border border-deep-ocean/10 bg-white p-5">
                    <h2 className="font-display text-lg font-bold text-deep-ocean">
                      {selected.subject || '(제목 없음)'}
                    </h2>
                    <p className="mt-1 break-all text-sm text-deep-ocean/60">
                      보낸사람:{' '}
                      {selected.from_name
                        ? `${selected.from_name} <${selected.from_email}>`
                        : selected.from_email}
                    </p>
                    <p className="text-xs text-deep-ocean/50">{formatTs(selected.created_at)}</p>

                    <div className="mt-4 whitespace-pre-wrap border-t border-deep-ocean/10 pt-4 text-sm leading-relaxed text-deep-ocean/90">
                      {selected.text_body.trim()
                        ? selected.text_body
                        : selected.html_body.trim()
                          ? '(HTML 전용 메일입니다. 안전을 위해 본문은 표시하지 않습니다.)'
                          : '(본문 없음)'}
                    </div>

                    {replies.length > 0 && (
                      <div className="mt-5 space-y-3 border-t border-deep-ocean/10 pt-4">
                        <p className="text-xs font-semibold text-deep-ocean/60">보낸 답장</p>
                        {replies.map((r) => (
                          <div key={r.id} className="rounded bg-ocean-sand/40 px-3 py-2">
                            <p className="text-xs text-deep-ocean/50">
                              {formatTs(r.created_at)} · {r.created_by}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-deep-ocean/90">
                              {r.text_body}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {canEdit ? (
                      <form
                        onSubmit={sendReply}
                        className="mt-5 border-t border-deep-ocean/10 pt-4"
                      >
                        <label
                          htmlFor="mailbox-reply"
                          className="mb-1 block text-sm font-semibold text-deep-ocean"
                        >
                          답장 ({replySubject(selected.subject)})
                        </label>
                        <textarea
                          id="mailbox-reply"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={5}
                          placeholder={`${selected.from_email} 에게 보낼 답장`}
                          className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
                        />
                        <button
                          type="submit"
                          disabled={busy}
                          className="mt-2 rounded bg-deep-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {busy ? '보내는 중…' : '답장 보내기'}
                        </button>
                      </form>
                    ) : (
                      <p className="mt-5 border-t border-deep-ocean/10 pt-4 text-sm text-deep-ocean/50">
                        답장은 편집 권한이 있는 관리자만 보낼 수 있습니다.
                      </p>
                    )}
                  </article>
                ) : (
                  <p className="rounded border border-deep-ocean/10 bg-white px-4 py-10 text-center text-sm text-balance text-deep-ocean/60">
                    왼쪽에서 메일을 선택하세요.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
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
  // 받은 메일(inbound)과 그에 대한 답장(reply_to_id 있는 outbound)만 가져온다.
  // 단체 발송 outbound(campaign, reply_to_id 없음)는 수신자당 1행씩 대량 생성되므로,
  // 제외하지 않으면 최신 200건 창을 채워 받은 메일·과거 답장을 가린다.
  const { data, error } = await supabase
    .from('mailbox_messages')
    .select('*')
    .or('direction.eq.inbound,reply_to_id.not.is.null')
    .order('created_at', { ascending: false })
    .limit(200);

  // html_body 원본 HTML이 __NEXT_DATA__에 직렬화되지 않도록 플레이스홀더로 마스킹한다.
  // 렌더 로직은 html_body.trim() 존재 여부만 확인하므로 동작은 그대로 보존된다.
  const messages = (data ?? []).map((row) => ({
    ...row,
    html_body: row.html_body ? '__HTML__' : '',
  }));

  return {
    props: {
      messages,
      member: redactMember(session.member),
      initialError: error?.message ?? '',
    },
  };
};
