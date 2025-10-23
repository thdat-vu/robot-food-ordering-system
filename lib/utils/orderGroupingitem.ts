import { OrderData } from "@/entites/moderator/tableModel";

// Có thể tạo alias cho dễ sử dụng
export type Order = OrderData;
export type OrderItem = OrderData['items'][0];

export interface GroupedOrderItem extends OrderItem {
    quantity: number;
    totalPrice: number;
  }
  
  
  export const createItemGroupKey = (item: OrderItem): string => {
    const toppingKey = item.toppings
      .map(t => t.id)
      .sort()
      .join(",");
    
    return `${item.productId}-${item.productSizeId}-${item.note || ''}-${item.remarkNote || ''}-${toppingKey}-${item.status}`;
  };
  
  /**
  
   * Note: Each API item is now individual (no quantity field), so we calculate for quantity = 1
   */
  export const calculateItemTotalPrice = (item: OrderItem, quantity: number = 1): number => {
    const basePrice = item.price;
    const toppingsPrice = item.toppings.reduce((sum, topping) => sum + topping.price, 0);
    return (basePrice + toppingsPrice) * quantity;
  };
  
 
  export const groupAllItemsFromOrders = (orders: Order[]): GroupedOrderItem[] => {
    // Flatten tất cả items từ tất cả orders
    const allItems = orders.flatMap(order => order.items);
    
    const groupedItems = allItems.reduce((acc, item) => {
      const key = createItemGroupKey(item);
      
      if (!acc[key]) {
        acc[key] = {
          ...item,
          quantity: 1, // Each API item is individual
          totalPrice: calculateItemTotalPrice(item, 1)
        };
      } else {
        const newQuantity = acc[key].quantity + 1; // Add 1 for each individual item
        acc[key] = {
          ...acc[key],
          quantity: newQuantity,
          totalPrice: calculateItemTotalPrice(acc[key], newQuantity)
        };
      }
      
      return acc;
    }, {} as Record<string, GroupedOrderItem>);
    
    return Object.values(groupedItems);
  };
  
  
  export const groupItemsPerOrder = (orders: Order[]): (Order & { groupedItems: GroupedOrderItem[] })[] => {
    return orders.map(order => {
      const groupedItems = order.items.reduce((acc, item) => {
        const key = createItemGroupKey(item);
        
        if (!acc[key]) {
          acc[key] = {
            ...item,
            quantity: 1, // Each API item is individual
            totalPrice: calculateItemTotalPrice(item, 1)
          };
        } else {
          const newQuantity = acc[key].quantity + 1; // Add 1 for each individual item
          acc[key] = {
            ...acc[key],
            quantity: newQuantity,
            totalPrice: calculateItemTotalPrice(acc[key], newQuantity)
          };
        }
        
        return acc;
      }, {} as Record<string, GroupedOrderItem>);
      
      return {
        ...order,
        groupedItems: Object.values(groupedItems)
      };
    });
  };
  
  /**
   * Group items của 1 order duy nhất
   * Sử dụng khi chỉ cần group items của 1 order cụ thể
   */
  export const groupSingleOrderItems = (order: Order): GroupedOrderItem[] => {
    const groupedItems = order.items.reduce((acc, item) => {
      const key = createItemGroupKey(item);
      
      if (!acc[key]) {
        acc[key] = {
          ...item,
          quantity: 1, // Each API item is individual
          totalPrice: calculateItemTotalPrice(item, 1)
        };
      } else {
        const newQuantity = acc[key].quantity + 1; // Add 1 for each individual item
        acc[key] = {
          ...acc[key],
          quantity: newQuantity,
          totalPrice: calculateItemTotalPrice(acc[key], newQuantity)
        };
      }
      
      return acc;
    }, {} as Record<string, GroupedOrderItem>);
    
    return Object.values(groupedItems);
  };
  
  /**
   * Tính tổng thống kê từ danh sách orders
   */
  export const calculateOrdersStatistics = (orders: Order[]) => {
    const totalPrice = orders.reduce((total, order) => total + order.totalPrice, 0);
    const totalItems = orders.reduce((acc, order) => acc + order.items.length, 0);
    const paidOrders = orders.filter(order => order.paymentStatus.toLowerCase() === 'paid').length;
    const unpaidOrders = orders.length - paidOrders;
    
    // Calculate total quantity (each API item is now individual, so totalQuantity = totalItems)
    const totalQuantity = totalItems;
    
    return {
      totalOrders: orders.length,
      totalPrice,
      totalItems,
      totalQuantity,
      paidOrders,
      unpaidOrders
    };
  };
  
  /**
   * Helper function để format currency theo chuẩn Việt Nam
   */
  export const formatVNCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  
  /**
   * Helper function để format number theo chuẩn Việt Nam (không có ký hiệu tiền tệ)
   */
  export const formatVNNumber = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };
  