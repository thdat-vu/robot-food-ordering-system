import {ShoppingCart} from "@/entites/Props/ShoppingCart";

export default function formatCurrency(amount: number): string {
    return amount.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

export const CheckID = (id: string): boolean => {
    return id !== '';
}

export const totolPrice = (shoppingCarts: ShoppingCart[]) => {
    let sum = 0;
    shoppingCarts.forEach(value => {
        sum += value.size.price;
        value.toppings.forEach(t => sum += t.quantity * t.price);
    });
    return sum;
}