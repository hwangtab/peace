import React from 'react';
import CopyButton from '@/components/common/CopyButton';

interface PromoTextBlockProps {
  /** 블록 제목 (예: "피드용 (긴 글)") */
  label: string;
  /** 복사·표시할 본문 (줄바꿈은 \n) */
  text: string;
  /** 복사 버튼 기본 라벨 */
  copyLabel: string;
  /** 복사 직후 라벨 */
  copiedLabel: string;
}

/**
 * PromoTextBlock — 복사용 홍보글 한 버전. 제목 + [복사하기] 버튼을 상단에 두고,
 * 아래에 실제 게시될 모습 그대로(줄바꿈 보존) 본문을 보여준다.
 */
const PromoTextBlock: React.FC<PromoTextBlockProps> = ({ label, text, copyLabel, copiedLabel }) => {
  return (
    <div className="rounded-xl border border-seafoam/40 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-jeju-ocean">{label}</h3>
        <CopyButton text={text} label={copyLabel} copiedLabel={copiedLabel} />
      </div>
      <p className="typo-body whitespace-pre-line break-words text-sm leading-relaxed text-coastal-gray">
        {text}
      </p>
    </div>
  );
};

export default PromoTextBlock;
