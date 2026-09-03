import { useCallback, useEffect, useRef, useState } from 'react';
import type { GetServerSidePropsContext } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  canEditContent,
  getAdminSession,
  isOwner,
  redactMember,
  redirectToAdminLogin,
} from '@/lib/adminAuth';
import type { AdminMember } from '@/types/cms';
import {
  RESERVATION_STATUS_LABELS,
  TICKET_PRICE,
  type ReservationStatus,
} from '@/lib/eventReservations';

interface ReservationRow {
  id: string;
  name: string;
  phone: string;
  quantity: number;
  status: ReservationStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

interface Summary {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  confirmedQuantity: number;
  confirmedAmount: number;
  pendingQuantity: number;
}

interface PageProps {
  member: AdminMember;
}

const EMPTY_SUMMARY: Summary = {
  total: 0,
  pending: 0,
  confirmed: 0,
  cancelled: 0,
  confirmedQuantity: 0,
  confirmedAmount: 0,
  pendingQuantity: 0,
};

const STATUS_BADGE: Record<ReservationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-300',
  confirmed: 'bg-emerald-100 text-emerald-800 ring-emerald-300',
  cancelled: 'bg-gray-100 text-gray-500 ring-gray-300',
};

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false });

const won = (value: number): string => `${value.toLocaleString('ko-KR')}원`;

/** CSV 셀 이스케이프(따옴표·쉼표·줄바꿈 안전). */
// 수식 주입 방지: 스프레드시트가 수식으로 해석하는 선행 문자는 작은따옴표로 무력화한다.
const csvCell = (value: string | number): string => {
  const raw = String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
};

