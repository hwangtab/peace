# 관리자 메일함 그룹 단체 발송 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기획단이 회차별로 뮤지션/기획단/후원단체를 골라 개인화된 단체 메일을 보낼 수 있게 한다.

**Architecture:** 새 `mail_contacts` 테이블에 수신자 명단(이름·이메일·그룹·회차)을 두고, 기존 Resend `sendEmail()` 헬퍼로 수신자별 개별 발송한다. `/admin/mailbox`를 탭 3개(받은메일/보내기/연락처)로 확장하고, 발송 결과는 `mailbox_messages`에 `campaign_id`로 묶어 수신자별 1행씩 기록한다.

**Tech Stack:** Next.js (pages router), TypeScript, Supabase(Postgres+RLS), Resend, zod, jest, Tailwind.

## Global Constraints

- 의존성은 **pnpm**. `package.json` 변경 시 `pnpm-lock.yaml` 함께 커밋.
- 커밋 전 **prettier** 필수(`npx prettier --write <files>`), CI에 `format:check`·`lint`·`typecheck`·`test`·`i18n:check` 있음.
- Supabase 작업은 **CLI**로. 마이그레이션은 `supabase/migrations/`에 추가 후 `supabase db push --linked`. service role 키는 `supabase projects api-keys --project-ref jmelvfcluezlhdxewger`로 취득(레포에 박지 말 것).
- 관리자 API는 `requireAdminRole(req, res, 'editor')` 게이트(발송·연락처 편집은 editor+). RLS: 열람 `is_active_admin()`, 쓰기 `admin_can_edit()`.
- 발신 주소는 `강정 피스앤뮤직캠프 <admin@peaceandmusic.net>` (기존 reply.ts와 동일 상수).
- 작업 완료 후 `git push origin main`.
- 응답 메시지·라벨은 한국어. 그룹 라벨: 뮤지션/기획단/후원단체.

---

### Task 1: DB 마이그레이션 — mail_contacts 테이블 + mailbox_messages 확장

**Files:**
- Create: `supabase/migrations/<timestamp>_mail_contacts.sql` (CLI가 타임스탬프 생성)

**Interfaces:**
- Produces: 테이블 `public.mail_contacts(id, name, email, group_type, cohorts, note, is_active, created_by, created_at, updated_at)`; `public.mailbox_messages`에 `campaign_id uuid`, `send_error text` 컬럼 추가.

- [ ] **Step 1: 마이그레이션 파일 생성**

Run: `supabase migration new mail_contacts`
Expected: `supabase/migrations/<timestamp>_mail_contacts.sql` 빈 파일 생성

- [ ] **Step 2: 마이그레이션 SQL 작성**

생성된 파일에 작성:

```sql
-- 단체 메일 수신자 명단 (관리자 전용 비공개)
create table if not exists public.mail_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  group_type text not null,
  cohorts text[] not null default '{}',
  note text not null default '',
  is_active boolean not null default true,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mail_contacts_name_len check (char_length(name) between 1 and 200),
  constraint mail_contacts_group_check check (group_type in ('musician', 'planning', 'sponsor')),
  constraint mail_contacts_email_format check (email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);

-- 같은 이메일 중복 방지(대소문자 무시)
create unique index if not exists mail_contacts_email_unique on public.mail_contacts (lower(email));
create index if not exists mail_contacts_group_idx on public.mail_contacts (group_type);
create index if not exists mail_contacts_cohorts_idx on public.mail_contacts using gin (cohorts);

alter table public.mail_contacts enable row level security;

-- anon 미부여. 관리자 전용.
grant select, insert, update, delete on public.mail_contacts to authenticated;

drop policy if exists "active admins read contacts" on public.mail_contacts;
create policy "active admins read contacts" on public.mail_contacts
for select to authenticated using (public.is_active_admin());
drop policy if exists "editors insert contacts" on public.mail_contacts;
create policy "editors insert contacts" on public.mail_contacts
for insert to authenticated with check (public.admin_can_edit());
drop policy if exists "editors update contacts" on public.mail_contacts;
create policy "editors update contacts" on public.mail_contacts
for update to authenticated using (public.admin_can_edit()) with check (public.admin_can_edit());
drop policy if exists "editors delete contacts" on public.mail_contacts;
create policy "editors delete contacts" on public.mail_contacts
for delete to authenticated using (public.admin_can_edit());

-- 단체 발송 추적: 같은 campaign_id로 묶고, 수신자별 실패 사유 기록
alter table public.mailbox_messages add column if not exists campaign_id uuid;
alter table public.mailbox_messages add column if not exists send_error text;
create index if not exists mailbox_messages_campaign_idx on public.mailbox_messages (campaign_id);
```

- [ ] **Step 3: 마이그레이션 적용**

Run: `supabase db push --linked`
Expected: `mail_contacts` 생성 + `mailbox_messages` 컬럼 추가, 에러 없음

- [ ] **Step 4: 적용 검증**

