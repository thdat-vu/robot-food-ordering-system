"use client";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckCircle, X } from "lucide-react";

interface TableStatusChangeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  statusText: string;
  tableName: string;
}

export default function TableStatusChangeDialog({
  open,
  onClose,
  onConfirm,
  statusText,
  tableName,
}: TableStatusChangeDialogProps) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        {/* Modal */}
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Title */}
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Confirm Status Change
                </Dialog.Title>

                {/* Body */}
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Do you want to change <span className="font-semibold">{tableName}</span>{" "}
                    to status <span className="text-green-600 font-medium">{statusText}</span>?
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center shadow-md"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Confirm
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
