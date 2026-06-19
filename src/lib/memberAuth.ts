export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 20;
export const PASSWORD_MIN = 8;

export const validateNickname = (
  value: string
): { ok: true; value: string } | { ok: false; reason: string } => {
  const trimmed = (value ?? '').trim();
  if (trimmed.length < NICKNAME_MIN || trimmed.length > NICKNAME_MAX) {
    return { ok: false, reason: `닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}자여야 합니다.` };
  }
  if (/[\s\x00-\x1f]/.test(trimmed)) {
    return { ok: false, reason: '닉네임에 공백이나 제어문자를 쓸 수 없습니다.' };
  }
  if (/[%_\\]/.test(trimmed)) {
    return { ok: false, reason: '닉네임에 사용할 수 없는 특수문자가 포함되어 있습니다.' };
  }
  return { ok: true, value: trimmed };
};

export const validatePassword = (
  value: string
): { ok: true } | { ok: false; reason: string } => {
  if ((value ?? '').length < PASSWORD_MIN) {
    return { ok: false, reason: `비밀번호는 최소 ${PASSWORD_MIN}자 이상이어야 합니다.` };
  }
  return { ok: true };
};

// Returns a safe same-origin path for post-auth redirects. Rejects absolute
// URLs, protocol-relative (//host) and backslash (/\host) forms that browsers
// can treat as host redirects. Falls back to the given default.
export const safeRedirectPath = (value: unknown, fallback = '/account'): string => {
  const path = typeof value === 'string' ? value : '';
  if (!path.startsWith('/')) return fallback;
  if (path.startsWith('//')) return fallback;
  if (path.startsWith('/\\')) return fallback;
  return path;
};

export const mapAuthError = (error: { message?: string } | null | undefined): string => {
  if (!error) return '';
  const msg = error.message ?? '';
  if (/already registered|already exists/i.test(msg)) return '이미 가입된 이메일입니다.';
  if (/invalid login credentials/i.test(msg)) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (/email not confirmed/i.test(msg)) return '이메일 인증을 먼저 완료해 주세요.';
  if (/password should be at least/i.test(msg)) return '비밀번호가 너무 짧습니다.';
  if (/rate limit|too many/i.test(msg)) return '잠시 후 다시 시도해 주세요.';
  return '요청을 처리하지 못했습니다.';
};
