import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ConfirmDialogProps {
  show: boolean;
  /** 확인 질문 문구 */
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** 삭제/처리 진행 중 — 버튼 비활성 및 바깥 닫기 차단 */
  busy?: boolean;
}

/**
 * 접근성 있는 확인 모달(window.confirm 대체).
 * Headless UI Dialog 가 focus trap·ESC·바깥 클릭 닫기·초기 포커스를 처리한다.
 * 라벨/문구는 호출측에서 i18n 으로 주입한다.
 */
export default function ConfirmDialog({
  show,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy = false,
}: ConfirmDialogProps) {
  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={busy ? () => {} : onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm transform rounded-2xl bg-white p-6 shadow-xl transition-all">
              <Dialog.Title className="text-base font-semibold text-deep-ocean">
                {message}
              </Dialog.Title>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  className="rounded-lg border border-coastal-gray px-4 py-1.5 text-sm font-semibold text-coastal-gray transition hover:bg-seafoam focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={busy}
                  className="rounded-lg border border-red-400 px-4 py-1.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50"
                >
                  {confirmLabel}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
