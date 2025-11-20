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
    note: string;
    price: number;
    imageUrl: string;
    toppings: Topping[];
}

/**
 * {
 *   "data": {
 *     "id": "0199ba3e-15c8-7d60-b7da-80a4e2794589",
 *     "tableId": "7afb759b-17c6-4b0c-979e-a9e67415aab6",
 *     "tableName": "Bàn 16",
 *     "status": "Pending",
 *     "paymentStatus": "Pending",
 *     "totalPrice": 25000,
 *     "createdTime": "06/10/2025 22:57:34",
 *     "deviceTokenId": null,
 *     "items": [
 *       {
 *         "id": "0199ba3e-161a-7a2a-964d-b90ed1483f78",
 *         "productId": "25084817-29f4-42fd-bd60-081ecc90931c",
 *         "productName": "Chè bưởi",
 *         "productSizeId": "82411840-0d0a-4724-803a-cb2416a25c2d",
 *         "sizeName": "Small",
 *         "note": "",
 *         "remarkNote": null,
 *         "price": 25000,
 *         "status": "Pending",
 *         "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjjqjOhf06ny_DsvA3_9oer-YZYtym8zqF-g&s",
 *         "createdTime": "06/10/2025 22:57:34",
 *         "toppings": []
 *       }
 *     ]
 *   },
 *   "additionalData": null,
 *   "message": null,
 *   "statusCode": 200,
 *   "code": "SUCCESS"
 * }
 */