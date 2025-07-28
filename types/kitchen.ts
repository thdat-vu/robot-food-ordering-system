export type OrderStatus = "đang chờ" | "đang thực hiện" | "bắt đầu phục vụ";

export interface Order {
  id: number;
  itemName: string;
  category: string;
  tableNumber: number;
  quantity: number;
  status: OrderStatus;
  image: string;
  orderTime: string;
  estimatedTime: string; // Time needed to prepare the dish (e.g., "15 phút", "20 phút")
  // API IDs for making API calls
  apiOrderId: string;
  apiItemId: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface SidebarItem {
  name: string;
  isRemoving: boolean;
}

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning';
  message: string;
  isVisible: boolean;
}

export interface OrderCounts {
  all: number;
  toCook: number;
  ready: number;
  completed: number;
}

export type GroupedOrders = Record<string, Order[]>;
export type RemainingItems = Record<string, number>; 