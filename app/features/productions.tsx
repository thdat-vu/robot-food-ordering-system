'use client'
import React, {memo} from "react";
import {ProductionCard} from "@/components/common/ProductionCard";
import {Production} from "@/entites/respont/Production";

type Prop = {
    products: Production[];
}

export const ProductionsList: React.FC<Prop> = memo(({products}) => {
    return (
        <div className="grid mt-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((item) => (
                <ProductionCard
                    key={item.id}
                    name={item.productName}
                    url={item.imageUrl}
                    idProduction={item.id}
                />
            ))}
        </div>
    );
});
