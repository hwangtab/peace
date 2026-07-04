import { render, screen, fireEvent, act } from '@testing-library/react';
import HeroSection from './HeroSection';

// jsdom에는 matchMedia가 없다 — useIsMobile(useSyncExternalStore 기반)이 필요로 하므로
// 최소 스텁을 제공한다(항상 데스크톱 취급).
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
});

describe('HeroSection image failure recovery', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('retries the image instead of permanently falling back on the first error', () => {
    render(<HeroSection imageUrl="/images-webp/camps/2023/DSC00437.webp" />);

    const image = screen.getByAltText('home.hero.image_alt');
    fireEvent.error(image);

    // 첫 실패 직후에는 아직 재시도 대기 중 — 그라디언트만 남는 영구 폴백으로 빠지면 안 된다.
    expect(screen.getByAltText('home.hero.image_alt')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // 재시도 이미지가 다시 렌더된다(새 attempt로 remount).
    expect(screen.getByAltText('home.hero.image_alt')).toBeInTheDocument();
  });

  it('falls back to the gradient-only view only after exhausting retries', () => {
    render(<HeroSection imageUrl="/images-webp/camps/2023/DSC00437.webp" />);

    // 재시도 상한(2회)을 넘기도록 3번 연속 실패시킨다.
    for (let i = 0; i < 3; i += 1) {
      fireEvent.error(screen.getByAltText('home.hero.image_alt'));
      act(() => {
        jest.advanceTimersByTime(1500);
      });
    }

    expect(screen.queryByAltText('home.hero.image_alt')).not.toBeInTheDocument();
  });
});