Run (service role 키로):
```bash
export KEY=$(supabase projects api-keys --project-ref jmelvfcluezlhdxewger 2>/dev/null | grep -i "service_role" | grep -oE 'eyJ[A-Za-z0-9._-]+')
KEY="$KEY" node -e 'const{createClient}=require("@supabase/supabase-js");const s=createClient("https://jmelvfcluezlhdxewger.supabase.co",process.env.KEY);s.from("mail_contacts").select("id",{count:"exact",head:true}).then(r=>console.log("mail_contacts ok, count:",r.count,"err:",r.error?.message))'
```
Expected: `mail_contacts ok, count: 0 err: undefined`

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/
git commit -m "feat(db): mail_contacts 테이블 + mailbox 단체발송 추적 컬럼"
```

---

### Task 2: 타입 + 폼/유틸 헬퍼 (TDD)

**Files:**
- Create: `src/types/mailContacts.ts`
- Create: `src/lib/mailContactsForms.ts`
- Create: `src/lib/mailContactsForms.test.ts`
- Modify: `src/types/mailbox.ts` (campaign_id, send_error 추가)

**Interfaces:**
- Produces:
  - `type MailGroupType = 'musician' | 'planning' | 'sponsor'`
  - `interface MailContact { id, name, email, group_type: MailGroupType, cohorts: string[], note, is_active, created_by, created_at, updated_at }`
  - `GROUP_LABEL: Record<MailGroupType,string>`, `GROUP_TYPES: MailGroupType[]`
  - `isValidEmail(v): boolean` (재수출), `validateContactName(v): Ok<string>|Err`, `normalizeGroupType(v): MailGroupType|null`, `normalizeCohorts(v: string|string[]): string[]`
  - `personalizeBody(template: string, name: string): string` — `{이름}`→name
  - `parseContactsCsv(text: string): { rows: ParsedContact[]; errors: string[] }` where `ParsedContact = { name; email; group_type: MailGroupType; cohorts: string[] }`
  - `validateBroadcastSubject(v): Ok<string>|Err`, `validateBroadcastBody(v): Ok<string>|Err`

- [ ] **Step 1: 타입 파일 작성**

`src/types/mailContacts.ts`:
```typescript
export type MailGroupType = 'musician' | 'planning' | 'sponsor';

