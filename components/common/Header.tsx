"use client";

import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {useTableContext} from "@/hooks/context/Context";
import {ShoppingCart} from "@/entites/Props/ShoppingCart";
import {SHOPPING_CARTS} from "@/key-store";
import {FaSearch} from "react-icons/fa";

export const Header: React.FC<{ id: string; handeChangName: (name: string) => void }> = ({
                                                                                             id,
                                                                                             handeChangName,
                                                                                         }) => {
    const [data, setData] = useState<ShoppingCart[]>([]);
    const {tableName} = useTableContext();
    const router = useRouter();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const temp = localStorage.getItem(SHOPPING_CARTS);
        if (temp) {
            try {
                setData(JSON.parse(temp) as ShoppingCart[]);
            } catch (e) {
                console.error("Lỗi parse shopping-carts:", e);
                setData([]);
            }
        }
    }, []);

    const handleSearchClick = () => {
        setIsSearchOpen(true);
    };

    const handleChange = (value: string) => {
        setSearchValue(value);
        handeChangName(value);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    useEffect(() => {
        if (isSearchOpen && searchValue.trim() === "") {
            timeoutRef.current = setTimeout(() => {
                setIsSearchOpen(false);
            }, 3000);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isSearchOpen, searchValue]);

    return (
        <header className="sticky top-0 z-50 w-full">
            <div className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200">
                <div className="mx-auto max-w-screen-xl px-3 sm:px-4">
                    <div className="h-14 sm:h-16 flex items-center gap-2">
                        <div className="w-10 sm:w-12 flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                            {!isSearchOpen ? (
                                <div className="flex items-center justify-center">
                                    <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate max-w-[75%] sm:max-w-[80%]">
                                        {tableName === "!" ? "" : tableName}
                                    </h1>
                                </div>
                            ) : (
                                <div className="relative w-full animate-in fade-in zoom-in-95 duration-150">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
                                    <input
                                        value={searchValue}
                                        onChange={(e) => handleChange(e.target.value)}
                                        autoFocus
                                        type="search"
                                        placeholder="Tìm kiếm món ăn..."
                                        className="
                                          w-full h-10 sm:h-11
                                          pl-9 pr-10
                                          rounded-full
                                          bg-gray-50
                                          border border-gray-200
                                          text-sm sm:text-[15px]
                                          placeholder:text-gray-400
                                          outline-none
                                          transition
                                          focus:bg-white
                                          focus:border-blue-500
                                          focus:ring-2 focus:ring-blue-200
                                        "
                                    />

                                    {searchValue.length > 0 && (
                                        <button
                                            onClick={() => {
                                                handleChange("");
                                                setTimeout(() => (timeoutRef.current && clearTimeout(timeoutRef.current)), 0);
                                            }}
                                            className="
                                              absolute right-2 top-1/2 -translate-y-1/2
                                              h-7 w-7 rounded-full
                                              grid place-items-center
                                              text-gray-500 hover:text-gray-700
                                              hover:bg-gray-200/60
                                              transition
                                            "
                                            aria-label="Xóa tìm kiếm"
                                            type="button"
                                        >
                                            <span className="text-lg leading-none">×</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                            {!isSearchOpen && (
                                <button
                                    onClick={handleSearchClick}
                                    className="
                                      h-10 w-10 sm:h-11 sm:w-11
                                      rounded-full
                                      grid place-items-center
                                      hover:bg-gray-100
                                      active:scale-95
                                      transition
                                    "
                                    aria-label="Tìm kiếm"
                                    type="button"
                                >
                                    <FaSearch className="text-gray-600 text-lg sm:text-xl"/>
                                </button>
                            )}

                            <button
                                onClick={() => router.push(`/productions/order/${id}`)}
                                className="
                                  h-10 w-10 sm:h-11 sm:w-11
                                  rounded-full
                                  grid place-items-center
                                  hover:bg-gray-100
                                  active:scale-95
                                  transition
                                  relative
                                "
                                aria-label="Giỏ hàng"
                                type="button"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 sm:h-7 sm:w-7 text-gray-800"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>

                                {data.length > 0 && (
                                    <span
                                        className="
                                          absolute -top-0.5 -right-0.5
                                          min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px]
                                          px-1
                                          rounded-full
                                          bg-red-500 text-white
                                          text-[10px] sm:text-xs font-bold
                                          grid place-items-center
                                          shadow
                                          ring-2 ring-white
                                        "
                                    >
                                        {data.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
