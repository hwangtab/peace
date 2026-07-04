import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { GalleryImage } from '@/types/gallery';

/** GalleryImageItem 이 실제로 읽는 필드만 요구한다. GalleryImage 의 슈퍼타입 역할을
 *  하므로 SlimGalleryImage 처럼 일부 필드만 있는 객체도 전달할 수 있다. */
type GalleryImageLike = Pick<GalleryImage, 'url' | 'description' | 'eventType' | 'eventYear'>;

interface GalleryImageItemProps {
  image: GalleryImageLike;
  priority?: boolean;
  onClick: (image: GalleryImageLike) => void;
}

// 일시적인 네트워크 실패(약한 모바일 신호 등)로 onError가 한 번 터지면 재시도 없이
// 영구히 깨진-이미지 표시로 고착되던 구조적 결함을 막는다. 짧은 지연을 두고 몇 차례
// remount로 재시도한 뒤에만 최종적으로 대체 표시로 포기한다.
const MAX_IMAGE_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

const GalleryImageItem = React.memo(
  ({ image, priority = false, onClick }: GalleryImageItemProps) => {
    const { t } = useTranslation();
    // Isolate loading state to this component only
    const [isLoaded, setIsLoaded] = useState(false);
    // 이미지 로드 실패(404 등) 시 스켈레톤 펄스를 멈추고 중립 대체 표시로 전환한다.
    const [hasError, setHasError] = useState(false);
    // 재시도 횟수 — 값이 바뀔 때마다 <Image>가 remount되어 새 네트워크 요청을 유발한다.
    const [imageAttempt, setImageAttempt] = useState(0);
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
      () => () => {
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      },
      []
    );

    const handleImageError = useCallback(() => {
      if (imageAttempt >= MAX_IMAGE_RETRIES) {
        setHasError(true);
        return;
      }
      retryTimeoutRef.current = setTimeout(() => setImageAttempt((a) => a + 1), RETRY_DELAY_MS);
    }, [imageAttempt]);
    const eventLabel =
      image.eventType === 'camp'
        ? t('gallery.alt_camp', { year: image.eventYear })
        : t('gallery.alt_album', { year: image.eventYear });
    const altText = image.description || eventLabel;

    // 로드 실패 타일은 라이트박스로 띄울 원본이 없으므로 클릭·키보드 동작을 비활성화한다.
    return (
      <div
        className={`group h-full rounded-lg ${
          hasError
            ? 'cursor-default'
            : 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean'
        }`}
        onClick={hasError ? undefined : () => onClick(image)}
        onKeyDown={
          hasError
            ? undefined
            : (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick(image);
                }
              }
        }
        role={hasError ? undefined : 'button'}
        aria-label={altText}
        tabIndex={hasError ? undefined : 0}
      >
        <div className="relative overflow-hidden rounded-lg aspect-square bg-ocean-sand shadow-sm hover:shadow-md transition-shadow">
          {/* Skeleton pulse — priority 타일은 LCP 후보이므로 건너뜀. 실패 시엔 펄스 제거. */}
          {!priority && !isLoaded && !hasError && (
            <div className="absolute inset-0 bg-seafoam/30 motion-safe:animate-pulse rounded-lg z-0" />
          )}

          {hasError ? (
            /* 은은한 중립 대체 표시 — 깨진 이미지 아이콘으로 로드 실패를 알린다. */
            <div className="absolute inset-0 flex items-center justify-center bg-ocean-sand text-coastal-gray/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="m21 15-5-5L5 21" />
                <path d="m3 3 18 18" />
              </svg>
            </div>
          ) : (
            <Image
              key={imageAttempt}
              src={image.url}
              alt={altText}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-[transform,opacity] duration-700 ease-in-out group-hover:scale-110 ${
                priority || isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              quality={75}
              priority={priority}
              {...(!priority && { loading: 'lazy' })}
              onLoad={() => setIsLoaded(true)}
              onError={handleImageError}
            />
          )}

          {/* Hover overlay — 정상 타일에서만 */}
          {!hasError && (
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          )}
        </div>
      </div>
    );
  }
);

GalleryImageItem.displayName = 'GalleryImageItem';

export default GalleryImageItem;
