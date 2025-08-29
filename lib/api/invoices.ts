import axios from "axios";
import apiClient from "../axios";
import { ApiBaseResponse, ApiPaginatedResponse } from "./orders";

export interface InvoiceDetailResponse {
    orderItemId: string;        // Guid bên C#
    productName: string;
    unitPrice: number;
    toppings: string[];
    totalMoney: number;
  }
  
  export interface InvoiceResponse {
    id: string;                 // Guid bên C#
    tableName: string;
    createdTime: string;        // ISO DateTime → trả về string
    totalMoney: number;
    paymentStatus: string;
    details: InvoiceDetailResponse[];
  }
  
    export const invoicesApi = {
    // Get all invoices
    async getInvoices(page: number = 1, pageSize: number = 50) {
        const response = await apiClient.get<ApiPaginatedResponse<InvoiceResponse>>('/Invoice', {
            params: {page, pageSize}
        });
        // Transform the paginated response to match the expected structure
        return {
            statusCode: 200,
            code: 'SUCCESS',
            data: response.data.items,
            message: 'Invoices retrieved successfully'
        };
    },
    // Get invoice by table ID
    async   getInvoiceByTableId(tableId: string, page: number = 1, pageSize: number = 50) {
        try {
            const response = await apiClient.get<ApiPaginatedResponse<InvoiceResponse>>(`/Invoice/table/${tableId}`, {
                params: {page, pageSize}
            });
            console.log("Fetched invoice by table ID:", response.data.items);
            return response.data;
        } catch (error) {
            console.error("Error fetching invoice by table ID:", error);
            throw error;
        }
    }};
//         console.log("Fetching orders for table:", tableId, "with status:", status);  

