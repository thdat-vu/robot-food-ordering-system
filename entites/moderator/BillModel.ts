export interface Topping {
  id?: string;
  name: string;
  price: number;
  imageUrl?: string;
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
  invoiceCode: string;
  paymentMethod: string | number;   // ✅ quan trọng
  totalAmount: number;
  discount: number;
  finalAmount: number;
  cashierName: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  restaurantName?: string | null;
  restaurantAddress?: string | null;
  restaurantPhone?: string | null;
  details: OrderItemDetail[];
}

export interface CustomerLatestInvoice {
  customerId: string;
  restaurantName: string;
  customerName: string;
  phoneNumber: string;
  totalPoins: number;
  invoice: Bill;
}

export type ApiResponse<T> = {
  data: T;
  additionalData?: any;
  message?: string | null;
  statusCode: number;
  code?: string;
};