export interface MailContact {
  id: string;
  name: string;
  email: string;
  group_type: MailGroupType;
  cohorts: string[];
  note: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

`src/types/mailbox.ts` 의 `MailboxMessage`에 두 필드 추가(기존 인터페이스 끝, `created_at` 아래):
```typescript
  campaign_id: string | null;
  send_error: string | null;
```

- [ ] **Step 2: 실패하는 테스트 작성**

`src/lib/mailContactsForms.test.ts`:
```typescript
import {
  personalizeBody,
  parseContactsCsv,
  normalizeGroupType,
  normalizeCohorts,
  validateContactName,
} from './mailContactsForms';

test('personalizeBody는 {이름}을 이름으로 치환한다', () => {
  expect(personalizeBody('안녕하세요 {이름}님', '홍길동')).toBe('안녕하세요 홍길동님');
});

test('personalizeBody는 여러 {이름}을 모두 치환한다', () => {
  expect(personalizeBody('{이름}, {이름}', '가')).toBe('가, 가');
});

test('normalizeGroupType은 한글/영문 그룹명을 코드로 바꾼다', () => {
  expect(normalizeGroupType('뮤지션')).toBe('musician');
  expect(normalizeGroupType('기획단')).toBe('planning');
  expect(normalizeGroupType('후원단체')).toBe('sponsor');
  expect(normalizeGroupType('sponsor')).toBe('sponsor');
  expect(normalizeGroupType('알수없음')).toBeNull();
});

test('normalizeCohorts는 콤마/공백 구분 문자열을 배열로 만든다', () => {
  expect(normalizeCohorts('2026, 2025')).toEqual(['2026', '2025']);
  expect(normalizeCohorts(['2026', '', ' 2025 '])).toEqual(['2026', '2025']);
});

test('validateContactName은 빈 이름을 거부한다', () => {
  expect(validateContactName('').ok).toBe(false);
  expect(validateContactName('홍길동')).toEqual({ ok: true, value: '홍길동' });
});

test('parseContactsCsv는 헤더 있는 CSV를 파싱하고 잘못된 행은 errors로 보고한다', () => {
  const csv = [
    '이름,이메일,그룹,회차',
    '홍길동,hong@example.com,뮤지션,2026',
    '단체A,a@example.com,후원단체,"2025,2026"',
    '깨진행,not-an-email,기획단,2026',
  ].join('\n');
  const { rows, errors } = parseContactsCsv(csv);
  expect(rows).toHaveLength(2);
  expect(rows[0]).toEqual({
    name: '홍길동',
    email: 'hong@example.com',
    group_type: 'musician',
    cohorts: ['2026'],
  });
  expect(rows[1].cohorts).toEqual(['2025', '2026']);
  expect(errors).toHaveLength(1);
  expect(errors[0]).toContain('not-an-email');
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `npx jest mailContactsForms`
Expected: FAIL ("Cannot find module './mailContactsForms'")

- [ ] **Step 4: 헬퍼 구현**

`src/lib/mailContactsForms.ts`:
```typescript
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
  for (const line of lines) {
    const cols = splitCsvLine(line);
    // 헤더 스킵
    if (cols[0] === '이름' && /이메일|email/i.test(cols[1] ?? '')) continue;
    const [name, email, group, cohort] = cols;
    const g = normalizeGroupType(group ?? '');
    if (!name || !isValidEmail(email ?? '') || !g) {
      errors.push(`건너뜀: ${line} (이름/이메일/그룹 확인: ${email ?? ''})`);
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
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npx jest mailContactsForms`
Expected: PASS (6 tests)

- [ ] **Step 6: Commit**

```bash
npx prettier --write src/types/mailContacts.ts src/types/mailbox.ts src/lib/mailContactsForms.ts src/lib/mailContactsForms.test.ts
git add src/types/mailContacts.ts src/types/mailbox.ts src/lib/mailContactsForms.ts src/lib/mailContactsForms.test.ts
git commit -m "feat(mailbox): 연락처 타입·폼 헬퍼(CSV 파싱·개인화) + 테스트"
```

---

### Task 3: 발송 코어 로직 `runBroadcast` (TDD, 주입형)

**Files:**
- Create: `src/lib/mailBroadcast.ts`
- Create: `src/lib/mailBroadcast.test.ts`

**Interfaces:**
- Consumes: `personalizeBody` (Task 2)
- Produces:
  - `interface BroadcastRecipient { id: string; name: string; email: string }`
  - `interface BroadcastRecord { to_email: string; subject: string; text_body: string; campaign_id: string; send_error: string | null; resend_id: string | null }`
  - `interface BroadcastResult { sent: number; failed: { email: string; error: string }[] }`
  - `async function runBroadcast(opts): Promise<BroadcastResult>` — 각 수신자에 개인화 발송, 성공/실패 무관 record 호출

- [ ] **Step 1: 실패하는 테스트 작성**

`src/lib/mailBroadcast.test.ts`:
```typescript
import { runBroadcast } from './mailBroadcast';

const recipients = [
  { id: '1', name: '가', email: 'a@example.com' },
  { id: '2', name: '나', email: 'b@example.com' },
];

test('각 수신자에게 개인화 본문으로 발송하고 모두 기록한다', async () => {
  const records: unknown[] = [];
  const sentTo: string[] = [];
  const result = await runBroadcast({
    recipients,
    subject: '공지',
    text: '{이름}님 안녕하세요',
    from: 'X <x@y.net>',
    campaignId: 'camp-1',
    send: async ({ to, text }) => {
      sentTo.push(`${to}:${text}`);
      return { id: `rid-${to}` };
    },
    record: async (row) => {
      records.push(row);
    },
  });
  expect(result.sent).toBe(2);
  expect(result.failed).toHaveLength(0);
  expect(sentTo).toContain('a@example.com:가님 안녕하세요');
  expect(records).toHaveLength(2);
});

test('일부 발송 실패 시 성공분은 기록하고 실패 목록을 반환한다', async () => {
  const records: { to_email: string; send_error: string | null }[] = [];
  const result = await runBroadcast({
    recipients,
    subject: '공지',
    text: '본문',
    from: 'X <x@y.net>',
    campaignId: 'camp-2',
    send: async ({ to }) => {
      if (to === 'b@example.com') throw new Error('bounce');
      return { id: 'rid' };
    },
    record: async (row) => {
      records.push({ to_email: row.to_email, send_error: row.send_error });
    },
  });
  expect(result.sent).toBe(1);
  expect(result.failed).toEqual([{ email: 'b@example.com', error: 'bounce' }]);
  expect(records).toHaveLength(2);
  expect(records.find((r) => r.to_email === 'b@example.com')?.send_error).toBe('bounce');
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx jest mailBroadcast`
Expected: FAIL ("Cannot find module './mailBroadcast'")

- [ ] **Step 3: 구현**

`src/lib/mailBroadcast.ts`:
```typescript
import { personalizeBody } from './mailContactsForms';

export interface BroadcastRecipient {
  id: string;
  name: string;
  email: string;
}

export interface BroadcastRecord {
  to_email: string;
  subject: string;
  text_body: string;
  campaign_id: string;
  send_error: string | null;
  resend_id: string | null;
}

export interface BroadcastResult {
  sent: number;
  failed: { email: string; error: string }[];
}

interface RunBroadcastOptions {
  recipients: BroadcastRecipient[];
  subject: string;
  text: string;
  from: string;
  campaignId: string;
  send: (input: { from: string; to: string; subject: string; text: string }) => Promise<{
    id: string;
  }>;
  record: (row: BroadcastRecord) => Promise<void>;
}

/** 수신자별 개인화 발송. 성공/실패와 무관하게 record를 호출해 1행씩 남긴다. */
export const runBroadcast = async (opts: RunBroadcastOptions): Promise<BroadcastResult> => {
  const result: BroadcastResult = { sent: 0, failed: [] };
  for (const r of opts.recipients) {
    const text = personalizeBody(opts.text, r.name);
    let resendId: string | null = null;
    let sendError: string | null = null;
    try {
      const sent = await opts.send({ from: opts.from, to: r.email, subject: opts.subject, text });
      resendId = sent.id;
      result.sent += 1;
    } catch (err) {
      sendError = err instanceof Error ? err.message : String(err);
      result.failed.push({ email: r.email, error: sendError });
    }
    await opts.record({
      to_email: r.email,
      subject: opts.subject,
      text_body: text,
      campaign_id: opts.campaignId,
      send_error: sendError,
      resend_id: resendId,
    });
  }
  return result;
};
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx jest mailBroadcast`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
npx prettier --write src/lib/mailBroadcast.ts src/lib/mailBroadcast.test.ts
git add src/lib/mailBroadcast.ts src/lib/mailBroadcast.test.ts
git commit -m "feat(mailbox): 단체 발송 코어 runBroadcast(주입형) + 테스트"
```

---

### Task 4: 연락처 CRUD API

**Files:**
- Create: `pages/api/admin/mail-contacts/index.ts`
- Create: `pages/api/admin/mail-contacts/[id].ts`

**Interfaces:**
- Consumes: `requireAdminRole`, `createSupabaseServerClient`, `normalizeCohorts`, `normalizeGroupType`, `validateContactName`, `isValidEmail`
- Produces: REST 엔드포인트. GET `?group=&cohort=` 목록, POST 생성, PATCH/DELETE by id.

- [ ] **Step 1: 목록·생성 핸들러 작성**

`pages/api/admin/mail-contacts/index.ts`:
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { isValidEmail, normalizeCohorts, validateContactName } from '@/lib/mailContactsForms';

const createSchema = z.object({
  name: z.string(),
  email: z.string(),
  group_type: z.enum(['musician', 'planning', 'sponsor']),
  cohorts: z.union([z.string(), z.array(z.string())]).optional(),
  note: z.string().optional(),
});

const getErrorMessage = (error: unknown): string =>
  error instanceof ZodError
    ? error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
    : error instanceof Error
      ? error.message
      : String(error);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;
  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'GET') {
    let query = supabase.from('mail_contacts').select('*').order('created_at', { ascending: false });
    const group = req.query.group;
    if (typeof group === 'string' && group) query = query.eq('group_type', group);
    const cohort = req.query.cohort;
    if (typeof cohort === 'string' && cohort) query = query.contains('cohorts', [cohort]);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ items: data });
  }

  if (req.method === 'POST') {
    try {
      const body = createSchema.parse(req.body);
      const nameCheck = validateContactName(body.name);
      if (!nameCheck.ok) return res.status(400).json({ error: nameCheck.reason });
      if (!isValidEmail(body.email))
        return res.status(400).json({ error: '이메일 형식이 올바르지 않습니다.' });
      const { data, error } = await supabase
        .from('mail_contacts')
        .insert({
          name: nameCheck.value,
          email: body.email.trim(),
          group_type: body.group_type,
          cohorts: normalizeCohorts(body.cohorts ?? []),
          note: body.note?.trim() ?? '',
          created_by: session.member.email,
        })
        .select('*')
        .single();
      if (error) {
        const dup = error.code === '23505';
        return res
          .status(dup ? 409 : 500)
          .json({ error: dup ? '이미 등록된 이메일입니다.' : error.message });
      }
      return res.status(200).json({ item: data });
    } catch (error) {
      return res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'method_not_allowed' });
}
```

- [ ] **Step 2: 수정·삭제 핸들러 작성**

`pages/api/admin/mail-contacts/[id].ts`:
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { isValidEmail, normalizeCohorts } from '@/lib/mailContactsForms';

const patchSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  group_type: z.enum(['musician', 'planning', 'sponsor']).optional(),
  cohorts: z.union([z.string(), z.array(z.string())]).optional(),
  note: z.string().optional(),
  is_active: z.boolean().optional(),
});

const getErrorMessage = (error: unknown): string =>
  error instanceof ZodError
    ? error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
    : error instanceof Error
      ? error.message
      : String(error);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const parsedId = z.string().uuid().safeParse(req.query.id);
  if (!parsedId.success) return res.status(400).json({ error: 'invalid_id' });
  const id = parsedId.data;

  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;
  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'PATCH') {
    try {
      const body = patchSchema.parse(req.body);
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.name !== undefined) update.name = body.name.trim();
      if (body.email !== undefined) {
        if (!isValidEmail(body.email))
          return res.status(400).json({ error: '이메일 형식이 올바르지 않습니다.' });
        update.email = body.email.trim();
      }
      if (body.group_type !== undefined) update.group_type = body.group_type;
      if (body.cohorts !== undefined) update.cohorts = normalizeCohorts(body.cohorts);
      if (body.note !== undefined) update.note = body.note.trim();
      if (body.is_active !== undefined) update.is_active = body.is_active;

      const { data, error } = await supabase
        .from('mail_contacts')
        .update(update)
        .eq('id', id)
        .select('*')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ item: data });
    } catch (error) {
      return res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('mail_contacts').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
```

- [ ] **Step 3: 타입체크·lint**

Run: `npx tsc --noEmit && npx eslint pages/api/admin/mail-contacts/`
Expected: 에러 없음

- [ ] **Step 4: 수동 스모크 (dev 서버, 관리자 로그인 상태 쿠키 필요 — 선택)**

Run: `npx tsc --noEmit` 통과로 갈음(런타임 검증은 Task 7 UI에서)

- [ ] **Step 5: Commit**

```bash
npx prettier --write pages/api/admin/mail-contacts/
git add pages/api/admin/mail-contacts/
git commit -m "feat(api): 메일 연락처 CRUD 엔드포인트"
```

---

### Task 5: CSV 임포트 API

**Files:**
- Create: `pages/api/admin/mail-contacts/import.ts`

**Interfaces:**
- Consumes: `parseContactsCsv` (Task 2), `requireAdminRole`, `createSupabaseServerClient`
- Produces: POST `{ csv: string }` → `{ inserted, skipped, errors[] }`. 중복 이메일은 skip.

- [ ] **Step 1: 핸들러 작성**

`pages/api/admin/mail-contacts/import.ts`:
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { parseContactsCsv } from '@/lib/mailContactsForms';

const schema = z.object({ csv: z.string() });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  try {
    const { csv } = schema.parse(req.body);
    const { rows, errors } = parseContactsCsv(csv);
    if (rows.length === 0) return res.status(400).json({ error: '추가할 유효한 행이 없습니다.', errors });

    const supabase = createSupabaseServerClient(req, res);
    let inserted = 0;
    let skipped = 0;
    for (const row of rows) {
      const { error } = await supabase.from('mail_contacts').insert({
        name: row.name,
        email: row.email,
        group_type: row.group_type,
        cohorts: row.cohorts,
        created_by: session.member.email,
      });
      if (error) {
        if (error.code === '23505') skipped += 1;
        else errors.push(`${row.email}: ${error.message}`);
      } else inserted += 1;
    }
    return res.status(200).json({ inserted, skipped, errors });
  } catch (error) {
    const msg =
      error instanceof ZodError
        ? error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
        : error instanceof Error
          ? error.message
          : String(error);
    return res.status(400).json({ error: msg });
  }
}
```

- [ ] **Step 2: 타입체크·lint**

Run: `npx tsc --noEmit && npx eslint pages/api/admin/mail-contacts/import.ts`
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
npx prettier --write pages/api/admin/mail-contacts/import.ts
git add pages/api/admin/mail-contacts/import.ts
git commit -m "feat(api): 메일 연락처 CSV 일괄 임포트"
```

