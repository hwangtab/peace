const trimmed = (v: string) => (v ?? '').trim();

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; reason: string };

export const isValidEmail = (v: string): boolean => {
  const t = trimmed(v);
  // 단순·실용 검증: 공백 없는 local@domain.tld
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
};

export const validateReplyBody = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length < 1 || t.length > 50000) {
    return { ok: false, reason: '답장 내용은 1~50000자여야 합니다.' };
  }
  return { ok: true, value: t };
};

export const validateReplySubject = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length > 200) return { ok: false, reason: '제목은 200자 이하여야 합니다.' };
  return { ok: true, value: t };
};

/** 원본 제목에 "Re:"를 붙이되 이미 Re:로 시작하면 중복하지 않는다. */
export const replySubject = (original: string): string => {
  const t = trimmed(original);
  if (/^re:/i.test(t)) return t;
  return t ? `Re: ${t}` : 'Re:';
};
