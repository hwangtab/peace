import type { MailGroupType } from '@/types/mailContacts';
import { isValidEmail } from './mailboxForms';

export { isValidEmail };

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; reason: string };

export const GROUP_TYPES: MailGroupType[] = ['musician', 'planning', 'sponsor'];
export const GROUP_LABEL: Record<MailGroupType, string> = {
  musician: '뮤지션',
  planning: '기획단',
  sponsor: '후원단체',
};

const LABEL_TO_TYPE: Record<string, MailGroupType> = {
  뮤지션: 'musician',
  기획단: 'planning',
  후원단체: 'sponsor',
  musician: 'musician',
  planning: 'planning',
  sponsor: 'sponsor',
};

export const normalizeGroupType = (v: string): MailGroupType | null =>
  LABEL_TO_TYPE[(v ?? '').trim()] ?? null;

export const normalizeCohorts = (v: string | string[]): string[] => {
  const parts = Array.isArray(v) ? v : (v ?? '').split(',');
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
};

export const validateContactName = (v: string): Ok<string> | Err => {
  const t = (v ?? '').trim();
  if (t.length < 1 || t.length > 200) return { ok: false, reason: '이름은 1~200자여야 합니다.' };
  return { ok: true, value: t };
};

export const validateBroadcastSubject = (v: string): Ok<string> | Err => {
  const t = (v ?? '').trim();
  if (t.length < 1 || t.length > 200) return { ok: false, reason: '제목은 1~200자여야 합니다.' };
  return { ok: true, value: t };
};

export const validateBroadcastBody = (v: string): Ok<string> | Err => {
  const t = (v ?? '').trim();
  if (t.length < 1 || t.length > 50000)
    return { ok: false, reason: '본문은 1~50000자여야 합니다.' };
  return { ok: true, value: t };
};

/** 본문의 {이름} 머지 태그를 수신자 이름으로 치환 */
export const personalizeBody = (template: string, name: string): string =>
  (template ?? '').split('{이름}').join(name);

export interface ParsedContact {
  name: string;
  email: string;
  group_type: MailGroupType;
  cohorts: string[];
}

/** 한 줄 CSV 파싱(따옴표 묶음 지원). 헤더 행(이름/이메일 포함)은 건너뛴다. */
const splitCsvLine = (line: string): string[] => {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
};

export const parseContactsCsv = (text: string): { rows: ParsedContact[]; errors: string[] } => {
  const rows: ParsedContact[] = [];
  const errors: string[] = [];
  const lines = (text ?? '').split(/\r?\n/).filter((l) => l.trim().length > 0);
  let rowNum = 0;
  for (const line of lines) {
    const cols = splitCsvLine(line);
    // 헤더 스킵
    if (cols[0] === '이름' && /이메일|email/i.test(cols[1] ?? '')) continue;
    rowNum += 1;
    const [name, email, group, cohort] = cols;
    const g = normalizeGroupType(group ?? '');
    if (!name || !email || !isValidEmail(email ?? '') || !g) {
      const reason = !name
        ? '이름 누락'
        : !isValidEmail(email ?? '')
          ? `이메일 오류(${email ?? ''})`
          : '그룹 오류';
      errors.push(`${rowNum}행: ${reason} — ${line}`);
      continue;
    }
    rows.push({
      name: name.trim(),
      email: email.trim(),
      group_type: g,
      cohorts: normalizeCohorts(cohort ?? ''),
    });
  }
  return { rows, errors };
};

export interface ManualRecipient {
  name: string;
  email: string;
}

/**
 * 직접 입력 수신자 파싱. 줄바꿈/콤마로 구분하며, 각 항목은
 * `이름 <email@x.com>` 또는 `email@x.com` 형식을 허용한다.
 * 이메일은 소문자로 정규화하고 같은 주소는 한 번만 남긴다.
 */
export const parseManualRecipients = (
  text: string
): { recipients: ManualRecipient[]; errors: string[] } => {
  const recipients: ManualRecipient[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  const tokens = (text ?? '').split(/[\n,]+/);
  for (const raw of tokens) {
    const token = raw.trim();
    if (!token) continue;
    const m = token.match(/^(.*)<([^>]+)>$/);
    const name = (m?.[1] ?? '').replace(/^"|"$/g, '').trim();
    const email = (m?.[2] ?? token).trim().toLowerCase();
    if (!isValidEmail(email)) {
      errors.push(token);
      continue;
    }
    if (seen.has(email)) continue;
    seen.add(email);
    recipients.push({ name, email });
  }
  return { recipients, errors };
};
