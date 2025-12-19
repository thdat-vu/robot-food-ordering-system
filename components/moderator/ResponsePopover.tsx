"use client";
import React, { useState, useRef, useEffect } from "react";
import { Lightbulb, Sparkles } from "lucide-react";

type PopoverProps = {
  suggestions: string[];
  onSelect: (val: string) => void;
};

export const ResponsePopover: React.FC<PopoverProps> = ({
  suggestions,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Đóng khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all
          ${
            isOpen
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          }`}
      >
        <Lightbulb className={`w-3.5 h-3.5 ${isOpen ? "animate-pulse" : ""}`} />
        Gợi ý AI
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full right-0 mb-3 w-72 origin-bottom-right animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header gợi ý */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-100" />
              <span className="text-white text-[11px] font-bold uppercase tracking-wider">
                Gợi ý phản hồi nhanh
              </span>
            </div>

            {/* List gợi ý */}
            <div className="p-2 max-h-[300px] overflow-y-auto">
              {suggestions.map((text, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelect(text);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-3 hover:bg-blue-50 rounded-xl transition-colors group mb-1 last:mb-0"
                >
                  <p className="text-xs text-gray-600 group-hover:text-blue-700 leading-relaxed italic">
                    "{text}"
                  </p>
                </button>
              ))}
            </div>

            {/* Mũi tên trỏ xuống */}
            <div className="absolute -bottom-1 right-6 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
};
