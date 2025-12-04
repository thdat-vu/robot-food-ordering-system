import { CreateOrderRequest, OrderData } from "./ProductOrder";


export function mapOrderDataToCreateOrderRequest(orderData: OrderData): CreateOrderRequest {
    const token = orderData.deviceToken?.trim(); // "" => undefined


  const items: CreateOrderRequest["items"] = [];
 
   for (const ci of orderData.items) {
    const qty = Math.max(1, ci.quantity ?? 1);

    // BE không có quantity -> expand theo quantity
    for (let i = 0; i < qty; i++) {
      items.push({
        note: ci.note ?? "",
        productId: ci.product.id,
        productSizeId: ci.size.id,
        toppingIds: (ci.toppings ?? []).map(t => t.id),
      });
    }
  }

  return {
    tableId: orderData.tableId,
    ...(token ? { deviceToken: token } : {}), // không gửi nếu rỗng/null
    items,
  };
}
