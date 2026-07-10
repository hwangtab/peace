import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { redactMember, requireAdminRole } from '@/lib/adminAuth';
import {
  ADMIN_COLLECTION_PAGE_SIZE,
  getAdminCollectionConfig,
  buildArchiveFilters,
} from '@/lib/adminArchive';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { isSupportedLocale } from '@/constants/locales';
import {
  AdminArchiveServiceError,
  getAdminArchiveLocaleStatuses,
  hideAdminArchiveRow,
  listAdminArchiveRows,
  saveAdminArchiveRow,
} from '@/lib/adminArchiveService';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

// 주의: 공개 사이트(videos/gallery/press)는 정적 JSON(public/data/**)을 단일
// 출처(SSOT)로 사용한다. 이 API가 write 하는 archive_videos·archive_gallery_images·
// archive_press_items 테이블은 더 이상 공개 화면에 반영되지 않는다(좀비 CMS 레이어).
// 저장은 성공해도 사이트에는 나타나지 않으므로, 대응하는 어드민 편집 UI(/admin/videos·
// /admin/gallery·/admin/press)는 모두 상황판 리다이렉트로 비활성화했다. 라우트 자체는
// 과거 데이터 열람·복구 및 CMS→정적 재동기화 스크립트 호환을 위해 남겨둔다.
// 참조: [[project_gallery_static_ssot]] [[project_supabase_egress]]
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const collection = String(req.query.collection ?? '');
  const config = getAdminCollectionConfig(collection);

  if (!config) {
    res.status(404).json({ error: 'unknown_admin_collection' });
    return;
  }

  // GET (read/preview) is allowed for any logged-in admin including viewers;
  // mutations require editor or owner. RLS enforces the same on the DB side.
  const minRole = req.method === 'GET' ? 'viewer' : 'editor';
  const session = await requireAdminRole(req, res, minRole);
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);
  const selectedLocale =
    typeof req.query.locale === 'string' && isSupportedLocale(req.query.locale)
      ? req.query.locale
      : 'ko';

  if (req.method === 'GET') {
    const localeStatusId =
      typeof req.query.localeStatusId === 'string' ? req.query.localeStatusId : null;
    if (localeStatusId) {
      const parsed = z.string().uuid().safeParse(localeStatusId);
      if (!parsed.success) {
        res.status(400).json({ error: 'invalid_id' });
        return;
      }
      try {
        const locales = await getAdminArchiveLocaleStatuses({
          supabase,
          config,
          id: parsed.data,
        });
        res.status(200).json({ locales });
      } catch (error) {
        const statusCode = error instanceof AdminArchiveServiceError ? error.statusCode : 500;
        if (statusCode >= 500) {
          console.error(
            '[archive/collection] GET localeStatuses failed:',
            error instanceof Error ? error.message : String(error)
          );
          res.status(statusCode).json({ error: 'internal_error' });
        } else {
          res.status(statusCode).json({ error: getErrorMessage(error) });
        }
      }
      return;
    }

    const offset = Number(req.query.offset ?? 0);
    const limit = Number(req.query.limit ?? ADMIN_COLLECTION_PAGE_SIZE);
    const readParam = (key: string) =>
      typeof req.query[key] === 'string' ? (req.query[key] as string) : '';
    const filters = config.yearTypeFilter
      ? buildArchiveFilters({ type: readParam('type'), year: readParam('year') })
      : {};
    try {
      const page = await listAdminArchiveRows({
        supabase,
        config,
        locale: selectedLocale,
        offset,
        limit,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });
      res.status(200).json({
        ...page,
        admin: redactMember(session.member),
      });
    } catch (error) {
      const statusCode = error instanceof AdminArchiveServiceError ? error.statusCode : 500;
      if (statusCode >= 500) {
        console.error(
          '[archive/collection] GET list failed:',
          error instanceof Error ? error.message : String(error)
        );
        res.status(statusCode).json({ error: 'internal_error' });
      } else {
        res.status(statusCode).json({ error: getErrorMessage(error) });
      }
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const result = await saveAdminArchiveRow({
        supabase,
        response: res,
        config,
        input: req.body,
        session,
      });
      res.status(200).json(result);
      return;
    } catch (error) {
      const statusCode = error instanceof AdminArchiveServiceError ? error.statusCode : 400;
      if (statusCode >= 500) {
        console.error(
          '[archive/collection] POST save failed:',
          error instanceof Error ? error.message : String(error)
        );
        res.status(statusCode).json({ error: 'internal_error' });
      } else {
        res.status(statusCode).json({ error: getErrorMessage(error) });
      }
      return;
    }
  }

  if (req.method === 'DELETE') {
    const id = typeof req.query.id === 'string' ? req.query.id : undefined;
    if (!id) {
      res.status(400).json({ error: 'missing_id' });
      return;
    }
    const parsed = z.string().uuid().safeParse(id);
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_id' });
      return;
    }

    try {
      const result = await hideAdminArchiveRow({
        supabase,
        response: res,
        config,
        id: parsed.data,
        session,
      });
      res.status(200).json(result);
      return;
    } catch (error) {
      const statusCode = error instanceof AdminArchiveServiceError ? error.statusCode : 500;
      if (statusCode >= 500) {
        console.error(
          '[archive/collection] DELETE hide failed:',
          error instanceof Error ? error.message : String(error)
        );
        res.status(statusCode).json({ error: 'internal_error' });
      } else {
        res.status(statusCode).json({ error: getErrorMessage(error) });
      }
      return;
    }
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
