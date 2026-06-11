import React from 'react';
import Image from 'next/image';

interface ShareImageCardProps {
  /** public 기준 경로 (예: /images-webp/camps/2026/2026poster1.webp) */
  src: string;
  /** 이미지 라벨 (예: "공식 포스터") */
  label: string;
  /** 다운로드 시 저장될 파일명 (예: 강정캠프-포스터.webp) */
  downloadName: string;
  /** 다운로드 버튼 라벨 (예: "이미지 저장") */
  downloadLabel: string;
  /** 다운로드 버튼 aria-label */
  downloadAria: string;
}

/**
 * ShareImageCard — 포스터·타임테이블 같은 공유용 이미지를 3:4 카드로 미리보여 주고
 * [이미지 저장] 다운로드 링크를 제공한다. 모든 공유 이미지가 3:4 비율이라
 * aspect-[3/4] + object-contain 으로 잘림 없이 통일된 카드로 보인다.
 */
const ShareImageCard: React.FC<ShareImageCardProps> = ({
  src,
  label,
  downloadName,
  downloadLabel,
  downloadAria,
}) => {
  return (
    <figure className="flex flex-col overflow-hidden rounded-xl border border-seafoam/40 bg-white shadow-sm">
      <div className="relative aspect-[3/4] w-full bg-sky-horizon/40">
        <Image
          src={src}
          alt={label}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px"
          className="object-contain"
          quality={75}
        />
      </div>
      <figcaption className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="typo-body text-sm font-semibold text-deep-ocean">{label}</span>
        <a
          href={src}
          download={downloadName}
          aria-label={downloadAria}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-jeju-ocean px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-deep-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean focus-visible:ring-offset-2"
        >
          <span aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 3v10" />
              <path d="M6 9.5l4 4 4-4" />
              <path d="M4 16.5h12" />
            </svg>
          </span>
          {downloadLabel}
        </a>
      </figcaption>
    </figure>
  );
};

export default ShareImageCard;
