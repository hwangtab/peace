import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]+$/, '문서 식별자는 소문자/숫자/하이픈만 허용됩니다.');

const saveSchema = z.object({
  title: z.string().trim().min(1, '제목이 필요합니다.'),
  body_md: z.string(),
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const parsedSlug = slugSchema.safeParse(req.query.slug);
  if (!parsedSlug.success) {
    res.status(400).json({ error: 'invalid_slug' });
    return;
  }
  const slug = parsedSlug.data;

  // Reading is open to any active admin; writing requires editor or owner.
  // RLS enforces the same on the DB side.
  const minRole = req.method === 'GET' ? 'viewer' : 'editor';
  const session = await requireAdminRole(req, res, minRole);
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('admin_documents')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      console.error('[documents/[slug]] GET failed:', error.message);
      res.status(500).json({ error: 'internal_error' });
      return;
    }
    res.status(200).json({ document: data ?? null });
    return;
  }

  if (req.method === 'PUT') {
    try {
      const body = saveSchema.parse(req.body);
      const { data, error } = await supabase
        .from('admin_documents')
        .upsert(
          {
            slug,
            title: body.title,
            body_md: body.body_md,
            updated_by: session.member.email,
          },
          { onConflict: 'slug' }
        )
        .select('*')
        .single();
      if (error) {
        console.error('[documents/[slug]] PUT upsert failed:', error.message);
        res.status(500).json({ error: 'internal_error' });
        return;
      }
      res.status(200).json({ document: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  res.status(405).json({ error: 'method_not_allowed' });
}
