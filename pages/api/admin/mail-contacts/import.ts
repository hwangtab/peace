import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { parseContactsCsv } from '@/lib/mailContactsForms';

const schema = z.object({ csv: z.string() });

// 한 번에 처리할 최대 행 수. serverless 타임아웃(순차 insert) 방어용.
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
    let inserted = 0;
    let skipped = 0;
    for (const row of rows) {
      const { error } = await supabase.from('mail_contacts').insert({
        name: row.name,
        email: row.email.toLowerCase(),
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
