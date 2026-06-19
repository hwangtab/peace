const trimmed = (v: string) => (v ?? '').trim();

// Formats an ISO date string for display in board UI.
// Fixed 'ko-KR' locale ensures server and client agree (no hydration mismatch).
export const formatBoardDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
type Ok<T> = { ok: true; value: T };
type Err = { ok: false; reason: string };

export const validatePostTitle = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length < 1 || t.length > 120) return { ok: false, reason: '제목은 1~120자여야 합니다.' };
  return { ok: true, value: t };
};

export const validatePostBody = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length < 1 || t.length > 10000) return { ok: false, reason: '내용은 1~10000자여야 합니다.' };
  return { ok: true, value: t };
};

export const validateComment = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length < 1 || t.length > 1000) return { ok: false, reason: '댓글은 1~1000자여야 합니다.' };
  return { ok: true, value: t };
};

export const validateRating = (
  v: number | null, required: boolean
): Ok<number | null> | Err => {
  if (v === null || v === undefined) {
    return required ? { ok: false, reason: '별점을 선택해 주세요.' } : { ok: true, value: null };
  }
  if (!Number.isInteger(v) || v < 1 || v > 5) return { ok: false, reason: '별점은 1~5점입니다.' };
  return { ok: true, value: v };
};

export const isValidBoardSlug = (v: string): boolean =>
  typeof v === 'string' && /^[a-z0-9-]{1,40}$/.test(v);
