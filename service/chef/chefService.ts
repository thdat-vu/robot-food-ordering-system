import { ordersApi } from '@/lib/api/orders';
import { transformApiOrdersToOrders } from '@/lib/utils/order-transformer';
import { Order } from '@/types/kitchen';

export interface FetchOrdersResult {
  orders: Order[];
}

export const chefService = {
  async fetchOrders(page: number = 1, pageSize: number = 100): Promise<FetchOrdersResult> {
    const response = await ordersApi.getOrders(page, pageSize);
    const orders = response.data && response.data.length > 0
      ? transformApiOrdersToOrders(response.data)
      : [];
    return { orders };
  },

  async setOrderItemPreparing(apiOrderId: string, apiItemId: string) {
    return ordersApi.updateOrderItemStatus(apiOrderId, apiItemId, 2);
  },

  async setOrderItemReady(apiOrderId: string, apiItemId: string) {
    return ordersApi.updateOrderItemStatus(apiOrderId, apiItemId, 3);
  },

  async setOrderItemCancelled(apiOrderId: string, apiItemId: string, remarkNote?: string) {
    return ordersApi.updateOrderItemStatus(apiOrderId, apiItemId, 6, remarkNote);
  }
};


