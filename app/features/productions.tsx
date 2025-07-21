"use client";
import React from "react";
import img from "@/public/img.png";
import { ProductionCard } from "@/components/common/ProductionCard";

const products = [
    { name: "Cà phê", price: "35.000", url: img.src, sale: 0 },
    { name: "Matcha Latte", price: "45.000", url: img.src, sale: 10 },
    { name: "Trà Đào", price: "30.000", url: img.src, sale: 5 },
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
                />
            ))}
        </div>
    );
};
