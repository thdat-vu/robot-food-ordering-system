import React, {useState, useRef, useEffect, useMemo} from "react";
import {Catagory} from "@/entites/respont/Catagory";
import {ChevronDown, Check} from "lucide-react";

type Props = {
    category: Catagory[];
    handleChange: (category: string) => void;
    selectedCategory?: string;
};

export const CategoryList: React.FC<Props> = ({
                                                  category,
                                                  handleChange,
                                                  selectedCategory,
                                              }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (categoryName: string) => {
        handleChange(categoryName);
        setIsOpen(false);
    };

    const selectedCategoryName = useMemo(() => {
        return category.find((c) => c.name === selectedCategory)?.name || "Tất cả danh mục";
    }, [category, selectedCategory]);

    return (
        <div className="w-full">
            <div ref={dropdownRef} className="relative">
                {/* Trigger */}
                <button
                    type="button"
                    onClick={() => setIsOpen((v) => !v)}
                    className={`
            w-full h-11 sm:h-12
            px-4 sm:px-5
            flex items-center justify-between gap-3
            rounded-2xl
            border
            bg-white/90 backdrop-blur
            shadow-sm
            transition-all duration-200
            hover:shadow-md
            active:scale-[0.99]
            ${isOpen
                        ? "border-blue-500 ring-2 ring-blue-100"
                        : "border-gray-200 hover:border-gray-300"}
          `}
                >
          <span className="min-w-0 flex-1 text-left text-sm sm:text-[15px] font-semibold text-gray-900 truncate">
            {selectedCategoryName}
          </span>

                    <span
                        className={`
              h-8 w-8 flex items-center justify-center
              rounded-full
              transition-colors
              ${isOpen ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"}
            `}
                    >
            <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </span>
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <div
                        className="
              absolute z-50 w-full mt-2
              rounded-2xl
              border border-gray-200
              bg-white
              shadow-xl
              overflow-hidden
            "
                    >
                        {/* Header nhỏ (tuỳ chọn) */}
                        <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                            <p className="text-xs sm:text-sm font-semibold text-gray-700">
                                Chọn danh mục
                            </p>
                        </div>

                        {/* List */}
                        <div className="max-h-[280px] overflow-y-auto py-1">
                            {category.length === 0 ? (
                                <div className="px-5 py-10 text-center">
                                    <div
                                        className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-gray-100 grid place-items-center">
                                        <span className="text-gray-400 text-xl">#</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Không có danh mục nào</p>
                                </div>
                            ) : (
                                category.map((c) => {
                                    const active = selectedCategory === c.name;

                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => handleSelect(c.name)}
                                            className={`
                        w-full
                        px-4 sm:px-5 py-2.5
                        flex items-center justify-between gap-3
                        text-left
                        transition
                        ${active
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-800 hover:bg-blue-50"}
                      `}
                                        >
                      <span className="text-sm sm:text-[15px] font-medium truncate">
                        {c.name}
                      </span>

                                            {active ? (
                                                <span
                                                    className="h-7 w-7 rounded-full bg-white/20 grid place-items-center">
                          <Check className="h-4 w-4 text-white"/>
                        </span>
                                            ) : (
                                                <span
                                                    className="h-7 w-7 rounded-full bg-gray-100/70 grid place-items-center opacity-0 group-hover:opacity-100"/>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer nhỏ (tuỳ chọn) */}
                        <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-white">
                            <button
                                type="button"
                                onClick={() => {
                                    handleSelect("");
                                }}
                                className="
                  w-full h-10
                  rounded-xl
                  border border-gray-200
                  text-sm font-semibold text-gray-700
                  hover:bg-gray-50
                  transition
                "
                            >
                                Reset về tất cả
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
