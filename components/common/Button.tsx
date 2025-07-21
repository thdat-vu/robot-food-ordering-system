type Props = {
    content: string;
    handle: () => void;
    className?: string;
};

export default function Button({content, handle, className = ""}: Props) {
    return (
        <button
            onClick={handle}
            className={`${className}`}
        >
            {content}
        </button>
    );
}
