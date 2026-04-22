import { render, screen } from '@testing-library/react';
import TimetableActCard from '../TimetableActCard';
import { Musician } from '@/types/musician';
import { TimetableAct } from '../types';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('next/image', () => {
  const Image = ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />;
  return { __esModule: true, default: Image };
});

const musicianById = new Map<number, Musician>([
  [40, {
    id: 40,
    name: '윤선애',
    shortDescription: '삶의 애환과 시대정신에 공감하는 서정적인 포크 뮤지션',
    description: '',
    genre: [],
    trackTitle: '',
    imageUrl: '/images-webp/musicians/40.webp',
    instagramUrls: [],
  }],
  [48, {
    id: 48,
    name: '최상돈 × 김강곤',
    shortDescription: '음악 순례를 통한 창작과 공연을 전개하는 싱어송라이터',
    description: '',
    genre: [],
    trackTitle: '',
    imageUrl: '/images-webp/musicians/48.webp',
    instagramUrls: [],
  }],
]);

describe('TimetableActCard', () => {
  test('renders name, time range, and shortDescription for linked musician', () => {
    const act: TimetableAct = {
      order: 3,
      start: '18:00',
      end: '18:25',
      type: 'performance',
      name: '윤선애',
      scale: 'solo',
      musicianIds: [40],
    };
    const { container } = render(<TimetableActCard act={act} musicianById={musicianById} campYear={2026} />);
    expect(screen.getByText('윤선애')).toBeInTheDocument();
    const times = container.querySelectorAll('time');
    expect(times[0]).toHaveAttribute('dateTime', '18:00');
    expect(times[0]).toHaveTextContent('18:00');
    expect(times[1]).toHaveAttribute('dateTime', '18:25');
    expect(times[1]).toHaveTextContent('18:25');
    expect(
      screen.getByText('삶의 애환과 시대정신에 공감하는 서정적인 포크 뮤지션'),
    ).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/camps/2026/musicians/40');
  });

  test('renders non-clickable card when musicianIds missing', () => {
    const act: TimetableAct = {
      order: 5,
      start: '13:00',
      end: '13:25',
      type: 'performance',
      name: '불가사리 즉흥세션',
      scale: 'solo',
    };
    render(<TimetableActCard act={act} musicianById={musicianById} campYear={2026} />);
    expect(screen.getByText('불가사리 즉흥세션')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  test('initial fallback shows first 2 chars when no image', () => {
    const act: TimetableAct = {
      order: 5,
      start: '13:00',
      end: '13:25',
      type: 'performance',
      name: '불가사리 즉흥세션',
      scale: 'solo',
    };
    render(<TimetableActCard act={act} musicianById={musicianById} campYear={2026} />);
    expect(screen.getByText('불가')).toBeInTheDocument();
  });

  test('wraps time in semantic <time> tag', () => {
    const act: TimetableAct = {
      order: 3,
      start: '18:00',
      end: '18:25',
      type: 'performance',
      name: '윤선애',
      scale: 'solo',
      musicianIds: [40],
    };
    const { container } = render(<TimetableActCard act={act} musicianById={musicianById} campYear={2026} />);
    const time = container.querySelector('time');
    expect(time).toHaveAttribute('dateTime', '18:00');
  });
});
