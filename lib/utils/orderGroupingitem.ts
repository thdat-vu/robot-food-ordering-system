import { OrderData } from "@/entites/moderator/tableModel";

// Có thể tạo alias cho dễ sử dụng
export type Order = OrderData;
export type OrderItem = OrderData['items'][0];

export interface GroupedOrderItem extends OrderItem {
    quantity: number;
    totalPrice: number;
  }
  
  /**
   * Tạo key duy nhất cho việc group items dựa trên các thuộc tính
   */
  export const createItemGroupKey = (item: OrderItem): string => {
    const toppingKey = item.toppings
      .map(t => t.id)
      .sort()
      .join(",");
    
    return `${item.productId}-${item.productSizeId}-${item.note || ''}-${item.remarkNote || ''}-${toppingKey}`;
  };
  
  /**
   * Tính tổng giá của 1 item bao gồm toppings
   */
  export const calculateItemTotalPrice = (item: OrderItem): number => {
    const basePrice = item.price;
    const toppingsPrice = item.toppings.reduce((sum, topping) => sum + topping.price, 0);
    return (basePrice + toppingsPrice) * item.quantity;
  };
  
  /**
   * Group tất cả items từ nhiều orders thành 1 danh sách
   * Sử dụng khi muốn hiển thị tổng hợp tất cả món ăn
   */
  export const groupAllItemsFromOrders = (orders: Order[]): GroupedOrderItem[] => {
    // Flatten tất cả items từ tất cả orders
    const allItems = orders.flatMap(order => order.items);
    
    const groupedItems = allItems.reduce((acc, item) => {
      const key = createItemGroupKey(item);
      
      if (!acc[key]) {
        acc[key] = {
          ...item,
          quantity: item.quantity || 1,
          totalPrice: calculateItemTotalPrice(item)
        };
      } else {
        const newQuantity = acc[key].quantity + (item.quantity || 1);
        acc[key] = {
          ...acc[key],
          quantity: newQuantity,
          totalPrice: calculateItemTotalPrice({
            ...acc[key],
            quantity: newQuantity
          })
        };
      }
      
      return acc;
    }, {} as Record<string, GroupedOrderItem>);
    
    return Object.values(groupedItems);
  };
  
  /**
   * Group items trong từng order riêng biệt
   * Sử dụng khi muốn hiển thị items đã group trong từng order
   */
  export const groupItemsPerOrder = (orders: Order[]): (Order & { groupedItems: GroupedOrderItem[] })[] => {
    return orders.map(order => {
      const groupedItems = order.items.reduce((acc, item) => {
        const key = createItemGroupKey(item);
        
        if (!acc[key]) {
          acc[key] = {
            ...item,
            quantity: item.quantity || 1,
            totalPrice: calculateItemTotalPrice(item)
          };
        } else {
          const newQuantity = acc[key].quantity + (item.quantity || 1);
          acc[key] = {
            ...acc[key],
            quantity: newQuantity,
            totalPrice: calculateItemTotalPrice({
              ...acc[key],
              quantity: newQuantity
            })
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
          quantity: item.quantity || 1,
          totalPrice: calculateItemTotalPrice(item)
        };
      } else {
        const newQuantity = acc[key].quantity + (item.quantity || 1);
        acc[key] = {
          ...acc[key],
          quantity: newQuantity,
          totalPrice: calculateItemTotalPrice({
            ...acc[key],
            quantity: newQuantity
          })
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
    
    // Tính tổng số lượng món (có thể khác với totalItems nếu có quantity > 1)
    const totalQuantity = orders.reduce((acc, order) => 
      acc + order.items.reduce((itemAcc, item) => itemAcc + (item.quantity || 1), 0), 0
    );
    
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
  