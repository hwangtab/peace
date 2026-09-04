import { render } from '@testing-library/react';
import HeroSection from '@/components/home/HeroSection';
import PageHero from '@/components/common/PageHero';
import HookStatement from '@/components/camp/gangjeong-story/HookStatement';
import EmotionalStory from '@/components/camp/gangjeong-story/EmotionalStory';
import CampHero from '@/components/camp/CampHero';
import type { CampEvent } from '@/types/camp';

// jsdom에는 matchMedia가 없다 — useIsMobile/useReducedMotion이 필요로 하므로 최소 스텁 제공.
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });
});

/**
 * 이미지 위에 어두운 오버레이 + 흰 글씨를 얹는 섹션은 이미지가 도착하기 전에도 어두워야 한다.
 * 바탕색이 없으면 body(#F8F9FA)가 비쳐 페이지 열림·스크롤 진입 시 흰 화면이 번쩍인다
 * (느린 4G 실측: 첫 페인트 → 히어로 이미지 도착까지 2.3초 동안 흰 배경 + 흰 제목).
 */
const DARK_BASE = /\bbg-(deep-ocean|jeju-ocean)\b/;

describe('image-backed dark sections carry a dark base background', () => {
  it('HeroSection', () => {
    const { container } = render(<HeroSection imageUrl="/images-webp/camps/2023/DSC00437.webp" />);
    expect(container.querySelector('section')?.className).toMatch(DARK_BASE);
  });

  it('PageHero', () => {
    const { container } = render(
      <PageHero title="t" backgroundImage="/images-webp/camps/2023/DSC00437.webp" />
    );
    expect(container.querySelector('section')?.className).toMatch(DARK_BASE);
  });

  it('HookStatement', () => {
    const { container } = render(<HookStatement />);
    expect(container.querySelector('.overflow-hidden')?.className).toMatch(DARK_BASE);
  });

  it('CampHero', () => {
    const camp = {
      id: 'camp-2026',
      slug: 'camp-2026',
      title: '캠프',
      startDate: '2026-06-05',
      endDate: '2026-06-07',
      images: ['/images-webp/camps/2023/DSC00437.webp'],
    } as unknown as CampEvent;
    const { container } = render(<CampHero camp={camp} />);
    expect(container.querySelector('section')?.className).toMatch(DARK_BASE);
  });

  it('EmotionalStory', () => {
    const { container } = render(<EmotionalStory />);
    expect(container.querySelector('.overflow-hidden')?.className).toMatch(DARK_BASE);
  });
});
