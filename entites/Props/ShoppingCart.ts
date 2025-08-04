export interface ShoppingCart {
    id: string;
    name: string;
    urlImg: string;
    size: Size;
    toppings: Topping[];
    note: string | undefined;
}

export interface Size {
    id: string;
    name: string;
    price: number;
}

export interface Topping {
    id: string;
    name: string;
    imgUrl: string;
    price: number;
    quantity: number;
}