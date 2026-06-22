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

// 검증 함수는 한국어 문장 대신 i18n 키(board 네임스페이스 기준)를 reason으로 반환한다.
// 호출처에서 t(reason)으로 현지화한다.
export const validatePostTitle = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length < 1 || t.length > 120) return { ok: false, reason: 'error.titleLength' };
  return { ok: true, value: t };
};

export const validatePostBody = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length < 1 || t.length > 10000) return { ok: false, reason: 'error.bodyLength' };
  return { ok: true, value: t };
};

export const validateComment = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length < 1 || t.length > 1000) return { ok: false, reason: 'error.commentLength' };
  return { ok: true, value: t };
};

export const validateRating = (v: number | null, required: boolean): Ok<number | null> | Err => {
  if (v === null || v === undefined) {
    return required ? { ok: false, reason: 'error.ratingRequired' } : { ok: true, value: null };
  }
  if (!Number.isInteger(v) || v < 1 || v > 5) return { ok: false, reason: 'error.ratingRange' };
  return { ok: true, value: v };
};

export const isValidBoardSlug = (v: string): boolean =>
  typeof v === 'string' && /^[a-z0-9-]{1,40}$/.test(v);
