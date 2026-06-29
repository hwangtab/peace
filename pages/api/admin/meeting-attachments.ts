import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import {
  ATTACHMENT_MAX_SIZE,
  isAllowedAttachmentExt,
  ATTACHMENT_ALLOWED_EXT,
} from '@/lib/meetingForms';

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
  })
  // 클라이언트 검증과 별개로 서버에서도 확장자·크기를 강제한다(우회 방지).
  .refine((v) => isAllowedAttachmentExt(v.file_name) && isAllowedAttachmentExt(v.file_path), {
    message: `허용되지 않는 파일 형식입니다. (${ATTACHMENT_ALLOWED_EXT.join(', ')})`,
    path: ['file_name'],
  })
  .refine((v) => v.file_size === undefined || v.file_size <= ATTACHMENT_MAX_SIZE, {
    message: '파일 크기는 20MB 이하여야 합니다.',
    path: ['file_size'],
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
        if (error.code === '23503') {
          res.status(404).json({ error: '회의를 찾을 수 없습니다.' });
          return;
        }
        console.error('[meeting-attachments] POST insert failed:', error.message);
        res.status(500).json({ error: 'internal_error' });
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
        console.error('[meeting-attachments] DELETE select failed:', target.error.message);
        res.status(500).json({ error: 'internal_error' });
        return;
      }
      if (!target.data) {
        res.status(404).json({ error: '첨부 파일을 찾을 수 없습니다.' });
        return;
      }

      const { error } = await supabase.from('meeting_attachments').delete().eq('id', body.id);
      if (error) {
        console.error('[meeting-attachments] DELETE failed:', error.message);
        res.status(500).json({ error: 'internal_error' });
        return;
      }

      const filePath = target.data.file_path as string;
      if (filePath) {
        try {
          const { error: rmError } = await supabase.storage
            .from('meeting-files')
            .remove([filePath]);
          // 스토리지 정리는 best-effort지만, 실패 시 orphan 파일이 쌓이므로 로깅한다.
          if (rmError) {
            console.error(
              '[meeting-attachments] storage cleanup failed:',
              filePath,
              rmError.message
            );
          }
        } catch (err) {
          console.error('[meeting-attachments] storage cleanup threw:', filePath, err);
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
