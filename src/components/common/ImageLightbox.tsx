import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ImageLightboxProps {
  image: string | { url: string; alt?: string };
  onClose: () => void;
  variant?: 'simple' | 'animated';
  maxHeight?: string;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  image,
  onClose,
  maxHeight = '90vh'
}) => {
  const imageUrl = typeof image === 'string' ? image : image.url;
  const altText = typeof image === 'string' ? 'Lightbox image' : (image.alt || 'Lightbox image');

  return (
    <Transition appear show={true} as={Fragment}>
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

        <div className="fixed inset-0 overflow-y-auto">
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
              <Dialog.Panel className="relative max-w-full transform overflow-hidden rounded-lg shadow-2xl transition-all">
                <img
                  src={imageUrl}
                  alt={altText}
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight }}
                />

                {/* Close button inside panel for better focus management */}
                <button
                  className="absolute top-4 right-4 text-white text-3xl font-light hover:text-jeju-ocean transition-colors bg-black/20 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm"
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
