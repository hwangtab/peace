import { render, screen } from '@testing-library/react';
import ScrollReveal from './ScrollReveal';

const rect = (height: number): DOMRect =>
  ({
    width: 600,
    height,
    top: 0,
    left: 0,
    right: 600,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }) as DOMRect;

const setViewportHeight = (height: number) => {
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
};

describe('ScrollReveal', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('viewport 안에 들어오는 작은 요소는 애니메이션 래퍼로 렌더한다', () => {
    setViewportHeight(900);
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect(400));

    render(
      <ScrollReveal>
        <p>작은 섹션</p>
      </ScrollReveal>
    );

    expect(screen.getByText('작은 섹션').closest('[data-scroll-reveal]')).toHaveAttribute(
      'data-scroll-reveal',
      'animated'
    );
  });

  it('뷰포트의 1.5배를 넘는 요소는 애니메이션 없이 즉시 렌더한다', () => {
    setViewportHeight(900);
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect(3000));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <ScrollReveal>
        <p>거대 문서</p>
      </ScrollReveal>
    );

    expect(screen.getByText('거대 문서').closest('[data-scroll-reveal]')).toHaveAttribute(
      'data-scroll-reveal',
      'static'
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[ScrollReveal]'));
  });

  it('maxViewportRatio 로 기준을 조정할 수 있다', () => {
    setViewportHeight(900);
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect(1000));

    render(
      <ScrollReveal maxViewportRatio={0.5}>
        <p>기준 초과</p>
      </ScrollReveal>
    );

    expect(screen.getByText('기준 초과').closest('[data-scroll-reveal]')).toHaveAttribute(
      'data-scroll-reveal',
      'static'
    );
  });
});
