'use client'
import React, {useState} from "react";
import {Status, ToppingProp} from "@/app/features/components/ToppingList";

export const getStatusColor = (status: Status) => {
    switch (status) {
        case "CHO":
            return "bg-gray-300 text-gray-800";
        case "ĐANGLAM":
            return "bg-yellow-300 text-yellow-800";
        case "LAMXONG":
            return "bg-green-300 text-green-800";
        case "ĐANGGIAO":
            return "bg-blue-300 text-blue-800";
        case "GIAOXONG":
            return "bg-purple-300 text-purple-800";
        default:
            return "bg-gray-200 text-gray-700";
    }
};


export const Topping: React.FC<ToppingProp> = ({id, name, price, quantity, url, isShoppingCart, status}) => {
    const [quanlity, setQuanlity] = useState<number>(quantity);

    const handleAdd = () => setQuanlity(quanlity + 1);
    const deduct = () => {
        if (quanlity > 0) setQuanlity(quanlity - 1);
    };

    return (
        <div
            key={id}
            className="flex w-96 mb-1 hover:bg-gray-400 transition delay-100  items-center
             bg-gray-200 rounded-xl p-4 mb-4">
            <img
                src={url}
                alt={name}
                className="w-16 h-16 object-cover rounded-lg mr-4 border border-gray-200"
            />

            <div className="flex-1 space-y-2">
                <div className="font-semibold text-base text-black">{name}</div>

                {!isShoppingCart ? (
                    <>
                        <div className="flex justify-between text-sm text-black">
                            <span>Số lượng: {quanlity}</span>
                            <span>{price * quanlity} đ</span>
                        </div>

                        <div className="flex justify-end space-x-5">
                            <button
                                className="text-red-500 text-2xl font-bold hover:scale-110 transition-transform"
                                onClick={deduct}
                            >
                                -
                            </button>
                            <button
                                className="text-green-600 text-2xl font-bold hover:scale-110 transition-transform"
                                onClick={handleAdd}
                            >
                                +
                            </button>
                        </div>
                    </>
                ) : (

                    isShoppingCart && status && (
                        <div
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(status)}`}>
                            {status}
                        </div>
                    )
                )}

            </div>
        </div>
    )
        ;
};
