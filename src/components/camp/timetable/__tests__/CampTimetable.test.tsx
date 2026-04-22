import { render, screen, fireEvent } from '@testing-library/react';
import CampTimetable from '../CampTimetable';
import { Timetable } from '../types';
import { Musician } from '@/types/musician';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && typeof opts === 'object') {
        let out = key;
        for (const [k, v] of Object.entries(opts)) out = out.replace(`{{${k}}}`, String(v));
        return out;
      }
      return key;
    },
  }),
}));

jest.mock('next/image', () => ({ __esModule: true, default: ({ alt }: { alt: string }) => <img alt={alt} /> }));

const musicians: Musician[] = [];
const data: Timetable = {
  year: 2026,
  days: [
    {
      date: '2026-06-05', weekday: 'fri', dayLabel: '6/5 (금)',
      teamCount: 1, startTime: '18:00', endTime: '18:25',
      acts: [{ order: 1, start: '18:00', end: '18:25', type: 'performance', name: '윤선애', scale: 'solo' }],
    },
    {
      date: '2026-06-06', weekday: 'sat', dayLabel: '6/6 (토)',
      teamCount: 1, startTime: '12:00', endTime: '12:25',
      acts: [{ order: 1, start: '12:00', end: '12:25', type: 'performance', name: '하주원', scale: 'solo' }],
    },
    {
      date: '2026-06-07', weekday: 'sun', dayLabel: '6/7 (일)',
      teamCount: 1, startTime: '11:00', endTime: '11:25',
      acts: [{ order: 1, start: '11:00', end: '11:25', type: 'performance', name: '선경', scale: 'solo' }],
    },
  ],
};

describe('CampTimetable', () => {
  test('renders three tabs', () => {
    render(<CampTimetable data={data} musicians={musicians} campYear={2026} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  test('shows first day content by default', () => {
    render(<CampTimetable data={data} musicians={musicians} campYear={2026} />);
    expect(screen.getByText('윤선애')).toBeInTheDocument();
    expect(screen.queryByText('하주원')).toBeNull();
  });

  test('switches content on tab click', () => {
    render(<CampTimetable data={data} musicians={musicians} campYear={2026} />);
    fireEvent.click(screen.getAllByRole('tab')[1]!);
    expect(screen.getByText('하주원')).toBeInTheDocument();
  });

  test('initial tab respects URL hash', () => {
    window.history.replaceState({}, '', '#timetable-day-2026-06-07');
    render(<CampTimetable data={data} musicians={musicians} campYear={2026} />);
    expect(screen.getByText('선경')).toBeInTheDocument();
    window.history.replaceState({}, '', window.location.pathname);
  });

  test('tab has aria-selected on active', () => {
    render(<CampTimetable data={data} musicians={musicians} campYear={2026} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(tabs[2]!);
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
  });
});
