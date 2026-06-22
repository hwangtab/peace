import type { MeetingStatus, AgendaStatus } from '@/types/meeting';

const trimmed = (v: string) => (v ?? '').trim();

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; reason: string };

const lenInRange = (v: string, min: number, max: number, reason: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length < min || t.length > max) return { ok: false, reason };
  return { ok: true, value: t };
};

export const validateMeetingTitle = (v: string): Ok<string> | Err =>
  lenInRange(v, 1, 200, '제목은 1~200자여야 합니다.');

export const validateMeetingDate = (v: string): Ok<string | null> | Err => {
  const t = trimmed(v);
  if (t.length === 0) return { ok: true, value: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    return { ok: false, reason: '날짜 형식은 YYYY-MM-DD여야 합니다.' };
  }
  const parts = t.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return { ok: false, reason: '존재하지 않는 날짜입니다.' };
  }
  return { ok: true, value: t };
};

export const validateMeetingTime = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length > 20) return { ok: false, reason: '시간은 20자 이하여야 합니다.' };
  return { ok: true, value: t };
};

export const validateLocation = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length > 200) return { ok: false, reason: '장소는 200자 이하여야 합니다.' };
  return { ok: true, value: t };
};

export const validateMinutes = (v: string): Ok<string> | Err => {
  const s = v ?? '';
  if (s.length > 100000) return { ok: false, reason: '회의록은 100000자 이하여야 합니다.' };
  return { ok: true, value: s };
};

export const validateAgendaTitle = (v: string): Ok<string> | Err =>
  lenInRange(v, 1, 200, '안건 제목은 1~200자여야 합니다.');

export const validateAgendaContent = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length > 10000) return { ok: false, reason: '안건 내용은 10000자 이하여야 합니다.' };
  return { ok: true, value: t };
};

export const validateAttendeeName = (v: string): Ok<string> | Err =>
  lenInRange(v, 1, 50, '참석자 이름은 1~50자여야 합니다.');

export const validateAttendeeNote = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length > 200) return { ok: false, reason: '비고는 200자 이하여야 합니다.' };
  return { ok: true, value: t };
};

export const MEETING_STATUSES: MeetingStatus[] = ['scheduled', 'completed'];
export const AGENDA_STATUSES: AgendaStatus[] = ['proposed', 'discussed', 'resolved'];

export const isMeetingStatus = (v: string): v is MeetingStatus =>
  (MEETING_STATUSES as string[]).includes(v);
export const isAgendaStatus = (v: string): v is AgendaStatus =>
  (AGENDA_STATUSES as string[]).includes(v);

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  scheduled: '예정',
  completed: '완료',
};
export const AGENDA_STATUS_LABELS: Record<AgendaStatus, string> = {
  proposed: '제안',
  discussed: '논의',
  resolved: '의결',
};
