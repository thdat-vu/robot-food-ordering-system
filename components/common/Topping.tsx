'use client'
import React from "react";
import formatCurrency from "@/unit/unit";
import {ToppingProduct} from "@/entites/respont/Topping";

type Props = {
    topping: ToppingProduct;
}

export const Topping: React.FC<Props> = ({topping}) => {


    const {id, imageUrl, price, name} = topping;



    return (
        <div
            key={id}
            className="flex w-full hover:bg-gray-400 transition delay-100  items-center
             bg-gray-200 rounded-xl p-4 mb-4">
            <img
                src={imageUrl}
                alt={name}
                className="w-16 h-16 object-cover rounded-lg mr-4 border border-gray-200"
            />

            <div className="flex-1 space-y-2">
                <div className="font-semibold text-base text-black">{name} ({formatCurrency(price)})</div>
            </div>
        </div>
    );
};
