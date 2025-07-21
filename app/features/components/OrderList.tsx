'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ToppingProp } from "@/app/features/components/ToppingList";
import { Topping } from "@/components/common/Topping";
import Button from "@/components/common/Button";
import { IoIosArrowBack } from "react-icons/io";
import { ConfimOrder, pd } from "@/app/features/components/ConfimOrder";
import img from "@/public/img.png";

const productionOrder: ToppingProp[] = [
    { id: "1", url: img.src, name: "Trân châu đen", price: 5000, quantity: 2, isShoppingCart: false, status: undefined },
    { id: "2", url: img.src, name: "Thạch dừa", price: 4000, quantity: 1, isShoppingCart: false, status: undefined },
    { id: "3", url: img.src, name: "Trân châu trắng", price: 6000, quantity: 3, isShoppingCart: false, status: undefined },
    { id: "4", url: img.src, name: "Thạch cà phê", price: 3000, quantity: 1, isShoppingCart: false, status: undefined },
    { id: "5", url: img.src, name: "Kem phô mai", price: 7000, quantity: 1, isShoppingCart: false, status: undefined },
    { id: "6", url: img.src, name: "Không topping", price: 0, quantity: 0, isShoppingCart: false, status: undefined },
];

const production: ToppingProp[] = [
    { id: "15", url: img.src, name: "Trà sữa", price: 4000, quantity: 0, isShoppingCart: true, status: "ĐANGLAM" },
    { id: "5", url: img.src, name: "Nước dừa", price: 5000, quantity: 0, isShoppingCart: true, status: "ĐANGGIAO" },
    { id: "6", url: img.src, name: "Cà phê", price: 5000, quantity: 0, isShoppingCart: true, status: "CHO" },
    { id: "17", url: img.src, name: "Trà sữa", price: 4000, quantity: 0, isShoppingCart: true, status: "CHO" },
    { id: "11", url: img.src, name: "Nước dừa", price: 5000, quantity: 0, isShoppingCart: true, status: "LAMXONG" },
    { id: "12", url: img.src, name: "Cà phê", price: 5000, quantity: 0, isShoppingCart: true, status: "GIAOXONG" },
    { id: "18", url: img.src, name: "Trà sữa", price: 4000, quantity: 0, isShoppingCart: true, status: "GIAOXONG" },
    { id: "13", url: img.src, name: "Nước dừa", price: 5000, quantity: 0, isShoppingCart: true, status: "CHO" },
    { id: "14", url: img.src, name: "Cà phê", price: 5000, quantity: 0, isShoppingCart: true, status: "CHO" },
];

export const Pd: pd[] = [
    { name: "Nước dừa", price: "20.000" },
    { name: "Trà sữa", price: "50.000" },
    { name: "Nước cam", price: "45.000" },
    { name: "Trà đào", price: "39.000" },
    { name: "Nước vải x2", price: "70.000" },
];

export const Tp: pd[] = [
    { name: "Topping trà sữa", price: "20.000" },
    { name: "Topping trà đào", price: "50.000" },
];

export const OrderList: React.FC<{ id: string }> = ({ id }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"food" | "ordered">("food");
    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            <div className="flex flex-col h-screen p-4">
                <div className="flex bg-white rounded-xl shadow-md p-4 mb-4 relative items-center">
                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                        onClick={() => router.back()}
                    >
                        <IoIosArrowBack className="text-black text-3xl" />
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
                        { label: "Giỏ đồ ăn", key: "food" },
                        { label: "Món đã gọi", key: "ordered" },
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

                <div className="flex-1 overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(activeTab === "food" ? productionOrder : production).map((value) => (
                            <Topping key={value.id} {...value} />
                        ))}
                    </div>
                </div>

                <div className="flex justify-center items-center pt-4 border-t font-bold text-lg text-gray-800">
                    <Button
                        className="w-full max-w-xs bg-green-600 text-white py-3 rounded-3xl font-semibold hover:bg-green-500"
                        content="Xác nhận"
                        handle={() => setOpen(true)}
                    />
                </div>
            </div>

            <ConfimOrder data={Pd} topping={Tp} id={id} isOpen={open} onClose={() => setOpen(false)} />
        </>
    );
};
