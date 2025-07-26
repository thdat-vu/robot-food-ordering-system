'use client';

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {IoIosArrowBack} from "react-icons/io";
import {ShoppingCartList} from "@/components/common/ShoppingCartList";


export const OrderList: React.FC<{ id: string }> = ({id}) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"food" | "ordered">("food");

    return (
        <>
            <div className="w-full bg-white text-black shadow-sm fixed top-0 left-0 z-50">
                <div className="flex items-center justify-between px-4 py-2 min-h-[60px]">
                    <button
                        className="text-3xl sm:text-3xl font-semibold whitespace-nowrap"
                        onClick={() => router.back()}
                    >
                        <IoIosArrowBack className="text-black text-3xl"/>
                    </button>
                    <h2 className="flex-1 text-center text-xl font-bold text-gray-800">
                        Gọi món của bạn
                    </h2>
                    <button
                        onClick={() => router.push(`/productions/${id}`)}
                        className="bg-gray-200 rounded-3xl h-7 w-20 text-sm text-gray-500 hover:bg-gray-400 hover:scale-110 transition"
                    >
                        Gọi thêm
                    </button>
                </div>
                <nav className="flex border border-gray-200 rounded-xl overflow-hidden mb-4">
                    {[
                        {label: "Giỏ đồ ăn", key: "food"},
                        {label: "Món đã gọi", key: "ordered"},
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key as "food" | "ordered")}
                            className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-all duration-200 ${
                                activeTab === tab.key
                                    ? "border-blue-600 text-blue-600 bg-white"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>


            <div className="flex h-full w-full flex-col p-4">


                <div className="flex-1 overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {
                            activeTab === "food" ? (
                                <ShoppingCartList/>
                            ) : (
                                <></>
                            )
                        }
                    </div>
                </div>

                {/*<div className="flex justify-center items-center pt-4 border-t font-bold text-lg text-gray-800">*/}
                {/*    <Button*/}
                {/*        className="w-full max-w-xs bg-green-600 text-white py-3 rounded-3xl font-semibold hover:bg-green-500"*/}
                {/*        content="Xác nhận"*/}
                {/*        handle={() => setOpen(true)}*/}
                {/*    />*/}
                {/*</div>*/}
            </div>

        </>
    );
};