---

### Task 6: 단체 발송 API

**Files:**
- Create: `pages/api/admin/mailbox/send.ts`

**Interfaces:**
- Consumes: `runBroadcast` (Task 3), `sendEmail` (`@/lib/resend`), `requireAdminRole`, `createSupabaseServerClient`, `validateBroadcastSubject`, `validateBroadcastBody`
- Produces: POST `{ contactIds: string[], subject, text }` → `{ campaign_id, sent, failed[] }`. 대상은 서버에서 `is_active=true` 재조회.

- [ ] **Step 1: 핸들러 작성**

`pages/api/admin/mailbox/send.ts`:
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { sendEmail } from '@/lib/resend';
import { runBroadcast } from '@/lib/mailBroadcast';
import { validateBroadcastBody, validateBroadcastSubject } from '@/lib/mailContactsForms';
import type { MailContact } from '@/types/mailContacts';

const FROM_ADDRESS = '강정 피스앤뮤직캠프 <admin@peaceandmusic.net>';

const schema = z.object({
  contactIds: z.array(z.string().uuid()).min(1),
  subject: z.string(),
  text: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  try {
    const body = schema.parse(req.body);
    const subjectCheck = validateBroadcastSubject(body.subject);
    if (!subjectCheck.ok) return res.status(400).json({ error: subjectCheck.reason });
    const bodyCheck = validateBroadcastBody(body.text);
    if (!bodyCheck.ok) return res.status(400).json({ error: bodyCheck.reason });

    const supabase = createSupabaseServerClient(req, res);
    const { data, error } = await supabase
      .from('mail_contacts')
      .select('id, name, email, is_active')
      .in('id', body.contactIds)
      .eq('is_active', true);
    if (error) return res.status(500).json({ error: error.message });
    const recipients = (data as Pick<MailContact, 'id' | 'name' | 'email'>[]) ?? [];
    if (recipients.length === 0)
      return res.status(400).json({ error: '발송 가능한 수신자가 없습니다.' });

    const campaignId = randomUUID();
    const result = await runBroadcast({
      recipients,
      subject: subjectCheck.value,
      text: bodyCheck.value,
      from: FROM_ADDRESS,
      campaignId,
      send: sendEmail,
      record: async (row) => {
        await supabase.from('mailbox_messages').insert({
          direction: 'outbound',
          resend_id: row.resend_id,
          from_email: 'admin@peaceandmusic.net',
          to_email: row.to_email,
          subject: row.subject,
          text_body: row.text_body,
          campaign_id: row.campaign_id,
          send_error: row.send_error,
          is_read: true,
          created_by: session.member.email,
        });
      },
    });

    return res.status(200).json({ campaign_id: campaignId, ...result });
  } catch (error) {
    const msg =
      error instanceof ZodError
        ? error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
        : error instanceof Error
          ? error.message
          : String(error);
    return res.status(400).json({ error: msg });
  }
}
```

- [ ] **Step 2: 타입체크·lint**

Run: `npx tsc --noEmit && npx eslint pages/api/admin/mailbox/send.ts`
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
npx prettier --write pages/api/admin/mailbox/send.ts
git add pages/api/admin/mailbox/send.ts
git commit -m "feat(api): 그룹 단체 발송 엔드포인트(개별 발송+campaign 기록)"
```

---

### Task 7: 메일함 UI — 탭 + 연락처 + 보내기

**Files:**
- Modify: `pages/admin/mailbox/index.tsx` (탭 셸 + 기존 인박스 유지)
- Create: `src/components/admin/mailbox/ContactsPanel.tsx`
- Create: `src/components/admin/mailbox/ComposePanel.tsx`

**Interfaces:**
- Consumes: 모든 위 API, `GROUP_LABEL`, `GROUP_TYPES`, `MailContact`, `personalizeBody`
- Produces: 사용자 화면. 클라이언트 fetch로 API 호출.

- [ ] **Step 1: 탭 셸 추가 (mailbox/index.tsx)**

기존 `AdminMailboxPage` 컴포넌트의 반환 JSX 최상단을 탭 상태로 감싼다. 컴포넌트 함수 본문 시작에 추가:
```typescript
  const [tab, setTab] = useState<'inbox' | 'compose' | 'contacts'>('inbox');
```
기존 받은메일 UI(목록+상세)는 `tab === 'inbox'` 일 때만 렌더하도록 감싸고, 그 위에 탭 버튼 줄을 둔다:
```tsx
<div className="mb-4 flex gap-2 border-b border-deep-ocean/10">
  {([
    ['inbox', '받은 메일함'],
    ['compose', '보내기'],
    ['contacts', '연락처'],
  ] as const).map(([key, label]) => (
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
```
import 추가: `import ContactsPanel from '@/components/admin/mailbox/ContactsPanel';` `import ComposePanel from '@/components/admin/mailbox/ComposePanel';`

- [ ] **Step 2: ContactsPanel 작성**

`src/components/admin/mailbox/ContactsPanel.tsx` — 명단 목록(그룹·회차 필터+검색), 추가 폼, 활성 토글/삭제, CSV 붙여넣기 임포트. 핵심 동작:
```tsx
import { useCallback, useEffect, useState } from 'react';
import { GROUP_LABEL, GROUP_TYPES } from '@/lib/mailContactsForms';
import type { MailContact, MailGroupType } from '@/types/mailContacts';

export default function ContactsPanel({ canEdit }: { canEdit: boolean }) {
  const [items, setItems] = useState<MailContact[]>([]);
  const [group, setGroup] = useState<'' | MailGroupType>('');
  const [cohort, setCohort] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (group) params.set('group', group);
    if (cohort) params.set('cohort', cohort);
    const res = await fetch(`/api/admin/mail-contacts?${params.toString()}`);
    const data = await res.json();
    if (res.ok) setItems(data.items ?? []);
    else setError(data.error ?? '불러오지 못했습니다.');
  }, [group, cohort]);

  useEffect(() => {
    void load();
  }, [load]);

  const addContact = async (form: {
    name: string;
    email: string;
    group_type: MailGroupType;
    cohorts: string;
  }) => {
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/mail-contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? '추가 실패');
    await load();
  };

  const toggleActive = async (c: MailContact) => {
    await fetch(`/api/admin/mail-contacts/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    await load();
  };

  const removeContact = async (c: MailContact) => {
    if (!window.confirm(`${c.name} 연락처를 삭제할까요?`)) return;
    await fetch(`/api/admin/mail-contacts/${c.id}`, { method: 'DELETE' });
    await load();
  };

  const importCsv = async (csv: string) => {
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/mail-contacts/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? '임포트 실패');
    setError(`추가 ${data.inserted}건, 중복 ${data.skipped}건, 오류 ${data.errors?.length ?? 0}건`);
    await load();
  };

  // 렌더: 필터 select(GROUP_TYPES) + 회차 input + 목록 테이블(이름/이메일/그룹/회차/활성/삭제)
  //      + (canEdit) 추가 폼 + CSV textarea + 버튼. error 표시.
  // 구현 시 기존 admin 패널 Tailwind 스타일(rounded border border-deep-ocean/10 bg-white p-4)을 따른다.
  return (
    <section className="space-y-4">
      {/* 필터 */}
      <div className="flex flex-wrap gap-2">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value as '' | MailGroupType)}
          className="rounded border border-deep-ocean/15 px-3 py-2 text-sm"
        >
          <option value="">전체 그룹</option>
          {GROUP_TYPES.map((g) => (
            <option key={g} value={g}>
              {GROUP_LABEL[g]}
            </option>
          ))}
        </select>
        <input
          value={cohort}
          onChange={(e) => setCohort(e.target.value)}
          placeholder="회차 (예: 2026)"
          className="rounded border border-deep-ocean/15 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">{error}</p>}
      <ul className="divide-y divide-deep-ocean/10 rounded border border-deep-ocean/10 bg-white">
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate">
              <strong className="text-deep-ocean">{c.name}</strong>{' '}
              <span className="text-coastal-gray">{c.email}</span>{' '}
              <span className="text-xs text-jeju-ocean">
                {GROUP_LABEL[c.group_type]} · {c.cohorts.join(',') || '회차없음'}
              </span>
            </span>
            {canEdit && (
              <span className="flex flex-shrink-0 gap-2">
                <button type="button" onClick={() => toggleActive(c)} className="text-xs text-coastal-gray hover:text-deep-ocean">
                  {c.is_active ? '활성' : '비활성'}
                </button>
                <button type="button" onClick={() => removeContact(c)} className="text-xs text-sunset-coral">
                  삭제
                </button>
              </span>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-coastal-gray">연락처가 없습니다.</li>
        )}
      </ul>
      {canEdit && <ContactAddForm busy={busy} onAdd={addContact} onImport={importCsv} />}
    </section>
  );
}

