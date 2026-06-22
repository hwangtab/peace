import {
  isValidEmail,
  validateReplyBody,
  validateReplySubject,
  replySubject,
} from './mailboxForms';

describe('isValidEmail', () => {
  it('accepts a normal address', () => {
    expect(isValidEmail('a@b.com')).toBe(true);
    expect(isValidEmail('  user@example.org ')).toBe(true);
  });
  it('rejects malformed', () => {
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidEmail('a@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('validateReplyBody', () => {
  it('trims and accepts 1-50000', () => {
    expect(validateReplyBody('  안녕하세요  ')).toEqual({ ok: true, value: '안녕하세요' });
  });
  it('rejects empty', () => {
    expect(validateReplyBody('   ').ok).toBe(false);
  });
  it('rejects too long', () => {
    expect(validateReplyBody('a'.repeat(50001)).ok).toBe(false);
  });
});

describe('validateReplySubject', () => {
  it('accepts empty (will default) and trims', () => {
    expect(validateReplySubject('')).toEqual({ ok: true, value: '' });
    expect(validateReplySubject('  제목  ')).toEqual({ ok: true, value: '제목' });
  });
  it('rejects >200', () => {
    expect(validateReplySubject('a'.repeat(201)).ok).toBe(false);
  });
});

describe('replySubject', () => {
  it('prefixes Re: when missing', () => {
    expect(replySubject('문의합니다')).toBe('Re: 문의합니다');
  });
  it('does not double-prefix Re:', () => {
    expect(replySubject('Re: 문의합니다')).toBe('Re: 문의합니다');
    expect(replySubject('RE: hello')).toBe('RE: hello');
    expect(replySubject('re: hello')).toBe('re: hello');
  });
  it('handles empty subject', () => {
    expect(replySubject('')).toBe('Re:');
    expect(replySubject('   ')).toBe('Re:');
  });
});
