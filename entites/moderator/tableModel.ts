export interface TableData {
    id: string;
    name: string;
    status: string;
    qrCode: string;
}
export interface TableItem {
  id: string;
  name: string;
  status: number | string; // 0: Available, 1: Occupied, 2: Reserved
  qrCode: string;
}

export interface OrderItem {
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
  toppings: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  }[];
}

export interface OrderData {
  id: string;
  tableId: string;
  tableName: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  createdTime: Date;
  items: OrderItem[];
}

export interface OrderDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableItem | null;
  orders: OrderData[];
  loading: boolean;
  onConfirmStatusChange: () => void;
  onCancelStatusChange: () => void;
  newStatus: string | number; // 0: Available, 1: Occupied, 2: Reserved
}
