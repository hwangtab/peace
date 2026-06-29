import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { parseContactsCsv } from '@/lib/mailContactsForms';

const schema = z.object({ csv: z.string() });

// 한 번에 처리할 최대 행 수. 페이로드 크기·메모리 방어용.
const MAX_IMPORT_ROWS = 1000;

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
    if (rows.length === 0)
      return res.status(400).json({ error: '추가할 유효한 행이 없습니다.', errors });
    if (rows.length > MAX_IMPORT_ROWS)
      return res.status(400).json({
        error: `한 번에 최대 ${MAX_IMPORT_ROWS}행까지 가져올 수 있습니다. (현재 ${rows.length}행) 나눠서 시도하세요.`,
      });

    const supabase = createSupabaseServerClient(req, res);
    // 배치 upsert: 단일 호출로 처리(순차 루프의 타임아웃·부분삽입 문제 회피).
    // 이메일 중복은 무시(ignoreDuplicates)하고, 삽입된 행 수로 inserted/skipped를 산출한다.
    // 먼저 배치 내 이메일 중복을 제거한다 — Postgres는 같은 ON CONFLICT 키가 한 배치에
    // 두 번 나오면("cannot affect row a second time") 전체를 실패시키기 때문.
    const byEmail = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      const email = row.email.toLowerCase();
      if (!byEmail.has(email)) byEmail.set(email, row);
    }
    const payload = [...byEmail.values()].map((row) => ({
      name: row.name,
      email: row.email.toLowerCase(),
      group_type: row.group_type,
      cohorts: row.cohorts,
      created_by: session.member.email,
    }));
    const { data, error } = await supabase
      .from('mail_contacts')
      .upsert(payload, { onConflict: 'email', ignoreDuplicates: true })
      .select('id');
    if (error) {
      console.error('[mail-contacts/import] 가져오기 실패:', error.message);
      return res.status(500).json({ error: 'internal_error' });
    }
    const inserted = data?.length ?? 0;
    const skipped = rows.length - inserted;
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
