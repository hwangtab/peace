import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import {
  EVENT_SLUG,
  RESERVATION_STATUSES,
  TICKET_PRICE,
  type ReservationStatus,
} from '@/lib/eventReservations';

const sanitizeQ = (q: string): string =>
  q
    .replace(/[%,()*\\]/g, ' ')
    .trim()
    .slice(0, 100);

const statusEnum = z.enum(['pending', 'confirmed', 'cancelled']);

const patchSingleStatusSchema = z.object({ id: z.string().uuid(), status: statusEnum });
const patchBulkStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(200),
  status: statusEnum,
});
const patchNoteSchema = z.object({
  id: z.string().uuid(),
  adminNote: z.string().max(500),
});
const deleteBodySchema = z.object({ confirm: z.literal('DELETE_ALL') });

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

export interface ReservationSummary {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  confirmedQuantity: number;
  confirmedAmount: number;
  pendingQuantity: number;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseServerClient(req, res);

  // ── GET: 목록 + 요약 ───────────────────────────────────────────────────────
  if (req.method === 'GET') {
    if (!(await requireAdminRole(req, res, 'viewer'))) return;

    const q = sanitizeQ(typeof req.query.q === 'string' ? req.query.q : '');
    const rawStatus = typeof req.query.status === 'string' ? req.query.status : '';
    const status = (RESERVATION_STATUSES as readonly string[]).includes(rawStatus) ? rawStatus : '';

    // 입금 순 확인이 목적이므로 접수시각 오름차순 고정.
    let query = supabase
      .from('event_reservations')
      .select('id, name, phone, quantity, status, admin_note, created_at, updated_at')
      .eq('event_slug', EVENT_SLUG)
      .order('created_at', { ascending: true });

    if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      console.error('[admin/reservations] GET failed:', error.message);
      res.status(500).json({ error: 'internal_error' });
      return;
    }

    // 요약은 필터와 무관하게 공연 전체 기준으로 계산한다(현황판 성격).
    const summaryResult = await supabase
      .from('event_reservations')
      .select('status, quantity')
      .eq('event_slug', EVENT_SLUG);
    if (summaryResult.error) {
      console.error('[admin/reservations] GET summary failed:', summaryResult.error.message);
      res.status(500).json({ error: 'internal_error' });
      return;
    }

    const summary: ReservationSummary = {
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      confirmedQuantity: 0,
      confirmedAmount: 0,
      pendingQuantity: 0,
    };
    for (const row of (summaryResult.data ?? []) as { status: string; quantity: number }[]) {
      summary.total += 1;
      if (row.status === 'confirmed') {
        summary.confirmed += 1;
        summary.confirmedQuantity += row.quantity;
      } else if (row.status === 'pending') {
        summary.pending += 1;
        summary.pendingQuantity += row.quantity;
      } else if (row.status === 'cancelled') {
        summary.cancelled += 1;
      }
    }
    summary.confirmedAmount = summary.confirmedQuantity * TICKET_PRICE;

    res.status(200).json({ rows: (data ?? []) as ReservationRow[], summary });
    return;
  }

  // ── PATCH: 상태(단건·일괄) / 메모 ─────────────────────────────────────────
  if (req.method === 'PATCH') {
    if (!(await requireAdminRole(req, res, 'editor'))) return;
    try {
      const body = req.body as unknown;

      const bulk = patchBulkStatusSchema.safeParse(body);
      if (bulk.success) {
        const { data, error } = await supabase
          .from('event_reservations')
          .update({ status: bulk.data.status })
          .eq('event_slug', EVENT_SLUG)
          .in('id', bulk.data.ids)
          .select('id, status');
        if (error) {
          console.error('[admin/reservations] PATCH bulk failed:', error.message);
          // 취소 → 대기/확정 복원 시 활성 유니크 인덱스와 충돌할 수 있다.
          if (error.code === '23505') {
            res.status(409).json({ error: '같은 연락처의 활성 예매가 이미 있습니다.' });
            return;
          }
          res.status(500).json({ error: 'internal_error' });
          return;
        }
        const updated = data ?? [];
        const updatedIds = new Set(updated.map((row) => row.id as string));
        res.status(200).json({
          updated: updated.length,
          requested: bulk.data.ids.length,
          missing: bulk.data.ids.filter((id) => !updatedIds.has(id)),
        });
        return;
      }

      const note = patchNoteSchema.safeParse(body);
      if (note.success) {
        const trimmed = note.data.adminNote.trim();
        const { data, error } = await supabase
          .from('event_reservations')
          .update({ admin_note: trimmed === '' ? null : trimmed })
          .eq('event_slug', EVENT_SLUG)
          .eq('id', note.data.id)
          .select('id, admin_note')
          .maybeSingle();
        if (error) {
          console.error('[admin/reservations] PATCH note failed:', error.message);
          res.status(500).json({ error: 'internal_error' });
          return;
        }
        if (!data) {
          res.status(404).json({ error: '예매 건을 찾을 수 없습니다.' });
          return;
        }
        res.status(200).json({ row: data });
        return;
      }

      const single = patchSingleStatusSchema.parse(body);
      const { data, error } = await supabase
        .from('event_reservations')
        .update({ status: single.status })
        .eq('event_slug', EVENT_SLUG)
        .eq('id', single.id)
        .select('id, status')
        .maybeSingle();
      if (error) {
        if (error.code === '23505') {
          res.status(409).json({ error: '같은 연락처의 활성 예매가 이미 있습니다.' });
          return;
        }
        console.error('[admin/reservations] PATCH single failed:', error.message);
        res.status(500).json({ error: 'internal_error' });
        return;
      }
      if (!data) {
        res.status(404).json({ error: '예매 건을 찾을 수 없습니다.' });
        return;
      }
      res.status(200).json({ row: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  // ── DELETE: 해당 공연 전체 폐기(owner) ────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!(await requireAdminRole(req, res, 'owner'))) return;

    const parsed = deleteBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "확인 문구(confirm: 'DELETE_ALL')가 필요합니다." });
      return;
    }

    const { data, error } = await supabase
      .from('event_reservations')
      .delete()
      .eq('event_slug', EVENT_SLUG)
      .select('id');
    if (error) {
      console.error('[admin/reservations] DELETE failed:', error.message);
      res.status(500).json({ error: 'internal_error' });
      return;
    }
    res.status(200).json({ ok: true, deleted: (data ?? []).length });
    return;
  }

  res.setHeader('Allow', 'GET, PATCH, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
