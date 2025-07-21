'use client'
import React from "react";
import img from "@/public/img.png";
import {ProductionCard} from "@/components/common/ProductionCard";

const products = [
    {id: '1', name: "Cà phê", price: "35.000", url: img.src, sale: 0},
    {id: '2', name: "Matcha Latte", price: "45.000", url: img.src, sale: 10},
    {id: '3', name: "Trà Đào", price: "30.000", url: img.src, sale: 5},
    {id: '4', name: "Cà phê", price: "35.000", url: img.src, sale: 0},
    {id: '5', name: "Matcha Latte", price: "45.000", url: img.src, sale: 10},
    {id: '6', name: "Trà Đào", price: "30.000", url: img.src, sale: 5},
    {id: '7', name: "Cà phê", price: "35.000", url: img.src, sale: 0},
    {id: '8', name: "Matcha Latte", price: "45.000", url: img.src, sale: 10},
    {id: '9', name: "Trà Đào", price: "30.000", url: img.src, sale: 5},
];

export const Productions: React.FC = () => {
    return (
        <div className="flex flex-wrap gap-4 justify-center p-4">
            {products.map((item, index) => (
                <ProductionCard
                    key={index}
                    name={item.name}
                    price={item.price}
                    url={item.url}
                    sale={item.sale}
                    idProduction={item.id}
                />
            ))}
        </div>
    );
};
