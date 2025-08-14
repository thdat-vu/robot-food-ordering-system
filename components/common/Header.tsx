"use client";

import React, {useEffect, useState} from "react";
import {BsFillPersonFill} from "react-icons/bs";
import {useRouter} from "next/navigation";
import {useTableContext} from "@/hooks/context/Context";
import {ShoppingCart} from "@/entites/Props/ShoppingCart";
import {SHOPPING_CARTS} from "@/key-store";
import {FaSearch} from "react-icons/fa";


export const Header: React.FC<{ id: string, handeChangName: (name: string) => void }> = ({id, handeChangName}) => {

    const [data, setData] = useState<ShoppingCart[]>([]);
    const context = useTableContext();
    const {tableName} = context;
    const router = useRouter();

    useEffect(() => {
        const temp = localStorage.getItem(SHOPPING_CARTS);
        if (temp) {
            try {
                setData(JSON.parse(temp) as ShoppingCart[]);
            } catch (e) {
                console.error("Lỗi parse shopping-carts:", e);
                setData([]);
            }
        } else {
            setData([]);
        }
    }, []);


    return (
        <div className="w-full bg-white text-black shadow-sm fixed top-0 left-0 z-50">


            <div className="flex items-center justify-between px-4 py-2 min-h-[60px]">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-3xl sm:text-3xl font-semibold whitespace-nowrap">
                        {tableName === "!" ? "" : `${tableName}`}
                    </span>
                </div>

                <div className="flex-1 max-w-sm px-4">
                    <div className="relative w-full group">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2
                           text-gray-400 group-focus-within:text-blue-500
                           transition-colors duration-200 text-sm"/>

                        <input
                            onChange={event => handeChangName(event.target.value)}
                            type="search"
                            placeholder="Tìm kiếm món ăn..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full
                                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                         hover:border-gray-300
                                         outline-none transition-all duration-200
                                         bg-white shadow-sm text-sm
                                         placeholder:text-gray-400"
                        />
                    </div>
                </div>


                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <button
                        onClick={() => router.push(`/productions/order/${id}`)}
                        className="p-2 relative rounded-full hover:bg-gray-100 transition-colors duration-200"
                        aria-label="Giỏ hàng"
                    >
                        <div className="indicator">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-7 w-7 sm:h-7 sm:w-7"
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
                                    className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                                {data.length}
                            </span>
                            )}


                        </div>
                    </button>


                    <button
                        onClick={() => router.push(`/profile/${id}`)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 ml-2"
                        aria-label="Hồ sơ"
                    >
                        <BsFillPersonFill className="text-3xl sm:text-2xl md:text-3xl"/>
                    </button>
                </div>
            </div>
        </div>
    );
};