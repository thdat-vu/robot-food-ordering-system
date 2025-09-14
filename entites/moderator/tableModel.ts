export interface TableData {
    id: string;
    name: string;
    status: string;
    qrCode: string;
}

export interface TableItem {
  id: string;
  name: string;
  status: string | number;
  qrCode: string;
}

export interface OrderData {
  id: string;
  tableId: string;
  tableName: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  createdTime?: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSizeId: string;
  sizeName: string;
  note: string;
  remarkNote: string;
  quantity: number;
  price: number;
  status: string;
  imageUrl: string;
  createdTime: string;
  toppings: Topping[];
}

interface Topping {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}