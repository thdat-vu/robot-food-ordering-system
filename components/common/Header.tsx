"use client";

import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {useTableContext} from "@/hooks/context/Context";
import {ShoppingCart} from "@/entites/Props/ShoppingCart";
import {SHOPPING_CARTS} from "@/key-store";
import {FaSearch} from "react-icons/fa";
import {IoOptionsOutline} from "react-icons/io5";

export const Header: React.FC<{ id: string; handeChangName: (name: string) => void }> = ({
                                                                                             id,
                                                                                             handeChangName,
                                                                                         }) => {
    const [data, setData] = useState<ShoppingCart[]>([]);
    const context = useTableContext();
    const {tableName} = context;
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
        <div className="w-full bg-white text-black shadow-sm sticky top-0 z-50">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 gap-2">
                {/* Button Profile */}
                <button
                    onClick={() => router.push(`/profile/${id}`)}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
                    aria-label="Hồ sơ"
                >
                    <IoOptionsOutline className="text-2xl sm:text-3xl"/>
                </button>

                {/* Middle Section: Title or Search */}
                {!isSearchOpen ? (
                    <>
                        <span className="text-xl sm:text-2xl md:text-3xl font-semibold whitespace-nowrap flex-1 text-center px-2 truncate">
                          {tableName === "!" ? "" : tableName}
                        </span>
                        <button
                            onClick={handleSearchClick}
                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
                            aria-label="Tìm kiếm"
                        >
                            <FaSearch className="text-gray-500 hover:text-blue-500 cursor-pointer text-xl transition-all duration-200"/>
                        </button>
                    </>
                ) : (
                    <div className="flex-1 min-w-0 px-1">
                        <div className="relative w-full">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"/>
                            <input
                                value={searchValue}
                                onChange={(e) => handleChange(e.target.value)}
                                autoFocus
                                type="search"
                                placeholder="Tìm kiếm món ăn..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           hover:border-gray-300
                           outline-none transition-all duration-200
                           bg-white shadow-sm text-sm
                           placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                )}

                {/* Cart Button */}
                <button
                    onClick={() => router.push(`/productions/order/${id}`)}
                    className="p-1.5 relative rounded-full hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
                    aria-label="Giỏ hàng"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 sm:h-7 sm:w-7"
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
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow">
                          {data.length}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};