export default function AdminReservationsPage({ member }: PageProps) {
  const canEdit = canEditContent(member);
  const owner = isOwner(member);

  const [rows, setRows] = useState<ReservationRow[]>([]);
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [noteDraft, setNoteDraft] = useState<{ id: string; value: string } | null>(null);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [purgeBusy, setPurgeBusy] = useState(false);

  const qTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (qTimer.current) clearTimeout(qTimer.current);
    },
    []
  );

  const setBusy = (id: string, on: boolean) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const fetchRows = useCallback(async (nextQ: string, nextStatus: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (nextQ) params.set('q', nextQ);
    if (nextStatus) params.set('status', nextStatus);
    try {
      const res = await fetch(`/api/admin/reservations?${params.toString()}`);
      const json = (await res.json()) as {
        rows?: ReservationRow[];
        summary?: Summary;
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? '예매 목록을 불러오지 못했습니다.');
        return;
      }
      setError('');
      setRows(json.rows ?? []);
      setSummary(json.summary ?? EMPTY_SUMMARY);
      setSelectedIds(new Set());
    } catch {
      setError('예매 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchRows('', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQChange = (value: string) => {
    setQ(value);
    if (qTimer.current) clearTimeout(qTimer.current);
    qTimer.current = setTimeout(() => {
      void fetchRows(value.trim(), status);
    }, 300);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    void fetchRows(q.trim(), value);
  };

  const patch = async (body: unknown): Promise<boolean> => {
    const res = await fetch('/api/admin/reservations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setError(json.error ?? '변경하지 못했습니다.');
      return false;
    }
    setError('');
    return true;
  };

  const changeStatus = async (row: ReservationRow, next: ReservationStatus) => {
    setBusy(row.id, true);
    try {
      if (await patch({ id: row.id, status: next })) {
        setMessage(`${row.name} → ${RESERVATION_STATUS_LABELS[next]}`);
        await fetchRows(q.trim(), status);
      }
    } catch {
      setError('변경하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setBusy(row.id, false);
    }
  };

  const saveNote = async (row: ReservationRow, value: string) => {
    setBusy(row.id, true);
    try {
      if (await patch({ id: row.id, adminNote: value })) {
        setMessage('메모를 저장했습니다.');
        setNoteDraft(null);
        await fetchRows(q.trim(), status);
      }
    } catch {
      setError('메모를 저장하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setBusy(row.id, false);
    }
  };

  const bulkConfirm = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      if (await patch({ ids, status: 'confirmed' })) {
        setMessage(`${ids.length}건을 확정했습니다.`);
        await fetchRows(q.trim(), status);
      }
    } catch {
      setError('일괄 확정에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setBulkBusy(false);
    }
  };

  const purgeAll = async () => {
    setPurgeBusy(true);
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE_ALL' }),
      });
      const json = (await res.json().catch(() => ({}))) as { deleted?: number; error?: string };
      if (!res.ok) {
        setError(json.error ?? '전체 폐기에 실패했습니다.');
        return;
      }
      setError('');
      setMessage(`${json.deleted ?? 0}건을 폐기했습니다.`);
      await fetchRows(q.trim(), status);
    } catch {
      setError('전체 폐기에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setPurgeBusy(false);
      setPurgeOpen(false);
    }
  };

  const downloadCsv = () => {
    const header = ['접수시각', '이름', '연락처', '매수', '금액', '상태', '메모'];
    const lines = [
      header.map(csvCell).join(','),
      ...rows.map((row) =>
        [
          formatDateTime(row.created_at),
          row.name,
          row.phone,
          row.quantity,
          row.quantity * TICKET_PRICE,
          RESERVATION_STATUS_LABELS[row.status],
          row.admin_note ?? '',
        ]
          .map(csvCell)
          .join(',')
      ),
    ];
    // UTF-8 BOM — 엑셀에서 한글이 깨지지 않도록.
    const blob = new Blob([`﻿${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keep-singing-reservations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectableIds = rows.filter((row) => row.status !== 'cancelled').map((row) => row.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));
  const toggleSelectAll = () => setSelectedIds(allSelected ? new Set() : new Set(selectableIds));

  const summaryCards: { label: string; value: string }[] = [
    { label: '접수 건수', value: `${summary.total}건` },
    { label: '확정 건수', value: `${summary.confirmed}건` },
    { label: '확정 매수', value: `${summary.confirmedQuantity}매` },
    { label: '확정 금액', value: won(summary.confirmedAmount) },
    { label: '대기 매수', value: `${summary.pendingQuantity}매 (${summary.pending}건)` },
  ];

  return (
    <AdminLayout title="예매 관리" member={member}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">예매 관리</h1>
            <p className="mt-1 text-sm text-deep-ocean/70">
              Keep Singing for Palestine (2026-09-19) · 1매 {won(TICKET_PRICE)} · 입금 순 확정
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={downloadCsv}
              disabled={rows.length === 0}
              className="rounded-lg border border-deep-ocean/20 bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              CSV 내려받기
            </button>
            {owner && (
              <button
                type="button"
                onClick={() => setPurgeOpen(true)}
                className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700"
              >
                전체 폐기
              </button>
            )}
          </div>
        </div>

        {/* 요약 카드 */}
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-deep-ocean/10 bg-white px-4 py-3"
            >
              <dt className="text-xs text-deep-ocean/60">{card.label}</dt>
              <dd className="mt-1 text-lg font-semibold">{card.value}</dd>
            </div>
          ))}
        </dl>

        {(message || error) && (
          <div
            role="status"
            className={`mt-4 rounded-lg px-4 py-2 text-sm ${
              error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            {error || message}
          </div>
        )}

        {/* 검색·필터·일괄 */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={q}
            onChange={(event) => handleQChange(event.target.value)}
            placeholder="이름 또는 연락처 검색"
            className="w-56 rounded-lg border border-deep-ocean/20 px-3 py-2 text-sm"
          />
          <select
            value={status}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="rounded-lg border border-deep-ocean/20 px-3 py-2 text-sm"
          >
            <option value="">전체 상태</option>
            <option value="pending">입금 대기</option>
            <option value="confirmed">확정</option>
            <option value="cancelled">취소</option>
          </select>
          {canEdit && (
            <button
              type="button"
              onClick={() => void bulkConfirm()}
              disabled={selectedIds.size === 0 || bulkBusy}
              className="rounded-lg bg-jeju-ocean px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              선택 {selectedIds.size}건 확정
            </button>
          )}
          {loading && <span className="text-sm text-deep-ocean/60">불러오는 중…</span>}
        </div>

        {/* 목록 */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-deep-ocean/10 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-deep-ocean/5 text-left text-xs uppercase tracking-wide text-deep-ocean/60">
              <tr>
                {canEdit && (
                  <th scope="col" className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      aria-label="전체 선택"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                <th scope="col" className="px-3 py-3">
                  접수시각
                </th>
                <th scope="col" className="px-3 py-3">
                  이름
                </th>
                <th scope="col" className="px-3 py-3">
                  연락처
                </th>
                <th scope="col" className="px-3 py-3">
                  매수
                </th>
                <th scope="col" className="px-3 py-3">
                  금액
                </th>
                <th scope="col" className="px-3 py-3">
                  상태
                </th>
                <th scope="col" className="px-3 py-3">
                  메모
                </th>
                {canEdit && (
                  <th scope="col" className="px-3 py-3">
                    작업
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-deep-ocean/5">
              {rows.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={canEdit ? 9 : 7}
                    className="px-3 py-10 text-center text-deep-ocean/50"
                  >
                    접수된 예매가 없습니다.
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const busy = busyIds.has(row.id);
                const editing = noteDraft?.id === row.id;
                return (
                  <tr key={row.id} className={busy ? 'opacity-60' : undefined}>
                    {canEdit && (
                      <td className="px-3 py-3 align-top">
                        <input
                          type="checkbox"
                          aria-label={`${row.name} 선택`}
                          disabled={row.status === 'cancelled'}
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleSelect(row.id)}
                        />
                      </td>
                    )}
                    <td className="whitespace-nowrap px-3 py-3 align-top tabular-nums text-deep-ocean/70">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="px-3 py-3 align-top font-medium">{row.name}</td>
                    <td className="whitespace-nowrap px-3 py-3 align-top tabular-nums">
                      {row.phone}
                    </td>
                    <td className="px-3 py-3 align-top tabular-nums">{row.quantity}매</td>
                    <td className="whitespace-nowrap px-3 py-3 align-top tabular-nums">
                      {won(row.quantity * TICKET_PRICE)}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${STATUS_BADGE[row.status]}`}
                      >
                        {RESERVATION_STATUS_LABELS[row.status]}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top">
                      {editing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={noteDraft.value}
                            maxLength={500}
                            onChange={(event) =>
                              setNoteDraft({ id: row.id, value: event.target.value })
                            }
                            className="w-40 rounded border border-deep-ocean/20 px-2 py-1 text-sm"
                          />
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void saveNote(row, noteDraft.value)}
                            className="rounded bg-jeju-ocean px-2 py-1 text-xs text-white disabled:opacity-40"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={() => setNoteDraft(null)}
                            className="rounded border border-deep-ocean/20 px-2 py-1 text-xs"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!canEdit}
                          onClick={() => setNoteDraft({ id: row.id, value: row.admin_note ?? '' })}
                          className="max-w-[16rem] truncate text-left text-deep-ocean/70 hover:underline disabled:hover:no-underline"
                        >
                          {row.admin_note || (canEdit ? '메모 추가' : '—')}
                        </button>
                      )}
                    </td>
                    {canEdit && (
                      <td className="whitespace-nowrap px-3 py-3 align-top">
                        <div className="flex gap-1">
                          {row.status !== 'confirmed' && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void changeStatus(row, 'confirmed')}
                              className="rounded border border-emerald-300 px-2 py-1 text-xs text-emerald-700 disabled:opacity-40"
                            >
                              입금확인
                            </button>
                          )}
                          {row.status !== 'pending' && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void changeStatus(row, 'pending')}
                              className="rounded border border-amber-300 px-2 py-1 text-xs text-amber-700 disabled:opacity-40"
                            >
                              대기로
                            </button>
                          )}
                          {row.status !== 'cancelled' && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void changeStatus(row, 'cancelled')}
                              className="rounded border border-deep-ocean/20 px-2 py-1 text-xs text-deep-ocean/70 disabled:opacity-40"
                            >
                              취소
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        show={purgeOpen}
        message={`예매 접수 ${summary.total}건을 모두 삭제합니다. 되돌릴 수 없습니다. 진행할까요?`}
        confirmLabel="전체 폐기"
        cancelLabel="취소"
        busy={purgeBusy}
        onConfirm={() => void purgeAll()}
        onCancel={() => setPurgeOpen(false)}
      />
    </AdminLayout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);

  // viewer는 읽기 전용으로 접근 가능(리다이렉트 없음).
  return { props: { member: redactMember(session.member) } satisfies PageProps };
};
