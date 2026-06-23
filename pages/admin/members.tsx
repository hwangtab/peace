import { useState } from 'react';
import type { GetServerSidePropsContext } from 'next';
import classNames from 'classnames';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminSession, isOwner, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { loadRegularMembers, type RegularUser } from '@/lib/adminMembers';
import type { AdminMember, AdminRole } from '@/types/cms';

interface AdminMembersPageProps {
  members: AdminMember[];
  users: RegularUser[];
  member: AdminMember;
  initialError?: string;
}

const ROLE_OPTIONS: { label: string; value: AdminRole }[] = [
  { label: '소유자 (owner)', value: 'owner' },
  { label: '편집자 (editor)', value: 'editor' },
  { label: '열람자 (viewer)', value: 'viewer' },
];

const roleLabel = (role: AdminRole) =>
  ({ owner: '소유자', editor: '편집자', viewer: '열람자' })[role];

const roleClass = (role: AdminRole) =>
  classNames(
    'rounded px-2 py-1 text-xs font-semibold',
    role === 'owner' && 'bg-deep-ocean/10 text-deep-ocean',
    role === 'editor' && 'bg-jeju-ocean/10 text-jeju-ocean',
    role === 'viewer' && 'bg-coastal-gray/10 text-coastal-gray'
  );

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  );

