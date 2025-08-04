import React, {useEffect, useRef, useState} from "react";

type AlertType = "success" | "error";

type Props = {
    message: string;
    type?: AlertType;
    duration?: number;
};

export const Alert: React.FC<Props> = ({
                                           message,
                                           type = "success",
                                           duration = 2000
                                       }) => {
    const [visible, setVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(true);
    const alertRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const showTimer = setTimeout(() => setVisible(true), 100);

        const hideTimer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => setShouldRender(false), 400);
        }, duration);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [duration]);

    if (!shouldRender) return null;

    const getAlertStyles = () => {
        switch (type) {
            case "success":
                return {
                    bg: "bg-green-500",
                    text: "text-white",
                    icon: "M5 13l4 4L19 7",
                    shadow: "shadow-green-500/25"
                };
            case "error":
                return {
                    bg: "bg-red-500",
                    text: "text-white",
                    icon: "M6 18L18 6M6 6l12 12",
                    shadow: "shadow-red-500/25"
                };
            default:
                return {
                    bg: "bg-green-500",
                    text: "text-white",
                    icon: "M5 13l4 4L19 7",
                    shadow: "shadow-green-500/25"
                };
        }
    };

    const styles = getAlertStyles();

    return (
        <div
            ref={alertRef}
            className={`
                fixed top-16 left-3 right-3 z-[99999]
                mx-auto max-w-xs
                px-3 py-2.5 rounded-xl
                flex items-center gap-2.5
                transform transition-all duration-400 ease-out
                ${visible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 -translate-y-3 scale-95"
            }
                ${styles.bg} ${styles.text} ${styles.shadow}
                shadow-lg
            `}
        >
            <div className="flex-shrink-0">
                <svg
                    className="w-4 h-4 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={styles.icon}
                    />
                </svg>
            </div>

            <div className="flex-1 text-xs font-medium leading-snug">
                {message}
            </div>
        </div>
    );
};