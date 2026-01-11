type Props = {
  value: string;
  suggestions: string[];
  onChange: (val: string) => void;
};

export const ResponsePopover: React.FC<Props> = ({
  value,
  suggestions,
  onChange,
}) => {
  if (!suggestions?.length) return null;

  return (
    console.log("Rendering ResponsePopover with suggestions:", suggestions),
    (
      <div className="flex flex-wrap gap-1.5">
        {suggestions.slice(0, 3).map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(s)}
            className={`px-2 py-1 text-[10px] rounded-lg font-medium transition-colors
            ${
              value === s
                ? "bg-blue-100 text-blue-800"
                : "bg-blue-50 hover:bg-blue-100 text-blue-700"
            }`}
            title={s}
          >
            {s.length > 20 ? `${s.slice(0, 20)}...` : s}
          </button>
        ))}
      </div>
    )
  );
};
