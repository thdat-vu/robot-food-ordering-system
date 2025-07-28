import {ToppingProduct} from "@/entites/respont/Topping";
import {Status} from "@/entites/respont/Production";

export interface ToppingTag extends ToppingProduct {
    quantity: number;
    isShoppingCart: boolean;
    status: Status;
}