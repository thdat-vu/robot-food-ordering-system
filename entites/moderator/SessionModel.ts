interface Session {
    id: string;
    tableName : string;
    checkIn: string;
    checkOut: string | null;
    customerName: string;
    phoneNumber: string;
    hasInvoice: boolean;
    invoiceId : string | null;
  }
  interface SessionTableProps {
    idTable: string;
  }
  interface PaginationParams {
    pageNumber?: number;
    pageSize?: number;
  }
  
  interface PaginatedResponse<T> {
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
  }
  // Order Item Detail
interface OrderItemDetail {
  orderItemId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalMoney: number;
  status: string;
  toppings: Topping[];
}
// Topping Detail
interface Topping {
  name: string;
  price: number;

// Bill/Invoice Main Entity
interface Bill {
  id: string;
  orderId: string;
  tableId: string;
  tableName: string;
  createdTime: string;
  paymentMethod: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  cashierName: string | null;
  details: OrderItemDetail[];
}

// API Response Wrapper
interface BillApiResponse {
  data: Bill;
  additionalData: string | null;
  message: string | null;
  statusCode: number;
  code: string;
}