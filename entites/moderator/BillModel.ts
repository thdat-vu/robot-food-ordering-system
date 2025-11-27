export interface Topping {
    name: string;
    price: number;
  }
  
  export interface OrderItemDetail {
    orderItemId: string;
    productName: string;
    quantity: number;          // backend có thể trả 0 -> UI nên sanitize khi render
    unitPrice: number;
    totalMoney: number;
    status: string;
    toppings: Topping[] | null;
  }
  
  export interface Bill {
    id: string;
    orderId: string;
    tableId: string;
    tableName: string;
    createdTime: string;
    paymentMethod: string | number;   // ✅ quan trọng
    totalAmount: number;
    discount: number;
    finalAmount: number;
    cashierName: string | null;
    details: OrderItemDetail[];
  }
  
  export type ApiResponse<T> = {
    data: T;
    additionalData?: any;
    message?: string | null;
    statusCode: number;
    code?: string;
  };
  interface CompleteBillComponentProps {
    invoiceId: string;
  }