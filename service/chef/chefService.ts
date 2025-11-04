import { ordersApi } from '@/lib/api/orders';
import { transformApiOrdersToOrders } from '@/lib/utils/order-transformer';
import { Order } from '@/types/kitchen';
import { categoriesApi } from '@/lib/api/categories';

export interface FetchOrdersResult {
  orders: Order[];
}

export const chefService = {
  async fetchOrders(page: number = 1, pageSize: number = 100): Promise<FetchOrdersResult> {
    const response = await ordersApi.getOrders(page, pageSize);

    // Build a set of productIds belonging to category "Phục vụ nhanh"
    let quickServeProductIds = new Set<string>();
    try {
      const productCats = await categoriesApi.getProductCategories(1, 200);
      quickServeProductIds = new Set(
        (productCats.data || [])
          .filter(pc => pc.categoryName && pc.categoryName.toLowerCase() === 'phục vụ nhanh')
          .map(pc => pc.productId.toLowerCase())
      );
    } catch {
      // If mapping fails, continue without filtering (failsafe)
    }

    // Filter out quick-serve items from API payload before transforming
    const filtered = (response.data || []).map(order => ({
      ...order,
      items: order.items.filter(it => {
        const byId = quickServeProductIds.has(String(it.productId).toLowerCase());
        const name = String(it.productName || '').toLowerCase();
        const byName = name.includes('nước mắm') || name.includes('nuoc mam') || name.includes('nước tương') || name.includes('nuoc tuong');
        return !(byId || byName);
      }),
    }));

    const orders = filtered && filtered.length > 0
      ? transformApiOrdersToOrders(filtered)
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


