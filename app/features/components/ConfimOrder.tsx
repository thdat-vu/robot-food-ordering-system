import React from "react";
import {DialogComponation} from "@/components/common/Dialog";
import Button from "@/components/common/Button";

export interface pd {
    name: string;
    price: string;
}

type ConfimOrderProps = {
    data: pd[];
    topping: pd[];
    id: string;
    isOpen: boolean;
    onClose: () => void;
}
export const ConfimOrder: React.FC<ConfimOrderProps> = ({data, topping, onClose, isOpen, id}) => {
    return (
        <>
            <DialogComponation scrollBody={false} isOpen={isOpen} onClose={onClose}>
                <div className="space-y-3">
                    <ul className="divide-y divide-gray-200">
                        {data.map((item, idx) => (
                            <li key={idx} className="flex justify-between py-2">
                                <span className="font-medium text-gray-700">{item.name}</span>
                                <span className="text-gray-900 font-semibold">
                                        {Number(item.price).toLocaleString("vi-VN")} ₫
                                    </span>
                            </li>
                        ))}
                    </ul>
                    <div>Topping</div>
                    <ul className="divide-y divide-gray-200">
                        {topping.map((item, idx) => (
                            <li key={idx} className="flex justify-between py-2">
                                <span className="font-medium text-gray-700">{item.name}</span>
                                <span className="text-gray-900 font-semibold">
                                        {Number(item.price).toLocaleString("vi-VN")} ₫
                                    </span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-center items-center pt-4 border-t font-bold text-lg text-gray-800">
                        <Button
                            className="bg-green-600 w-80 sm:w-96 transition-all duration-300 ease-in-out
                                         transform hover:scale-105 rounded-3xl active:scale-110
                                         px-8 py-4 text-lg"
                            content="Xác Nhận" handle={() => {
                        }}/>
                    </div>
                </div>
            </DialogComponation>
        </>
    )
}