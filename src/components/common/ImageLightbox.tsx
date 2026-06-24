import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

interface ImageLightboxProps {
  image: string | { url: string; alt?: string; credit?: string } | null;
  onClose: () => void;
  maxHeight?: string;
  show?: boolean;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  image,
  onClose,
  maxHeight = '90vh',
  show,
}) => {
  const { t } = useTranslation();
  const isVisible = show ?? !!image;

  // 닫힐 때 호출처가 image 를 즉시 null 로 바꿔도 leave 애니메이션 동안
  // 사진이 사라지지 않도록 마지막 이미지를 잠시 유지(latch)한다.
  const [displayed, setDisplayed] = useState(image);
  useEffect(() => {
    if (image) setDisplayed(image);
  }, [image]);

  const imageUrl = displayed ? (typeof displayed === 'string' ? displayed : displayed.url) : '';
  const altText = displayed
    ? typeof displayed === 'string'
      ? 'Lightbox image'
      : displayed.alt || 'Lightbox image'
    : '';
  const credit = displayed && typeof displayed !== 'string' ? displayed.credit : undefined;

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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ImageLightbox;
