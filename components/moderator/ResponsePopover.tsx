import { MessageSquare, RefreshCw } from "lucide-react";
import React from "react";

type Props = {
  value: string;
  suggestions: string[];
  onChange: (val: string) => void;
  onGenerate?: () => Promise<void> | void;
};

export const ResponsePopover: React.FC<Props> = ({
  value,
  suggestions,
  onChange,
  onGenerate,
}) => {
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const popoverRef = React.useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  if (!suggestions?.length) return null;

  const updatePos = React.useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();

    const W = 320; // w-80 = 20rem = 320px
    const GAP = 8;

    // đặt popover "lên trên" button
    const top = r.top - GAP;
    const left = Math.min(r.left, window.innerWidth - W - 12);

    setPos({ top, left });
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);

    if (onGenerate) await onGenerate();
    else await new Promise((resolve) => setTimeout(resolve, 800));

    setIsGenerating(false);
    updatePos();
    setIsOpen(true);
  };

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
  };

  React.useEffect(() => {
    if (!isOpen) return;

    const onAnyScroll = () => updatePos();
    window.addEventListener("scroll", onAnyScroll, true);
    window.addEventListener("resize", onAnyScroll);

    return () => {
      window.removeEventListener("scroll", onAnyScroll, true);
      window.removeEventListener("resize", onAnyScroll);
    };
  }, [isOpen, updatePos]);

  // ✅ click ra ngoài để đóng (nhưng click trong popover thì KHÔNG đóng)
  React.useEffect(() => {
    if (!isOpen) return;

    const onDown = (e: MouseEvent) => {
      const btn = btnRef.current;
      const pop = popoverRef.current;
      const target = e.target as Node;

      // click vào button => không đóng
      if (btn && btn.contains(target)) return;

      // ✅ click vào popover => không đóng
      if (pop && pop.contains(target)) return;

      setIsOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200/50 transition-all active:scale-95 disabled:opacity-50 shadow-sm hover:shadow-md"
      >
        <MessageSquare size={14} className="text-purple-600" />
        <span className="text-[11px] font-bold text-purple-700">
          {isGenerating ? "Đang tạo gợi ý..." : "Gợi ý AI"}
        </span>
        {isGenerating && (
          <RefreshCw size={12} className="text-purple-600 animate-spin" />
        )}
      </button>

      {isOpen && (
        <div
          ref={popoverRef} // ✅ gắn ref để click-inside không bị đóng
          className="fixed z-[9999] w-80"
          style={{
            top: pos.top,
            left: pos.left,
            transform: "translateY(-100%)",
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-purple-600" />
                <span className="text-xs font-bold text-gray-700">
                  Gợi ý từ AI
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, i) => (
                <button
                  type="button"
                  key={i}
                  // ✅ dùng mousedown để chắc chắn ăn trước handler đóng
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(suggestion);
                  }}
                  className="w-full text-left p-3 text-xs bg-gradient-to-br from-gray-50 to-purple-50/30 hover:from-purple-50 hover:to-blue-50 rounded-xl transition-all border border-gray-200 hover:border-purple-300 hover:shadow-md group"
                >
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-600 text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed group-hover:text-gray-900 flex-1">
                      {suggestion}
                    </span>
                  </div>

                  {value === suggestion && (
                    <div className="mt-2 text-[10px] font-bold text-purple-600">
                      Đang chọn
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
