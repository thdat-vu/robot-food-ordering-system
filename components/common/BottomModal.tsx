import React, {useEffect} from "react";
import {X} from 'lucide-react';


export const BottomModal: React.FC<{
    id: string;
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
}> = ({
          id,
          title,
          children,
          isOpen,
          onClose,
          onSave
      }) => {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;


    return (
        <div
            className="fixed inset-0 z-50 overflow-hidden"
            role="dialog"
            aria-labelledby={`${id}-title`}
            aria-modal="true"
        >
            <div
                className={`fixed inset-0 bg-while transition-opacity duration-300 ${
                    isOpen ? 'opacity-50' : 'opacity-0'
                }`}
                onClick={onClose}
            />

            <div className="fixed inset-0 flex items-end justify-center p-4">
                <div
                    className={`w-full max-w-lg bg-white border border-gray-200 shadow-2xl rounded-t-xl transform transition-transform duration-300 ease-out ${
                        isOpen ? 'translate-y-0' : 'translate-y-full'
                    } `}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="flex justify-between items-center py-3 px-4 border-b border-gray-200 dark:border-neutral-700">
                        <h3
                            id={`${id}-title`}
                            className="font-bold text-gray-800 dark:text-white"
                        >
                            {title}
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="size-8 inline-flex justify-center items-center rounded-full border border-transparent
                             bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50
                              disabled:pointer-events-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600"
                            aria-label="Close"
                        >
                            <X className="size-4"/>
                        </button>
                    </div>

                    <div className="p-4 h-full">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );

};