export default function AdminMembersPage({
  members: initialMembers,
  users: initialUsers,
  member,
  initialError = '',
}: AdminMembersPageProps) {
  const [members, setMembers] = useState(initialMembers);
  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<AdminRole>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(initialError);

  const refresh = async () => {
    const response = await fetch('/api/admin/members');
    if (!response.ok) return;
    const payload = (await response.json()) as { members: AdminMember[]; users?: RegularUser[] };
    setMembers(payload.members);
    if (payload.users) setUsers(payload.users);
  };

  const promote = async (user: RegularUser, promoteRole: AdminRole) => {
    setBusyId(user.id);
    setMessage('');
    setError('');

    const response = await fetch('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        display_name: user.nickname || null,
        role: promoteRole,
        user_id: user.id,
      }),
    });
    const payload = (await response.json()) as { member?: AdminMember; error?: string };

    setBusyId(null);
    if (!response.ok || !payload.member) {
      setError(payload.error || '등업하지 못했습니다.');
      return;
    }

    setMessage(`${user.nickname || user.email} 님을 관리자로 등업했습니다.`);
    await refresh();
  };

  const addMember = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    const response = await fetch('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, display_name: displayName, role }),
    });
    const payload = (await response.json()) as { member?: AdminMember; error?: string };

    setIsSubmitting(false);
    if (!response.ok || !payload.member) {
      setError(payload.error || '멤버를 추가하지 못했습니다.');
      return;
    }

    setEmail('');
    setDisplayName('');
    setRole('editor');
    setMessage('멤버를 추가했습니다.');
    await refresh();
  };

  const patchMember = async (id: string, body: { role?: AdminRole; active?: boolean }) => {
    setBusyId(id);
    setMessage('');
    setError('');

    const response = await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    });
    const payload = (await response.json()) as { member?: AdminMember; error?: string };

    setBusyId(null);
    if (!response.ok || !payload.member) {
      setError(payload.error || '멤버를 수정하지 못했습니다.');
      return;
    }

    setMessage('멤버 정보를 수정했습니다.');
    await refresh();
  };

  return (
    <AdminLayout title="멤버 관리" member={member}>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">멤버 관리</h1>
        <p className="mt-2 max-w-2xl text-coastal-gray">
          관리자 계정을 추가하고 역할을 정합니다. 소유자는 모든 권한과 멤버 관리, 편집자는 콘텐츠
          편집, 열람자는 조회만 가능합니다.
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

      <section className="mb-8 rounded border border-deep-ocean/10 bg-white">
        <div className="border-b border-deep-ocean/10 px-4 py-3">
          <h2 className="font-semibold">새 멤버 추가</h2>
        </div>
        <form onSubmit={addMember} className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-deep-ocean">이메일 *</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-deep-ocean">이름</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="홍길동"
              className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-deep-ocean">역할</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as AdminRole)}
              className="w-full rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
            >
              {isSubmitting ? '추가 중' : '멤버 추가'}
            </button>
          </div>
        </form>
        <p className="px-4 pb-4 text-xs text-coastal-gray">
          추가한 이메일로 관리자 로그인 링크를 받으면 접근할 수 있습니다.
        </p>
      </section>

      <section className="rounded border border-deep-ocean/10 bg-white">
        <div className="border-b border-deep-ocean/10 px-4 py-3">
          <h2 className="font-semibold">멤버 {members.length}명</h2>
        </div>
        {members.length === 0 ? (
          <p className="p-6 text-coastal-gray">등록된 멤버가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-deep-ocean/10">
            {members.map((row) => {
              const isSelf = row.id === member.id;
              const busy = busyId === row.id;
              return (
                <li
                  key={row.id}
                  className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{row.display_name || row.email}</span>
                      <span className={roleClass(row.role)}>{roleLabel(row.role)}</span>
                      {!row.active && (
                        <span className="rounded bg-sunset-coral/10 px-2 py-1 text-xs font-semibold text-sunset-coral">
                          비활성
                        </span>
                      )}
                      {isSelf && (
                        <span className="rounded bg-ocean-sand/60 px-2 py-1 text-xs font-semibold text-deep-ocean">
                          나
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-coastal-gray">
                      {row.email} · 등록 {formatDate(row.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={row.role}
                      disabled={busy}
                      onChange={(event) => {
                        const nextRole = event.target.value as AdminRole;
                        if (nextRole === row.role) return;
                        if (
                          isSelf &&
                          !window.confirm(
                            '본인 계정의 권한을 변경하면 관리 권한을 잃을 수 있습니다. 계속할까요?'
                          )
                        ) {
                          return;
                        }
                        void patchMember(row.id, { role: nextRole });
                      }}
                      className="rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20 disabled:opacity-60"
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (
                          isSelf &&
                          row.active &&
                          !window.confirm(
                            '본인 계정을 비활성화하면 관리자 접근 권한을 잃습니다. 계속할까요?'
                          )
                        ) {
                          return;
                        }
                        void patchMember(row.id, { active: !row.active });
                      }}
                      className={classNames(
                        'rounded border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2',
                        row.active
                          ? 'border-sunset-coral/50 bg-white text-sunset-coral hover:bg-sunset-coral/10 focus-visible:ring-sunset-coral'
                          : 'border-jeju-ocean/40 bg-white text-jeju-ocean hover:bg-jeju-ocean/10 focus-visible:ring-jeju-ocean'
                      )}
                    >
                      {row.active ? '비활성화' : '활성화'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded border border-deep-ocean/10 bg-white">
        <div className="border-b border-deep-ocean/10 px-4 py-3">
          <h2 className="font-semibold">일반 회원 {users.length}명</h2>
          <p className="mt-1 text-xs text-coastal-gray">
            가입한 회원을 골라 바로 관리자로 등업할 수 있습니다.
          </p>
        </div>
        {users.length === 0 ? (
          <p className="p-6 text-coastal-gray">가입한 회원이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-deep-ocean/10">
            {users.map((user) => (
              <RegularUserRow
                key={user.id}
                user={user}
                busy={busyId === user.id}
                onPromote={(promoteRole) => void promote(user, promoteRole)}
              />
            ))}
          </ul>
        )}
      </section>
    </AdminLayout>
  );
}

function RegularUserRow({
  user,
  busy,
  onPromote,
}: {
  user: RegularUser;
  busy: boolean;
  onPromote: (role: AdminRole) => void;
}) {
  const [promoteRole, setPromoteRole] = useState<AdminRole>('editor');
  return (
    <li className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{user.nickname || '(닉네임 없음)'}</span>
          {user.isAdmin && (
            <span className="rounded bg-jeju-ocean/10 px-2 py-1 text-xs font-semibold text-jeju-ocean">
              관리자
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-coastal-gray">
          {user.email} · 가입 {formatDate(user.created_at)}
        </p>
      </div>
      {user.isAdmin ? (
        <span className="text-sm text-coastal-gray">이미 관리자입니다</span>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={promoteRole}
            disabled={busy}
            onChange={(event) => setPromoteRole(event.target.value as AdminRole)}
            className="rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20 disabled:opacity-60"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy}
            onClick={() => onPromote(promoteRole)}
            className="rounded bg-jeju-ocean px-3 py-2 text-sm font-semibold text-white transition hover:bg-deep-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            {busy ? '처리 중' : '관리자로 등업'}
          </button>
        </div>
      )}
    </li>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);
  if (!isOwner(session.member)) {
    return { redirect: { destination: '/admin', permanent: false } };
  }

  const supabase = createSupabaseServerClient(context.req, context.res);
  const [{ data, error }, users] = await Promise.all([
    supabase.from('admin_members').select('*').order('created_at', { ascending: true }),
    loadRegularMembers(),
  ]);

  return {
    props: {
      members: data ?? [],
      users,
      member: session.member,
      initialError: error?.message ?? '',
    },
  };
};
