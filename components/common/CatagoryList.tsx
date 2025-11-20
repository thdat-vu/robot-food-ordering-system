// import React from "react";
// import {Catagory} from "@/entites/respont/Catagory";
//
// type Props = {
//     category: Catagory[];
//     handleChange: (category: string) => void;
//     selectedCategory?: string;
// }
//
// export const CategoryList: React.FC<Props> = ({
//                                                   category,
//                                                   handleChange,
//                                                   selectedCategory
//                                               }) => {
//
//
//     return (
//         <div className="w-full pt-[10px] rounded-b-lg shadow-lg p-1 sm:p-6">
//             <div className="overflow-x-auto">
//                 <div className="flex flex-nowrap gap-2 sm:gap-3">
//                     {category.map((c) => (
//                         <label key={c.id} className="cursor-pointer">
//                             <input
//                                 type="radio"
//                                 name="category-filter"
//                                 value={c.name}
//                                 checked={selectedCategory === c.name}
//                                 onChange={() => handleChange(c.name)}
//                                 className="sr-only"
//                             />
//                             <div className={`
//                                               relative px-5 py-2 ml-1 mt-1 sm:px-6 sm:py-3
//                                               text-sm sm:text-base font-medium
//                                               rounded-full border-2 transition-all duration-200
//                                               select-none active:scale-95 whitespace-nowrap
//                                               ${selectedCategory === c.name
//                                 ? 'bg-blue-600 text-white border-blue-600 shadow-md'
//                                 : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-green-300 hover:text-green-700'
//                             }
//                                     `}>
//                                 {c.name}
//                                 {selectedCategory === c.name && (
//                                     <div
//                                         className="absolute inset-0 bg-blue-600 rounded-full animate-pulse opacity-20"></div>
//                                 )}
//                             </div>
//                         </label>
//                     ))}
//                 </div>
//             </div>
//
//             {category.length === 0 && (
//                 <div className="text-center py-8 text-gray-500">
//                     <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor"
//                          viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//                               d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
//                     </svg>
//                     <p className="text-sm">Không có danh mục nào</p>
//                 </div>
//             )}
//         </div>
//     );
// };

import React, {useState, useRef, useEffect} from "react";
import {Catagory} from "@/entites/respont/Catagory";
import {ChevronDown} from "lucide-react";

type Props = {
    category: Catagory[];
    handleChange: (category: string) => void;
    selectedCategory?: string;
}

export const CategoryList: React.FC<Props> = ({
                                                  category,
                                                  handleChange,
                                                  selectedCategory
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

    const selectedCategoryName = category.find(c => c.name === selectedCategory)?.name || "Tất cả danh mục";

    return (
        <div className="w-full pt-[10px] rounded-b-lg shadow-lg p-1 sm:p-6">
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        w-full px-4 py-3 sm:px-6 sm:py-3.5
                        flex items-center justify-between
                        text-sm sm:text-base font-medium
                        rounded-lg border-2 transition-all duration-200
                        ${isOpen
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }
                    `}
                >
                    <span className="truncate">{selectedCategoryName}</span>
                    <ChevronDown
                        className={`w-5 h-5 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {isOpen && (
                    <div
                        className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-[300px] overflow-y-auto">
                        {category.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                                </svg>
                                <p className="text-sm">Không có danh mục nào</p>
                            </div>
                        ) : (
                            <div className="py-1">
                                {category.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => handleSelect(c.name)}
                                        className={`
                                            w-full px-4 py-2.5 sm:px-6 sm:py-3
                                            text-left text-sm sm:text-base font-medium
                                            transition-colors duration-150
                                            ${selectedCategory === c.name
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                        }
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{c.name}</span>
                                            {selectedCategory === c.name && (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                          clipRule="evenodd"/>
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};