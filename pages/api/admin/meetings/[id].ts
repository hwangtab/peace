import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const emptyToNull = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const blankToEmpty = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : '');

const updateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, '제목은 필수입니다.')
      .max(200, '제목은 200자 이하여야 합니다.')
      .optional(),
    meeting_date: z
      .preprocess(
        emptyToNull,
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD여야 합니다.')
          .nullable()
      )
      .optional(),
    meeting_time: z
      .preprocess(blankToEmpty, z.string().max(20, '시간은 20자 이하여야 합니다.'))
      .optional(),
    location: z
      .preprocess(blankToEmpty, z.string().max(200, '장소는 200자 이하여야 합니다.'))
      .optional(),
    status: z.enum(['scheduled', 'completed']).optional(),
    minutes_md: z.string().max(100000, '회의록은 100000자 이하여야 합니다.').optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: '변경할 필드가 하나 이상 필요합니다.',
  });

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const parsedId = z.string().uuid().safeParse(req.query.id);
  if (!parsedId.success) {
    res.status(400).json({ error: 'invalid_id' });
    return;
  }
  const id = parsedId.data;

  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'PATCH') {
    try {
      const body = updateSchema.parse(req.body);

      const target = await supabase.from('meetings').select('id').eq('id', id).maybeSingle();
      if (target.error) {
        res.status(500).json({ error: target.error.message });
        return;
      }
      if (!target.data) {
        res.status(404).json({ error: '회의를 찾을 수 없습니다.' });
        return;
      }

      const { data, error } = await supabase
        .from('meetings')
        .update(body)
        .eq('id', id)
        .select('*')
        .single();
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ meeting: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'DELETE') {
    const target = await supabase.from('meetings').select('id').eq('id', id).maybeSingle();
    if (target.error) {
      res.status(500).json({ error: target.error.message });
      return;
    }
    if (!target.data) {
      res.status(404).json({ error: '회의를 찾을 수 없습니다.' });
      return;
    }

    // 첨부 storage 객체 best-effort 정리 (DB 행은 cascade 삭제됨)
    const attachments = await supabase
      .from('meeting_attachments')
      .select('file_path')
      .eq('meeting_id', id);
    const paths = (attachments.data ?? []).map((row) => row.file_path as string).filter(Boolean);
    if (paths.length > 0) {
      try {
        await supabase.storage.from('meeting-files').remove(paths);
      } catch {
        // 스토리지 정리는 best-effort — 실패해도 회의 삭제는 진행
      }
    }

    const { error } = await supabase.from('meetings').delete().eq('id', id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
