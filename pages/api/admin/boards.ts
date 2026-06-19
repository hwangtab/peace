import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { isValidBoardSlug } from '@/lib/boardForms';
import type { Board } from '@/types/board';

const createSchema = z.object({
  slug: z.string().trim(),
  name: z.string().trim().min(1, '게시판 이름은 필수입니다.').max(80, '이름은 80자 이하여야 합니다.'),
  description: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() ? v.trim() : ''),
    z.string()
  ),
  sort_order: z.number().int().min(0).default(0),
  has_rating: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

const updateSchema = z
  .object({
    id: z.string().uuid(),
    slug: z.string().trim().optional(),
    name: z
      .string()
      .trim()
      .min(1, '게시판 이름은 필수입니다.')
      .max(80, '이름은 80자 이하여야 합니다.')
      .optional(),
    description: z
      .preprocess(
        (v) => (typeof v === 'string' ? v.trim() : v),
        z.string()
      )
      .optional(),
    sort_order: z.number().int().min(0).optional(),
    has_rating: z.boolean().optional(),
    is_active: z.boolean().optional(),
  })
  .refine(
    (v) =>
      v.slug !== undefined ||
      v.name !== undefined ||
      v.description !== undefined ||
      v.sort_order !== undefined ||
      v.has_rating !== undefined ||
      v.is_active !== undefined,
    { message: '변경할 필드가 하나 이상 필요합니다.' }
  );

const deleteSchema = z.object({
  id: z.string().uuid(),
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

const SLUG_ERROR = '이미 사용 중인 slug입니다.';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ boards: data ?? [] });
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = createSchema.parse(req.body);
      if (!isValidBoardSlug(body.slug)) {
        res
          .status(400)
          .json({ error: 'slug는 소문자 영문·숫자·하이픈만 허용되며 1~40자여야 합니다.' });
        return;
      }
      const { data, error } = await supabase
        .from('boards')
        .insert({
          slug: body.slug,
          name: body.name,
          description: body.description,
          sort_order: body.sort_order,
          has_rating: body.has_rating,
          is_active: body.is_active,
        })
        .select('*')
        .single();
      if (error) {
        const message = error.code === '23505' ? SLUG_ERROR : error.message;
        res.status(error.code === '23505' ? 409 : 500).json({ error: message });
        return;
      }
      res.status(200).json({ board: data as Board });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = updateSchema.parse(req.body);
      if (body.slug !== undefined && !isValidBoardSlug(body.slug)) {
        res
          .status(400)
          .json({ error: 'slug는 소문자 영문·숫자·하이픈만 허용되며 1~40자여야 합니다.' });
        return;
      }

      const target = await supabase.from('boards').select('*').eq('id', body.id).maybeSingle();
      if (target.error) {
        res.status(500).json({ error: target.error.message });
        return;
      }
      if (!target.data) {
        res.status(404).json({ error: '게시판을 찾을 수 없습니다.' });
        return;
      }

      const { id: _id, ...updates } = body;
      const { data, error } = await supabase
        .from('boards')
        .update(updates)
        .eq('id', body.id)
        .select('*')
        .maybeSingle();
      if (error) {
        const message = error.code === '23505' ? SLUG_ERROR : error.message;
        res.status(error.code === '23505' ? 409 : 500).json({ error: message });
        return;
      }
      if (!data) {
        res.status(404).json({ error: '게시판을 찾을 수 없습니다.' });
        return;
      }
      res.status(200).json({ board: data as Board });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'DELETE') {
    try {
      const body = deleteSchema.parse(req.body);
      const { error } = await supabase.from('boards').delete().eq('id', body.id);
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
