import {
  validatePostTitle,
  validatePostBody,
  validateComment,
  validateRating,
  isValidBoardSlug,
} from './boardForms';

describe('validatePostTitle', () => {
  it('trims and accepts 1-120 chars', () => {
    expect(validatePostTitle('  좋은 공연  ')).toEqual({ ok: true, value: '좋은 공연' });
  });
  it('rejects empty', () => {
    expect(validatePostTitle('   ').ok).toBe(false);
  });
  it('rejects >120', () => {
    expect(validatePostTitle('a'.repeat(121)).ok).toBe(false);
  });
});

describe('validatePostBody', () => {
  it('accepts normal body', () => {
    expect(validatePostBody('내용').ok).toBe(true);
  });
  it('rejects empty', () => {
    expect(validatePostBody('  ').ok).toBe(false);
  });
});

describe('validateComment', () => {
  it('accepts 1-1000', () => {
    expect(validateComment('굿').ok).toBe(true);
  });
  it('rejects empty', () => {
    expect(validateComment('').ok).toBe(false);
  });
  it('rejects >1000', () => {
    expect(validateComment('a'.repeat(1001)).ok).toBe(false);
  });
});

describe('validateRating', () => {
  it('required: accepts 1-5', () => {
    expect(validateRating(5, true)).toEqual({ ok: true, value: 5 });
  });
  it('required: rejects 0 and 6 and null', () => {
    expect(validateRating(0, true).ok).toBe(false);
    expect(validateRating(6, true).ok).toBe(false);
    expect(validateRating(null, true).ok).toBe(false);
  });
  it('optional: null ok, out-of-range rejected', () => {
    expect(validateRating(null, false)).toEqual({ ok: true, value: null });
    expect(validateRating(7, false).ok).toBe(false);
  });
});

describe('isValidBoardSlug', () => {
  it('accepts lowercase/digits/hyphen', () => {
    expect(isValidBoardSlug('shows-2026')).toBe(true);
  });
  it('rejects uppercase/space/empty', () => {
    expect(isValidBoardSlug('Shows')).toBe(false);
    expect(isValidBoardSlug('a b')).toBe(false);
    expect(isValidBoardSlug('')).toBe(false);
  });
});
