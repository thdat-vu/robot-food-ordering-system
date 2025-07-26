import React from "react";
import {IoIosClose} from "react-icons/io";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    scrollBody?: boolean;
}

export const DialogComponation: React.FC<ModalProps> = ({isOpen, onClose, children, scrollBody = true}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-while bg-opacity-40 px-4">
            <div
                className="bg-white  max-h-[90vh]
                w-full max-w-lg rounded-xl border border-gray-200 shadow-lg flex flex-col overflow-hidden">
                <div
                    className="flex justify-between items-center py-3 px-4 border-b border-gray-200 dark:border-neutral-700">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
                    >
                        <IoIosClose className="text-2xl"/>
                    </button>
                </div>

                <div className={`px-4 ${scrollBody ? "overflow-y-auto" : ""} flex-1 py-4`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

