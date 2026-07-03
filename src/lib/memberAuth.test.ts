import {
  validateNickname,
  validatePassword,
  mapAuthError,
  safeRedirectPath,
  authLinkErrorFromUrl,
  isAuthSessionMissingError,
} from './memberAuth';

describe('validateNickname', () => {
  it('trims and accepts a 2-20 char nickname', () => {
    expect(validateNickname('  강정러버  ')).toEqual({ ok: true, value: '강정러버' });
  });
  it('rejects too short', () => {
    expect(validateNickname('a').ok).toBe(false);
  });
  it('rejects too long (>20)', () => {
    expect(validateNickname('a'.repeat(21)).ok).toBe(false);
  });
  it('accepts lower boundary (2 chars)', () => {
    expect(validateNickname('ab')).toEqual({ ok: true, value: 'ab' });
  });
  it('accepts upper boundary (20 chars)', () => {
    expect(validateNickname('a'.repeat(20)).ok).toBe(true);
  });
  it('rejects whitespace/control chars inside', () => {
    expect(validateNickname('hi there').ok).toBe(false);
    expect(validateNickname('hi\tthere').ok).toBe(false);
  });
  it('rejects LIKE wildcard characters (%, _, \\)', () => {
    expect(validateNickname('a%b').ok).toBe(false);
    expect(validateNickname('a_b').ok).toBe(false);
    expect(validateNickname('a\\b').ok).toBe(false);
  });
  it('accepts normal Korean/alphanumeric nicknames', () => {
    expect(validateNickname('강정러버').ok).toBe(true);
    expect(validateNickname('peace2026').ok).toBe(true);
    expect(validateNickname('한글abc').ok).toBe(true);
  });
});

describe('validatePassword', () => {
  it('accepts 8+ chars', () => {
    expect(validatePassword('abcd1234')).toEqual({ ok: true });
  });
  it('rejects under 8 chars', () => {
    expect(validatePassword('abc12').ok).toBe(false);
  });
  it('rejects 7-char password', () => {
    expect(validatePassword('abc1234').ok).toBe(false);
  });
});

describe('mapAuthError', () => {
  it('maps already-registered', () => {
    expect(mapAuthError({ message: 'User already registered' })).toBe('errors.emailTaken');
  });
  it('maps invalid credentials', () => {
    expect(mapAuthError({ message: 'Invalid login credentials' })).toBe(
      'errors.invalidCredentials'
    );
  });
  it('maps email-not-confirmed', () => {
    expect(mapAuthError({ message: 'Email not confirmed' })).toBe('errors.emailNotConfirmed');
  });
  it('falls back to a generic key for unknown errors', () => {
    expect(mapAuthError({ message: 'weird' })).toBe('errors.generic');
  });
  it('returns empty string for no error', () => {
    expect(mapAuthError(null)).toBe('');
  });
});

describe('safeRedirectPath', () => {
  it('allows a normal same-origin path', () => {
    expect(safeRedirectPath('/account')).toBe('/account');
    expect(safeRedirectPath('/posts/3')).toBe('/posts/3');
  });
  it('rejects protocol-relative //host', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/account');
  });
  it('rejects backslash /\\host', () => {
    expect(safeRedirectPath('/\\evil.com')).toBe('/account');
  });
  it('rejects absolute URLs', () => {
    expect(safeRedirectPath('https://evil.com')).toBe('/account');
  });
  it('rejects non-string (array/undefined)', () => {
    expect(safeRedirectPath(['/a', '/b'])).toBe('/account');
    expect(safeRedirectPath(undefined)).toBe('/account');
  });
  it('honors a custom fallback', () => {
    expect(safeRedirectPath('bad', '/')).toBe('/');
  });
  it('rejects auth-only destinations (self-redirect guard)', () => {
    expect(safeRedirectPath('/login')).toBe('/account');
    expect(safeRedirectPath('/signup')).toBe('/account');
    expect(safeRedirectPath('/reset-password')).toBe('/account');
    expect(safeRedirectPath('/update-password')).toBe('/account');
  });
  it('rejects auth-only destinations with query/hash and honors fallback', () => {
    expect(safeRedirectPath('/login?next=/login')).toBe('/account');
    expect(safeRedirectPath('/login', '/')).toBe('/');
  });
  it('rejects auth-only destinations behind a locale prefix', () => {
    expect(safeRedirectPath('/en/login')).toBe('/account');
    expect(safeRedirectPath('/zh-Hans/signup')).toBe('/account');
  });
  it('does not over-match paths that merely start with an auth prefix', () => {
    expect(safeRedirectPath('/loginhelp')).toBe('/loginhelp');
    expect(safeRedirectPath('/en/account')).toBe('/en/account');
  });
});

describe('authLinkErrorFromUrl', () => {
  it('detects error in the query string', () => {
    expect(authLinkErrorFromUrl('?error=access_denied', '')).toBe(true);
    expect(authLinkErrorFromUrl('?error_code=otp_expired', '')).toBe(true);
  });
  it('detects error in the hash (implicit flow)', () => {
    expect(authLinkErrorFromUrl('', '#error=access_denied&error_code=otp_expired')).toBe(true);
  });
  it('returns false when there is no error signal', () => {
    expect(authLinkErrorFromUrl('', '')).toBe(false);
    expect(authLinkErrorFromUrl('?code=abc', '')).toBe(false);
  });
});

describe('isAuthSessionMissingError', () => {
  it('matches by error name', () => {
    expect(isAuthSessionMissingError({ name: 'AuthSessionMissingError' })).toBe(true);
  });
  it('matches by message', () => {
    expect(isAuthSessionMissingError({ message: 'Auth session missing!' })).toBe(true);
  });
  it('is false for other errors / nullish', () => {
    expect(isAuthSessionMissingError({ message: 'Invalid login credentials' })).toBe(false);
    expect(isAuthSessionMissingError(null)).toBe(false);
  });
});
