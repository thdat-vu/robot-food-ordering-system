import apiClient from '../axios';

// Types matching the .NET API response
export interface ApiOrderResponse {
    id: string;
    tableId: string;
    tableName: string;
    status: string;
    paymentStatus: string;
    totalPrice: number;
    createdTime?: string; // Created time from API (e.g., "31/07/2025 00:01:28")
    items: ApiOrderItemResponse[];
}

export interface ApiOrderItemResponse {
    id: string;
    productId: string;
    productName: string;
    productSizeId: string;
    sizeName: string;
    remarkNote: string; // Staff remark note for the item
    note: string; // Customer note for the item
    quantity: number;
    price: number; // Add price field for order items
    status: string;
    imageUrl: string; // Add imageUrl field from API response
    createdTime?: string; // Created time from API (e.g., "31/07/2025 00:01:28")
    readyTime?: string; // Ready time from API (e.g., "03/01/2026 06:51:26")
    toppings: ApiToppingResponse[];
}

export interface ApiToppingResponse {
    id: string;
    name: string;
    price: number;
}

export interface ApiBaseResponse<T> {
    statusCode: number;
    code: string;
    data: T;
    message?: string;
}

// Paginated response structure from .NET API
export interface ApiPaginatedResponse<T> {
    items: T[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface UpdateOrderItemStatusRequest {
    status: number; // OrderItemStatus enum value
}

// Payment method constants
export const PAYMENT_METHODS = {
    COD: 1,
    VNPay: 2
} as const;

export interface OrderPaymentRequest {
    paymentMethod: number; // 1 for COD, 2 for VNPay
}

export interface OrderPaymentResponse {
    orderId: string;
    paymentStatus: string;
    message: string;
}


// API service functions
export const ordersApi = {
    // Get all orders
    async getOrders(page: number = 1, pageSize: number = 50) {
        const response = await apiClient.get<ApiPaginatedResponse<ApiOrderResponse>>('/Order', {
            params: {page, pageSize}
        });
        // Transform the paginated response to match the expected structure
        return {
            statusCode: 200,
            code: 'SUCCESS',
            data: response.data.items,
            message: 'Orders retrieved successfully'
        };
    },

    // Create or append items to an order for a table (server decides create vs update)
    async handleOrder(request: {
        tableId: string;
        deviceToken: string;
        items: Array<{ productId: string; productSizeId: string; toppingIds: string[]; note?: string }>;
    }) {
        const payload = {
            tableId: request.tableId,
            deviceToken: request.deviceToken,
            items: request.items.map((i) => ({
                productId: i.productId,
                productSizeId: i.productSizeId,
                toppingIds: i.toppingIds ?? [],
                note: i.note ?? "",
            })),
        };
        const response = await apiClient.post<ApiBaseResponse<ApiOrderResponse>>(
            `/Order/handle`,
            payload
        );
        return response.data;
    },

    // Get order by ID
    async getOrderById(orderId: string) {
        const response = await apiClient.get<ApiBaseResponse<ApiOrderResponse>>(`/Order/${orderId}`);
        return response.data;
    },

    // Get order items
    async getOrderItems(orderId: string) {
        const response = await apiClient.get<ApiBaseResponse<ApiOrderItemResponse[]>>(`/Order/${orderId}/items`);
        return response.data;
    },

    // Update order item status
    async updateOrderItemStatus(orderId: string, itemId: string, status: number, remarkNote?: string) {
        const response = await apiClient.patch<ApiBaseResponse<ApiOrderItemResponse>>(
            `/Order/${orderId}/items/${itemId}/status`,
            {
                status: status,
                remarkNote: remarkNote
            }
        );
        return response.data;
    },

    // Get orders by table ID
    async getOrdersByTableId(orderId: string, tableId: string) {
        const response = await apiClient.get<ApiBaseResponse<ApiOrderResponse>>(`/Order/${orderId}/table/${tableId}`);
        return response.data;
    },

    // NEW: Get orders by table ID only (for payment)
    async getOrdersByTableIdOnly(tableId: string ,startDate?: string | null, endDate?: string | null) {
        const response = await apiClient.get<ApiBaseResponse<ApiOrderResponse[]>>(`/Order/table/${tableId}`,
        {
            params: {
                startDate,
                endDate
            }   
        });
        return response;
    },

    // NEW: Get orders by table ID with Delivering status (for payment)
    async getOrdersByTableIdWithStatus(tableId: string, status: string) {
        console.log("------------------------------------");
        console.log(status);
        const response = await apiClient.get<ApiBaseResponse<ApiOrderResponse[]>>(`/Order/table/${tableId}/status/${status}`);
        return response.data;
    },

    // Initiate payment for an order
    async initiatePayment(orderId: string, paymentMethod: number) {
        const response = await apiClient.post<ApiBaseResponse<OrderPaymentResponse>>(
            `/Order/${orderId}/pay`,
            {paymentMethod}
        );
        return response.data;
    }
}; 