export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 20;
export const PASSWORD_MIN = 8;

// 검증 함수는 한국어 문장 대신 i18n 키(auth 네임스페이스 기준)를 reason으로 반환한다.
// 호출처에서 t(reason)으로 현지화한다. (fallbackLng:false이므로 키는 13개 로케일에 모두 존재해야 함)
export const validateNickname = (
  value: string
): { ok: true; value: string } | { ok: false; reason: string } => {
  const trimmed = (value ?? '').trim();
  if (trimmed.length < NICKNAME_MIN || trimmed.length > NICKNAME_MAX) {
    return { ok: false, reason: 'errors.nicknameLength' };
  }
  if (/[\s\x00-\x1f]/.test(trimmed)) {
    return { ok: false, reason: 'errors.nicknameWhitespace' };
  }
  if (/[%_\\]/.test(trimmed)) {
    return { ok: false, reason: 'errors.nicknameChars' };
  }
  return { ok: true, value: trimmed };
};

export const validatePassword = (value: string): { ok: true } | { ok: false; reason: string } => {
  if ((value ?? '').length < PASSWORD_MIN) {
    return { ok: false, reason: 'errors.passwordLength' };
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

// Supabase 에러 메시지를 auth 네임스페이스의 i18n 키로 매핑한다. 호출처에서 t()로 변환.
// 에러가 없으면 '' (호출처는 항상 에러가 있을 때만 호출하므로 안전).
export const mapAuthError = (error: { message?: string } | null | undefined): string => {
  if (!error) return '';
  const msg = error.message ?? '';
  if (/already registered|already exists/i.test(msg)) return 'errors.emailTaken';
  if (/invalid login credentials/i.test(msg)) return 'errors.invalidCredentials';
  if (/email not confirmed/i.test(msg)) return 'errors.emailNotConfirmed';
  if (/password should be at least/i.test(msg)) return 'errors.passwordLength';
  if (/rate limit|too many/i.test(msg)) return 'errors.rateLimit';
  return 'errors.generic';
};
