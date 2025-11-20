"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

export default function ExpandableSearch({
  placeholder = "Tìm kiếm bàn của bạn...",
  onSearch,
  trigger = "icon", // "icon" hoặc "button" hoặc tự custom
}: {
  placeholder?: string;
  onSearch?: (query: string) => void;
  trigger?: "icon" | "button" | React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus khi mở
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Đóng khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Nút kích hoạt – chỉ hiện khi chưa mở */}
      {!isOpen && (
        <div className="flex justify-center">
          {trigger === "icon" && (
            <button
              onClick={() => setIsOpen(true)}
              className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
              aria-label="Mở tìm kiếm"
            >
              <Search className="w-6 h-6" />
            </button>
          )}
          {trigger === "button" && (
            <button
              onClick={() => setIsOpen(true)}
              className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 text-white font-medium hover:bg-white/20 transition"
            >
              Tìm kiếm bàn ăn...
            </button>
          )}
          {typeof trigger !== "string" && trigger}
        </div>
      )}

      {/* Thanh search – chỉ hiện khi isOpen = true */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 animate-in fade-in duration-300">
          <div
            className="relative w-full max-w-2xl animate-in slide-in-from-top duration-500"
            onClick={(e) => e.stopPropagation()} // ngăn đóng khi click vào thanh
          >
            <div className="flex items-center bg-white/10 backdrop-blur-2xl rounded-full px-6 py-4 shadow-2xl border border-white/30">
              <Search className="w-6 h-6 text-purple-200 mr-4 flex-shrink-0" />

              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder-purple-200/70 text-lg font-medium"
                autoFocus
              />

              {query && (
                <button
                  onClick={handleClear}
                  className="ml-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition hover:scale-110"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="ml-4 text-purple-200 hover:text-white transition"
              >
                ESC
              </button>
            </div>

            {/* Glow */}
            <div className="absolute inset-x-0 -bottom-10 h-20 bg-gradient-to-t from-purple-500/20 to-transparent blur-3xl" />
          </div>
        </div>
      )}
    </div>
  );
}
