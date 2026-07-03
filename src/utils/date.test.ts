import { parseLocalDate, formatDateLocalized } from './date';

describe('parseLocalDate', () => {
  // The UTC trap: new Date('2024-11-02') is UTC midnight, which renders as Nov 1
  // in western (UTC-) timezones. parseLocalDate builds from LOCAL Y/M/D parts, so
  // the calendar date is identical no matter which timezone the host runs in.
  test('keeps the calendar date stable regardless of host timezone', () => {
    const d = parseLocalDate('2024-11-02');
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(10); // November (0-indexed)
    expect(d.getDate()).toBe(2);
    expect(d.getHours()).toBe(0);
  });

  test('does not drift to the previous day (regression for the UTC-midnight bug)', () => {
    // Whatever the environment TZ, the local day must equal the input day.
    for (const input of ['2023-06-10', '2024-11-02', '2026-06-05', '2026-01-01']) {
      const [y, m, dd] = input.split('-').map(Number);
      const parsed = parseLocalDate(input);
      expect(parsed.getFullYear()).toBe(y);
      expect(parsed.getMonth()).toBe(m - 1);
      expect(parsed.getDate()).toBe(dd);
    }
  });

  test('truncates an ISO datetime to its leading calendar date', () => {
    const d = parseLocalDate('2024-11-02T23:30:00Z');
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(10);
    expect(d.getDate()).toBe(2);
    expect(d.getHours()).toBe(0);
  });

  test('accepts non-padded month/day', () => {
    const d = parseLocalDate('2026-6-5');
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(5);
  });
});

describe('formatDateLocalized', () => {
  test('renders the correct calendar day for a UTC-negative locale', () => {
    // en-US formatting must show Nov 2, not Nov 1, for the classic trap value.
    const formatted = formatDateLocalized('2024-11-02', 'en-US');
    expect(formatted).toBe('November 2, 2024');
  });

  test('honors custom Intl options', () => {
    const formatted = formatDateLocalized('2024-11-02', 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    expect(formatted).toBe('11/02/2024');
  });
});
