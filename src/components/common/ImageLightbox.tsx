import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';

interface ImageLightboxProps {
  image: string | { url: string; alt?: string } | null;
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
  const isVisible = show ?? !!image;
  const imageUrl = image ? (typeof image === 'string' ? image : image.url) : '';
  const altText = image ? (typeof image === 'string' ? 'Lightbox image' : (image.alt || 'Lightbox image')) : '';

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
                  <Image
                    src={imageUrl}
                    alt={altText}
                    fill
                    sizes="90vw"
                    className="object-contain rounded-lg"
                    loading="eager"
                  />
                </div>

                {/* Close button inside panel for better focus management */}
                <button
                  className="absolute top-4 right-4 text-white text-3xl font-light hover:text-jeju-ocean transition-colors bg-black/20 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-golden-sun"
                  onClick={onClose}
                  aria-label="Close lightbox"
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
