import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Musician } from '../../types/musician';
import { extractInstagramUsername } from '../../utils/instagram';
import InstagramIcon from '../icons/InstagramIcon';

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
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
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
                      <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap text-pretty">
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
                          {musician.instagramUrls.map((url) => {
                            const username = extractInstagramUsername(url);
                            return (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors duration-200"
                              >
                                <InstagramIcon className="w-4 h-4 mr-1" />
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
