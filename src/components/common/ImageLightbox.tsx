import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

export interface LightboxImage {
  src: string;
  alt: string;
  credit?: string;
}

interface ImageLightboxProps {
  image?: string | { url: string; alt?: string; credit?: string } | null;
  onClose: () => void;
  maxHeight?: string;
  show?: boolean;
  /** 갤러리 탐색 모드: 이미지 배열을 전달하면 ←/→ 키 및 버튼으로 순회 가능 */
  images?: LightboxImage[];
  /** 현재 표시할 이미지의 인덱스 (갤러리 탐색 모드) */
  index?: number;
  /** 인덱스 변경 콜백 (갤러리 탐색 모드) */
  onIndexChange?: (i: number) => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  image,
  onClose,
  maxHeight = '90vh',
  show,
  images,
  index = 0,
  onIndexChange,
}) => {
  const { t } = useTranslation();

  // ── 갤러리 모드 판별 ──────────────────────────────────────────────
  const isGalleryMode = Array.isArray(images) && images.length > 0 && onIndexChange != null;

  // ── 표시 여부 ─────────────────────────────────────────────────────
  const isVisible = isGalleryMode ? (show ?? true) : (show ?? !!image);

  // ── 단일 이미지 모드: 닫힐 때 leave 애니 동안 이미지 유지(latch) ──
  const [displayed, setDisplayed] = useState(image);
  useEffect(() => {
    if (!isGalleryMode && image) setDisplayed(image);
  }, [isGalleryMode, image]);

  // ── 현재 표시 데이터 결정 ─────────────────────────────────────────
  let imageUrl = '';
  let altText = '';
  let credit: string | undefined;

  if (isGalleryMode && images) {
    const current = images[index];
    imageUrl = current?.src ?? '';
    altText = current?.alt ?? 'Lightbox image';
    credit = current?.credit;
  } else {
    const src = displayed;
    imageUrl = src ? (typeof src === 'string' ? src : src.url) : '';
    altText = src ? (typeof src === 'string' ? 'Lightbox image' : src.alt || 'Lightbox image') : '';
    credit = src && typeof src !== 'string' ? src.credit : undefined;
  }

  // ── 탐색 핸들러 ───────────────────────────────────────────────────
  const canPrev = isGalleryMode && index > 0;
  const canNext = isGalleryMode && images != null && index < images.length - 1;

  const handlePrev = useCallback(() => {
    if (canPrev) onIndexChange!(index - 1);
  }, [canPrev, index, onIndexChange]);

  const handleNext = useCallback(() => {
    if (canNext) onIndexChange!(index + 1);
  }, [canNext, index, onIndexChange]);

  // ── 키보드 이벤트 ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isVisible || !isGalleryMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (canPrev) onIndexChange!(index - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (canNext) onIndexChange!(index + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isGalleryMode, canPrev, canNext, index, onIndexChange]);

  return (
    <Transition appear show={isVisible} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto overscroll-contain">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-[90vw] max-w-5xl transform overflow-hidden rounded-lg shadow-2xl transition-[transform,opacity]">
                <div className="relative w-full h-[90vh]" style={{ maxHeight }}>
                  {/* 라이트박스는 풀사이즈로 보므로 next/image 재압축(이중 압축)을 끄고
                      미리 생성한 webp 원본을 그대로 직송한다. */}
                  <Image
                    src={imageUrl}
                    alt={altText}
                    fill
                    sizes="90vw"
                    className="object-contain rounded-lg"
                    loading="eager"
                    unoptimized
                  />
                </div>

                {credit && (
                  <p className="absolute bottom-3 left-4 right-4 text-xs sm:text-sm text-white/90 bg-black/40 backdrop-blur-sm rounded-md px-3 py-1.5 w-fit max-w-[80%] pointer-events-none">
                    {credit}
                  </p>
                )}

                {/* Close button inside panel for better focus management */}
                <button
                  className="absolute top-4 right-4 text-white text-3xl hover:text-jeju-ocean transition-colors bg-black/20 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-golden-sun"
                  onClick={onClose}
                  aria-label={t('common.close')}
                >
                  &times;
                </button>

                {/* 이전 버튼 */}
                {isGalleryMode && (
                  <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-golden-sun"
                    onClick={handlePrev}
                    disabled={!canPrev}
                    aria-label={t('common.prev_image', { defaultValue: '이전 이미지' })}
                  >
                    &#8249;
                  </button>
                )}

                {/* 다음 버튼 */}
                {isGalleryMode && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-golden-sun"
                    onClick={handleNext}
                    disabled={!canNext}
                    aria-label={t('common.next_image', { defaultValue: '다음 이미지' })}
                  >
                    &#8250;
                  </button>
                )}

                {/* 인덱스 표시 (갤러리 모드) */}
                {isGalleryMode && images && images.length > 1 && (
                  <p className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-white/70 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 pointer-events-none select-none">
                    {index + 1} / {images.length}
                  </p>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ImageLightbox;
