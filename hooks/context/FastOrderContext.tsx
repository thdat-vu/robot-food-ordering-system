"use client";
import React, {createContext, useContext, useState} from "react";
import {item} from "@/entites/request/OrderRequest";

// export interface item {
//     productId: string,
//     productSizeId: string,
//     toppingIds: string[]
// }

interface orderRequet {
    tableId: string,
    items: item[]

}

interface OrderContextType extends orderRequet {
    clearProduct: () => void;
    setProduct: (tableId: string, items: item[]) => void;
}

export const FastOrderContext = createContext<OrderContextType | undefined>(undefined);

export const useFastOrderContext = () => {
    const context = useContext(FastOrderContext);
    if (!context) {
        throw new Error("useProduct must be used within useProductContext");
    }
    return context;
}

export function FastOrderProvider({children}: { children: React.ReactNode }) {
    const [data, setData] = useState<orderRequet>({
        items: [{productId: '', productSizeId: '', toppingIds: [''], note: ""}],
        tableId: '',
    })
    const setProduct = (tableId: string, items: item[]) => {
        setData({tableId: tableId, items: items});
    }

    const clearProduct = () => {
        setData({tableId: '', items: []});
    }

    const value: OrderContextType = {
        ...data,
        setProduct,
        clearProduct,
    }

    return (
        <FastOrderContext.Provider value={value}>
            {children}
        </FastOrderContext.Provider>
    )
}