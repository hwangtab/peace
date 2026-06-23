import { useState } from 'react';

interface AdminPressCardPreviewProps {
  title: string;
  publisher: string;
  date: string;
  description: string;
  imageUrl: string;
}

// 언론보도 편집 패널에서 공개 기사 카드가 실제로 어떻게 보일지 그대로 미리 보여준다.
// 공개 PressCard(src/components/press/PressPage.tsx)의 레이아웃을 폼 값 기준으로 재현.
// 대표 이미지 로드 실패(.jpeg→.jpg 폴백 포함) 시 이미지 영역만 숨긴다.
export default function AdminPressCardPreview({
  title,
  publisher,
  date,
  description,
  imageUrl,
}: AdminPressCardPreviewProps) {
  // imageUrl이 바뀌면 부모가 key로 remount하므로(아래 AdminCollectionPage) 초기값만 받으면 된다.
  const [imgSrc, setImgSrc] = useState(imageUrl || '');

  const hasContent = title || publisher || date || description || imgSrc;
  if (!hasContent) return null;

  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-coastal-gray">공개 카드 미리보기</span>
      <article className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-deep-ocean/5">
        {imgSrc && (
          <div className="relative h-48 overflow-hidden bg-ocean-sand/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={title || '대표 이미지'}
              className="h-full w-full object-cover"
              onError={() => {
                if (imgSrc.endsWith('.jpeg')) setImgSrc(imgSrc.replace('.jpeg', '.jpg'));
                else setImgSrc('');
              }}
            />
          </div>
        )}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-coastal-gray">
            {publisher && <span>{publisher}</span>}
            {date && <span>{date}</span>}
          </div>
          <h3 className="font-display text-lg font-bold text-deep-ocean">{title || '제목 없음'}</h3>
          {description && (
            <p className="mt-2 flex-1 whitespace-pre-line break-words text-sm text-coastal-gray">
              {description}
            </p>
          )}
        </div>
      </article>
    </div>
  );
}
