import { render, screen, fireEvent, act } from '@testing-library/react';
import GalleryImageItem from './GalleryImageItem';

const image = {
  url: '/images-webp/camps/2023/DSC00437.webp',
  description: 'test photo',
  eventType: 'camp' as const,
  eventYear: 2023,
};

describe('GalleryImageItem image failure recovery', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('retries the image instead of permanently falling back on the first error', () => {
    render(<GalleryImageItem image={image} onClick={jest.fn()} />);

    fireEvent.error(screen.getByAltText('test photo'));

    // 첫 실패 직후에는 아직 재시도 대기 중 — 깨진-이미지 대체 표시로 고착되면 안 된다.
    expect(screen.getByAltText('test photo')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(RETRY_DELAY_MS);
    });

    // 재시도 이미지가 다시 렌더된다(새 attempt로 remount).
    expect(screen.getByAltText('test photo')).toBeInTheDocument();
  });

  it('falls back to the neutral placeholder only after exhausting retries', () => {
    render(<GalleryImageItem image={image} onClick={jest.fn()} />);

    // 재시도 상한(2회)을 넘기도록 3번 연속 실패시킨다.
    for (let i = 0; i < 3; i += 1) {
      fireEvent.error(screen.getByAltText('test photo'));
      act(() => {
        jest.advanceTimersByTime(RETRY_DELAY_MS);
      });
    }

    // 재시도 소진 후에는 이미지가 제거되고 대체 표시로 전환된다.
    expect(screen.queryByAltText('test photo')).not.toBeInTheDocument();
  });

  it('disables click/keyboard interaction only after retries are exhausted', () => {
    const onClick = jest.fn();
    render(<GalleryImageItem image={image} onClick={onClick} />);

    const tile = screen.getByRole('button');

    // 재시도 중에는 여전히 상호작용 가능 — 클릭이 라이트박스를 연다.
    fireEvent.error(screen.getByAltText('test photo'));
    fireEvent.click(tile);
    expect(onClick).toHaveBeenCalledTimes(1);

    // 재시도 상한을 넘겨 최종 폴백으로 진입.
    for (let i = 0; i < 3; i += 1) {
      const img = screen.queryByAltText('test photo');
      if (!img) break;
      fireEvent.error(img);
      act(() => {
        jest.advanceTimersByTime(RETRY_DELAY_MS);
      });
    }

    // 폴백 상태에서는 role=button 이 사라지고 클릭이 무시된다.
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

// 컴포넌트 내부 상수와 동일하게 유지 — 재시도 지연.
const RETRY_DELAY_MS = 1500;
