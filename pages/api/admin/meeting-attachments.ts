import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const createSchema = z
  .object({
    meeting_id: z.string().uuid(),
    file_path: z.string().min(1).max(400),
    file_name: z.string().min(1).max(255),
    file_size: z.number().int().min(0).optional(),
    mime_type: z.string().max(150).optional(),
  })
  .refine((v) => v.file_path.startsWith(`${v.meeting_id}/`), {
    message: 'file_path가 회의 폴더와 일치하지 않습니다.',
    path: ['file_path'],
  });

const deleteSchema = z.object({ id: z.string().uuid() });

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'POST') {
    try {
      const body = createSchema.parse(req.body);
      const { data, error } = await supabase
        .from('meeting_attachments')
        .insert({
          meeting_id: body.meeting_id,
          file_path: body.file_path,
          file_name: body.file_name,
          file_size: body.file_size ?? null,
          mime_type: body.mime_type ?? null,
          uploaded_by: session.member.email,
        })
        .select('*')
        .single();
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ attachment: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'DELETE') {
    try {
      const body = deleteSchema.parse(req.body);

      const target = await supabase
        .from('meeting_attachments')
        .select('id, file_path')
        .eq('id', body.id)
        .maybeSingle();
      if (target.error) {
        res.status(500).json({ error: target.error.message });
        return;
      }
      if (!target.data) {
        res.status(404).json({ error: '첨부 파일을 찾을 수 없습니다.' });
        return;
      }

      const { error } = await supabase.from('meeting_attachments').delete().eq('id', body.id);
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      const filePath = target.data.file_path as string;
      if (filePath) {
        try {
          await supabase.storage.from('meeting-files').remove([filePath]);
        } catch {
          // 스토리지 정리는 best-effort
        }
      }

      res.status(200).json({ ok: true });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  res.setHeader('Allow', 'POST, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
