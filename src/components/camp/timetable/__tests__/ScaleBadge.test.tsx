import { render, screen } from '@testing-library/react';
import ScaleBadge from '../ScaleBadge';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'timetable.scale.solo': 'SOLO',
        'timetable.scale.band': 'BAND',
        'timetable.scale.big_band': 'BIG BAND',
        'timetable.scale.ensemble': 'ENSEMBLE',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('ScaleBadge', () => {
  test('renders SOLO badge with correct label', () => {
    render(<ScaleBadge scale="solo" />);
    expect(screen.getByText('SOLO')).toBeInTheDocument();
  });

  test('renders BAND badge', () => {
    render(<ScaleBadge scale="band" />);
    expect(screen.getByText('BAND')).toBeInTheDocument();
  });

  test('renders BIG BAND badge', () => {
    render(<ScaleBadge scale="big-band" />);
    expect(screen.getByText('BIG BAND')).toBeInTheDocument();
  });

  test('renders ENSEMBLE badge', () => {
    render(<ScaleBadge scale="ensemble" />);
    expect(screen.getByText('ENSEMBLE')).toBeInTheDocument();
  });

  test('applies distinct classes per scale', () => {
    const { rerender, container } = render(<ScaleBadge scale="solo" />);
    const soloClass = (container.firstChild as HTMLElement).className;

    rerender(<ScaleBadge scale="big-band" />);
    const bigClass = (container.firstChild as HTMLElement).className;

    expect(soloClass).not.toBe(bigClass);
  });
});
