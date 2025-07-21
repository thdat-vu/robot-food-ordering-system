'use client'
import React from "react";
import {Topping} from "@/components/common/Topping";
import Button from "@/components/common/Button";
import {IoIosArrowBack} from "react-icons/io";
import {useRouter} from "next/navigation";
import img from "@/public/img.png";

export type Status = "CHO" | "ĐANGLAM" | "LAMXONG" | "ĐANGGIAO" | "GIAOXONG" | undefined;

export type ToppingProp = {
    id: string;
    url: string;
    name: string;
    price: number;
    quantity: number;
    isShoppingCart: boolean;
    status: Status;
};

const toppings: ToppingProp[] = [
    {id: '1', url: img.src, name: 'Trân châu đen', price: 6000, quantity: 1, isShoppingCart: false, status: "CHO"},
    {
        id: '2',
        url: img.src,
        name: 'Trân châu trắng',
        price: 5000,
        quantity: 2,
        isShoppingCart: false,
        status: "ĐANGGIAO"
    },
    {id: '3', url: img.src, name: 'Thạch đào', price: 4000, quantity: 1, isShoppingCart: false, status: "LAMXONG"},
    {
        id: '4',
        url: img.src,
        name: 'Thạch thủy tinh',
        price: 4000,
        quantity: 0,
        isShoppingCart: false,
        status: undefined
    },
    {id: '5', url: img.src, name: 'Thạch dừa', price: 5000, quantity: 0, isShoppingCart: false, status: undefined},
    {id: '6', url: img.src, name: 'Hạt é', price: 3000, quantity: 1, isShoppingCart: false, status: "ĐANGLAM"},
    {id: '7', url: img.src, name: 'Kem phô mai', price: 7000, quantity: 1, isShoppingCart: false, status: "ĐANGGIAO"},
    {
        id: '8',
        url: img.src,
        name: 'Trân châu hoàng kim',
        price: 6000,
        quantity: 0,
        isShoppingCart: false,
        status: undefined
    },
];

export const getStatusColor = (status: Status): string => {
    switch (status) {
        case "CHO":
            return "bg-yellow-400 text-black";
        case "ĐANGLAM":
            return "bg-blue-400 text-white";
        case "LAMXONG":
            return "bg-green-500 text-white";
        case "ĐANGGIAO":
            return "bg-purple-500 text-white";
        case "GIAOXONG":
            return "bg-gray-400 text-white";
        default:
            return "bg-gray-200 text-black";
    }
};

export const ToppingList: React.FC<{ id: string }> = ({id}) => {
    const router = useRouter();
    const infor = id !== "undefined" ? id : "!";


    return (
        <>
            <div className="flex flex-col h-screen p-4">
                <div className="bg-white rounded-xl shadow-md p-4 mb-4 relative">
                    <button
                        className="btn-circle absolute left-4 top-1/2 -translate-y-1/2"
                        onClick={() => {
                            router.back();
                        }}
                    >
                        <IoIosArrowBack className="text-black text-3xl"/>
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 text-center">Chọn Topping</h2>
                </div>

                <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {toppings.map(value => (
                        <Topping
                            key={value.id}
                            id={value.id}
                            url={value.url}
                            name={value.name}
                            price={value.price}
                            quantity={value.quantity}
                            status={value.status}
                            isShoppingCart={value.isShoppingCart}
                        />
                    ))}
                </div>
                <div className="mt-4">
                    <Button
                        className="w-full bg-green-600 text-white py-3 rounded-3xl font-semibold hover:bg-green-500"
                        content="Xác Nhận " handle={() => {
                        router.push(`/productions/order/${id}`);
                    }}/>
                </div>

            </div>
        </>

    );
};
