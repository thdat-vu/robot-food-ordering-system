import {Topping} from "@/entites/respont/Topping";

export interface OrderRespont {
    id: string;
    tableId: string;
}


export interface OrderRespontGetByID {
    id: string;
    tableId: string;
    tableName: string;
    status: string;
    paymentStatus: string;
    totalPrice: number;
    items: InForProductOrderDetail[];
    createdTime: Date;
}

export interface InForProductOrderDetail {
    id: string;
    productId: string;
    productName: string;
    productSizeId: string;
    sizeName: string;
    status: string;
    toppings: Topping[];
}