function ContactAddForm({
  busy,
  onAdd,
  onImport,
}: {
  busy: boolean;
  onAdd: (f: { name: string; email: string; group_type: MailGroupType; cohorts: string }) => void;
  onImport: (csv: string) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [groupType, setGroupType] = useState<MailGroupType>('musician');
  const [cohorts, setCohorts] = useState('2026');
  const [csv, setCsv] = useState('');
  return (
    <div className="space-y-3 rounded border border-deep-ocean/10 bg-ocean-sand/20 p-4">
      <div className="flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" className="rounded border border-deep-ocean/15 px-3 py-2 text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" className="rounded border border-deep-ocean/15 px-3 py-2 text-sm" />
        <select value={groupType} onChange={(e) => setGroupType(e.target.value as MailGroupType)} className="rounded border border-deep-ocean/15 px-3 py-2 text-sm">
          {GROUP_TYPES.map((g) => (
            <option key={g} value={g}>
              {GROUP_LABEL[g]}
            </option>
          ))}
        </select>
        <input value={cohorts} onChange={(e) => setCohorts(e.target.value)} placeholder="회차(콤마구분)" className="rounded border border-deep-ocean/15 px-3 py-2 text-sm" />
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            onAdd({ name, email, group_type: groupType, cohorts });
            setName('');
            setEmail('');
          }}
          className="rounded bg-deep-ocean px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          추가
        </button>
      </div>
      <details>
        <summary className="cursor-pointer text-sm text-coastal-gray">CSV 붙여넣기 (이름,이메일,그룹,회차)</summary>
        <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={4} className="mt-2 w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm" placeholder="홍길동,hong@example.com,뮤지션,2026" />
        <button type="button" disabled={busy || !csv.trim()} onClick={() => onImport(csv)} className="mt-2 rounded border border-jeju-ocean/40 px-3 py-2 text-sm font-semibold text-jeju-ocean disabled:opacity-60">
          일괄 추가
        </button>
      </details>
    </div>
  );
}
```
import에 `useState` 포함 확인.

- [ ] **Step 3: ComposePanel 작성**

`src/components/admin/mailbox/ComposePanel.tsx`:
```tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GROUP_LABEL, GROUP_TYPES, personalizeBody } from '@/lib/mailContactsForms';
import type { MailContact, MailGroupType } from '@/types/mailContacts';

