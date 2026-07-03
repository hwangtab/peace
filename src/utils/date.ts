// Date parsing/formatting helpers that avoid the `new Date('YYYY-MM-DD')` UTC trap.
//
// `new Date('2024-11-02')` parses as UTC midnight, so in western (UTC-) timezones
// `.toLocaleDateString()` renders the previous calendar day — and the server (UTC)
// and browser disagree, causing React hydration mismatches. Building the Date from
// explicit local Y/M/D parts keeps the calendar date stable in every timezone.

const DATE_ONLY_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})/;

/**
 * Parses a date string into a Date at LOCAL midnight of the intended calendar day.
 *
 * - `'YYYY-MM-DD'` → local midnight of that day (no UTC drift).
 * - ISO datetime (`'YYYY-MM-DDTHH:mm:ss…'`) → local midnight of the leading calendar
 *   date. Time/zone components are intentionally dropped: these helpers exist for
 *   date-only display, so we normalize to the date part to stay drift-free.
 * - Anything else → falls back to the native `new Date()` parse.
 */
export function parseLocalDate(dateStr: string): Date {
  const match = DATE_ONLY_RE.exec(dateStr);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date(dateStr);
}

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

/**
 * Formats a date-only string for display in a given locale without UTC drift.
 * Use for `video.date`, `camp.startDate`, and similar `'YYYY-MM-DD'` values.
 */
export function formatDateLocalized(
  dateStr: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS
): string {
  return parseLocalDate(dateStr).toLocaleDateString(locale, options);
}
