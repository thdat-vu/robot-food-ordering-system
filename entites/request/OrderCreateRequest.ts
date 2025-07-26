export interface OrderCreateRequest {
    production_id: string;
    size_id: string;
    toppings: { id: string, quantity: string }[];
}