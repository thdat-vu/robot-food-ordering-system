"use client"

import {createContext, ReactNode, useContext, useState} from "react";

interface ProductState {
    id: string,
    name: string,
    urlImg: string;
    price: number;
    size: string;
    note: string;
    size_name: string;
}

interface ProductContextType extends ProductState {
    setProduct: (
        id: string,
        name: string,
        urlImg: string,
        price: number,
        size: string,
        note: string,
        size_name: string
    ) => void;
    clearProduct: () => void;
}


export const ContextProduct = createContext<ProductContextType | undefined>(undefined);

export const useProductContext = () => {
    const context = useContext(ContextProduct);
    if (!context) {
        throw new Error("useProduct must be used within useProductContext");
    }
    return context;
}


export function ProductProvider({children}: { children: ReactNode }) {
    const [product, setProductState] = useState<ProductState>({
        id: "",
        name: "",
        urlImg: "",
        price: 0,
        size: "",
        note: "",
        size_name: "",
    });


    const setProduct = (id: string, name: string, urlImg: string, price: number, size: string, size_name: string, note: string) => {
        setProductState({id, name, urlImg, price, size, size_name, note});
    }

    const clearProduct = () => {
        setProductState({id: '', name: '', urlImg: '', price: 0, size: '', size_name: '', note: ''});
    }


    const value: ProductContextType = {
        ...product,
        setProduct,
        clearProduct,
    }
    return (
        <ContextProduct.Provider value={value}>
            {children}
        </ContextProduct.Provider>
    )
}