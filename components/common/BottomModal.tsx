import React, {useEffect} from "react";
import {X} from "lucide-react";

export const BottomModal: React.FC<{
    id: string;
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
}> = ({id, title, children, isOpen, onClose}) => {

    // lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // ESC close
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-labelledby={`${id}-title`}
            aria-modal="true"
        >
            {/* OVERLAY: tối + blur + click đóng */}
            <div
                className={`
                    absolute inset-0
                    bg-black/40
                    backdrop-blur-[2px]
                    transition-opacity duration-200
                    ${isOpen ? "opacity-100" : "opacity-0"}
                `}
                onClick={onClose}
            />

            {/* SHEET */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-4">
                <div
                    className={`
                        w-full max-w-lg
                        bg-white
                        border border-gray-200
                        shadow-2xl
                        rounded-t-2xl
                        overflow-hidden
                        transform transition-transform duration-200 ease-out
                        ${isOpen ? "translate-y-0" : "translate-y-full"}
                    `}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3
                            id={`${id}-title`}
                            className="font-bold text-gray-900"
                        >
                            {title}
                        </h3>

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                h-9 w-9
                                inline-flex items-center justify-center
                                rounded-full
                                bg-gray-100 hover:bg-gray-200
                                active:scale-95 transition
                            "
                            aria-label="Close"
                        >
                            <X className="h-4 w-4 text-gray-700"/>
                        </button>
                    </div>

                    {/* Body: scroll trong modal */}
                    <div className="p-4 max-h-[80vh] overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