export default function ComposePanel({ canEdit }: { canEdit: boolean }) {
  const [group, setGroup] = useState<'' | MailGroupType>('');
  const [cohort, setCohort] = useState('');
  const [contacts, setContacts] = useState<MailContact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ sent: number; failed: { email: string; error: string }[] } | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (group) params.set('group', group);
    if (cohort) params.set('cohort', cohort);
    const res = await fetch(`/api/admin/mail-contacts?${params.toString()}`);
    const data = await res.json();
    if (res.ok) setContacts((data.items ?? []).filter((c: MailContact) => c.is_active));
  }, [group, cohort]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const selectAll = () => setSelected(new Set(contacts.map((c) => c.id)));
  const clearAll = () => setSelected(new Set());

  const preview = useMemo(() => {
    const first = contacts.find((c) => selected.has(c.id));
    return first ? personalizeBody(text, first.name) : '';
  }, [contacts, selected, text]);

  const send = async () => {
    setError('');
    setResult(null);
    const ids = [...selected];
    if (ids.length === 0) return setError('수신자를 선택하세요.');
    if (!subject.trim() || !text.trim()) return setError('제목과 본문을 입력하세요.');
    if (!window.confirm(`${ids.length}명에게 발송합니다. 발신: admin@peaceandmusic.net`)) return;
    setBusy(true);
    const res = await fetch('/api/admin/mailbox/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactIds: ids, subject, text }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? '발송 실패');
    setResult({ sent: data.sent, failed: data.failed ?? [] });
  };

  if (!canEdit)
    return <p className="text-sm text-coastal-gray">발송 권한이 없습니다(editor 이상).</p>;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select value={group} onChange={(e) => setGroup(e.target.value as '' | MailGroupType)} className="rounded border border-deep-ocean/15 px-3 py-2 text-sm">
          <option value="">전체 그룹</option>
          {GROUP_TYPES.map((g) => (
            <option key={g} value={g}>
              {GROUP_LABEL[g]}
            </option>
          ))}
        </select>
        <input value={cohort} onChange={(e) => setCohort(e.target.value)} placeholder="회차 (예: 2026)" className="rounded border border-deep-ocean/15 px-3 py-2 text-sm" />
        <button type="button" onClick={selectAll} className="text-xs text-jeju-ocean">전체선택</button>
        <button type="button" onClick={clearAll} className="text-xs text-coastal-gray">해제</button>
        <span className="ml-auto text-sm font-semibold text-deep-ocean">{selected.size}명 선택</span>
      </div>

      <ul className="max-h-48 divide-y divide-deep-ocean/10 overflow-y-auto rounded border border-deep-ocean/10 bg-white">
        {contacts.map((c) => (
          <li key={c.id} className="flex items-center gap-2 px-3 py-1.5 text-sm">
            <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} />
            <span className="text-deep-ocean">{c.name}</span>
            <span className="text-coastal-gray">{c.email}</span>
            <span className="ml-auto text-xs text-jeju-ocean">{GROUP_LABEL[c.group_type]}</span>
          </li>
        ))}
        {contacts.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-coastal-gray">해당 조건의 연락처가 없습니다.</li>
        )}
      </ul>

      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="제목" className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm" />
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="본문 — {이름} 을 쓰면 받는 사람 이름으로 치환됩니다." className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm" />
      {preview && (
        <p className="rounded bg-ocean-sand/30 px-3 py-2 text-xs text-coastal-gray">
          미리보기(첫 수신자): {preview}
        </p>
      )}
      {error && <p className="rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">{error}</p>}
      {result && (
        <div className="rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">
          발송 완료 — 성공 {result.sent}건{result.failed.length > 0 ? `, 실패 ${result.failed.length}건` : ''}
          {result.failed.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-xs text-sunset-coral">
              {result.failed.map((f) => (
                <li key={f.email}>{f.email}: {f.error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <button type="button" disabled={busy} onClick={send} className="rounded bg-deep-ocean px-5 py-2 font-semibold text-white disabled:opacity-60">
        {busy ? '발송 중…' : `${selected.size}명에게 발송`}
      </button>
    </section>
  );
}
```

- [ ] **Step 4: 타입체크·lint·포맷**

Run: `npx tsc --noEmit && npx eslint pages/admin/mailbox/index.tsx src/components/admin/mailbox/`
Expected: 에러 없음 (경고 set-state-in-effect가 뜨면 load는 useEffect+useCallback 패턴이라 허용 — 필요 시 의존성 확인)

- [ ] **Step 5: 빌드 확인**

Run: `npx next build` (또는 dev에서 /admin/mailbox 진입해 탭 전환·목록 로드 확인)
Expected: 빌드 성공

- [ ] **Step 6: Commit**

```bash
npx prettier --write pages/admin/mailbox/index.tsx src/components/admin/mailbox/
git add pages/admin/mailbox/index.tsx src/components/admin/mailbox/
git commit -m "feat(admin): 메일함 탭 확장 — 연락처 관리 + 단체 보내기 UI"
```

---

### Task 8: 시드 데이터 적재 (일회성, 레포 밖 실행)

**Files:**
- (임시) 레포 밖 `/tmp` 또는 레포 내 `_tmp_seed.cjs`(실행 후 삭제) — git에 남기지 않음

**Interfaces:**
- Consumes: `mail_contacts` 테이블, docs CSV(후원단체), `admin_members`(기획단)
- Produces: 후원단체·기획단 연락처 행. 멱등(이메일 중복 skip).

- [ ] **Step 1: 후원단체 이메일 추출**

Run:
```bash
grep "@" "docs/2026캠프 운영/준비문서/제3회 강정피스앤뮤직캠프 공동주최 조직 제안 리스트 - 제주단체.csv"
```
Expected: `단체명,이메일 / 전화` 형태 행들. 이름=단체명, 이메일=`@` 포함 첫 토큰을 추출.

- [ ] **Step 2: 시드 스크립트 작성·실행 (레포 내 .cjs, 실행 후 삭제)**

회의록 적재와 동일 패턴. `_tmp_seed.cjs`:
```javascript
const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://jmelvfcluezlhdxewger.supabase.co', process.env.KEY);

// docs에서 확인된 후원단체(제주 공동주최) 이메일만. (단체명, 이메일)
const sponsors = [
  ['개척자들', 'korea@thefrontiers.org'],
  ['민주노총 제주본부', 'kctujeju@kctu.org'],
  ['제주다크투어', 'jejudarktours@gmail.com'],
  ['제주여민회', 'office@jejuwomen.kr'],
  ['제주여성인권연대', 'jejupeacemaker@hanmail.net'],
  ['제주주민자치연대', 'juminnet@hanmail.net'],
  ['제주참여환경연대', 'js@jejungo.net'],
  ['제주퀴어프라이드조직위원회', 'jejuqcf@gmail.com'],
  ['제주평화인권센터', 'jejuhumanrights@gmail.com'],
  ['제주평화인권연구소왓', 'jejuphri@gmail.com'],
  ['한살림제주', 'hansalimjeju@naver.com'],
  ['핫핑크돌핀스', 'hotpinkdolphins@gmail.com'],
  ['제주환경운동연합', 'jeju@kfem.or.kr'],
  ['녹색당', 'paran@greenkorea.org'],
];

(async () => {
  // 기획단: admin_members의 활성 이메일
  const { data: admins } = await s.from('admin_members').select('email, display_name').eq('active', true);
  const planning = (admins || []).map((a) => [a.display_name || a.email.split('@')[0], a.email]);

  const rows = [
    ...sponsors.map(([name, email]) => ({ name, email, group_type: 'sponsor', cohorts: ['2026'], created_by: 'seed' })),
    ...planning.map(([name, email]) => ({ name, email, group_type: 'planning', cohorts: ['2026'], created_by: 'seed' })),
  ];

  let inserted = 0, skipped = 0;
  for (const r of rows) {
    const { error } = await s.from('mail_contacts').insert(r);
    if (error) { if (error.code === '23505') skipped++; else console.error(r.email, error.message); }
    else inserted++;
  }
  console.log(`시드 완료 — 추가 ${inserted}, 중복 ${skipped}`);
})();
```

Run:
```bash
export KEY=$(supabase projects api-keys --project-ref jmelvfcluezlhdxewger 2>/dev/null | grep -i "service_role" | grep -oE 'eyJ[A-Za-z0-9._-]+')
KEY="$KEY" node _tmp_seed.cjs
rm -f _tmp_seed.cjs
```
Expected: `시드 완료 — 추가 N, 중복 0`

- [ ] **Step 3: 잔존 파일 없음 확인**

Run: `git status --short`
Expected: `_tmp_seed.cjs` 없음(삭제됨). 추적 변경 없음.

- [ ] **Step 4: (커밋 없음)**

시드는 데이터 작업이라 코드 커밋 없음. 명단은 비공개 DB에만 존재.

---

### Task 9: 최종 검증 + 푸시

- [ ] **Step 1: 전체 게이트 통과**

Run: `npx prettier --check "src/**/*.{ts,tsx}" "pages/**/*.{ts,tsx}" && npx eslint src pages && npx tsc --noEmit && npx jest mailContactsForms mailBroadcast`
Expected: 모두 통과

- [ ] **Step 2: 푸시**

```bash
git push origin main
```
Expected: 푸시 성공, Vercel 빌드 통과

---

## 비고

- 마이그레이션 파일은 `mailbox_messages`가 이미 존재한다고 가정(20260622084006_mailbox_messages.sql). `add column if not exists`라 재실행 안전.
- Resend rate limit이 문제되면 `runBroadcast` 루프에 `await new Promise(r => setTimeout(r, 120))` 삽입(현재 규모 불필요).
- 뮤지션 이메일은 추후 연락처 화면/CSV로 채운다. 시드엔 포함 안 됨.
