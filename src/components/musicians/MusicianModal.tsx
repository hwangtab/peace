import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Musician } from '../../types/musician';

interface MusicianModalProps {
  musician: Musician;
  isOpen: boolean;
  onClose: () => void;
}

const MusicianModal = ({ musician, isOpen, onClose }: MusicianModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="relative">
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="absolute right-0 top-0 p-2 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Content */}
                  <div className="mt-2">
                    {/* Image */}
                    {musician.imageUrl && (
                      <div className="relative w-full aspect-[3/2] mb-6 rounded-lg overflow-hidden">
                        <img
                          src={musician.imageUrl}
                          alt={musician.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Header */}
                    <Dialog.Title
                      as="h3"
                      className="text-3xl font-medium leading-6 text-gray-900 mb-4 font-serif"
                    >
                      {musician.name}
                    </Dialog.Title>

                    {/* Description */}
                    <div className="mt-4 space-y-4">
                      <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {musician.description}
                      </p>
                    </div>

                    {/* Track */}
                    {musician.trackTitle && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          수록곡
                        </h4>
                        <p className="text-gray-600">{musician.trackTitle}</p>
                      </div>
                    )}

                    {/* Instagram Links */}
                    {musician.instagramUrls.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          SNS
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {musician.instagramUrls.map((url, idx) => {
                            const username = url.split('instagram.com/')[1]?.replace(/\/$/, '') || url;
                            return (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors duration-200"
                              >
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                @{username}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MusicianModal;
