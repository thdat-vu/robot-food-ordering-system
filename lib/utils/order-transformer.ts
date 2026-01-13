import { Order, OrderStatus } from '@/types/kitchen';
import { ApiOrderResponse, ApiOrderItemResponse } from '@/lib/api/orders';

// Map API status to frontend status
const mapApiStatusToFrontend = (apiStatus: string): OrderStatus => {
  switch (apiStatus.toLowerCase()) {
    case 'pending':
      return 'đang chờ';
    case 'preparing':
      return 'đang thực hiện';
    case 'ready':
      return 'bắt đầu phục vụ';
    case 'served':
      return 'đã phục vụ';
    case 'remark':
      return 'yêu cầu làm lại';
    case 'returned':
      return 'yêu cầu làm lại';
    case 'cancelled':
      return 'đã huỷ';
    default:
      return 'đang chờ';
  }
};

// Map frontend status to API status
export const mapFrontendStatusToApi = (frontendStatus: OrderStatus): number => {
  switch (frontendStatus) {
    case 'đang chờ':
      return 1; // Pending
    case 'đang thực hiện':
      return 2; // Preparing
    case 'bắt đầu phục vụ':
      return 3; // Ready
    case 'yêu cầu làm lại':
      return 7; // Returned
    default:
      return 1; // Pending
  }
};

// Get category based on product name (you might want to get this from API later)
const getCategoryFromProductName = (productName: string): string => {
  const lowerName = productName.toLowerCase();

  if (lowerName.includes('nước') || lowerName.includes('trà') || lowerName.includes('cacao') || lowerName.includes('juice') || lowerName.includes('cà phê')) {
    return 'Đồ uống';
  }

  if (lowerName.includes('phở') || lowerName.includes('bún') || lowerName.includes('cơm') || lowerName.includes('mì')) {
    return 'Món chính';
  }

  if (
    lowerName.includes('gỏi') ||
    lowerName.includes('chả') ||
    lowerName.includes('bánh') ||
    lowerName.includes('chè') ||
    lowerName.includes('rau câu') ||
    lowerName.includes('rau cau') ||
    lowerName.includes('thạch') ||
    lowerName.includes('thach')
  ) {
    return 'Tráng miệng';
  }

  return 'Món chính'; // Default
};

// Get image based on product name
const getImageFromProductName = (productName: string): string => {
  const lowerName = productName.toLowerCase();

  if (lowerName.includes('chanh dây') || lowerName.includes('passion')) {
    return '/avatars/passion-fruit-juice.jpg';
  }

  if (lowerName.includes('trà đào') || lowerName.includes('peach tea')) {
    return '/avatars/peach-tea.jpg';
  }

  if (lowerName.includes('cacao')) {
    return '/avatars/iced-cacao.jpg';
  }

  if (lowerName.includes('phở bò') || lowerName.includes('pho bo')) {
    return '/avatars/pho-bo.jpg';
  }

  if (lowerName.includes('bún bò') || lowerName.includes('bun bo')) {
    return '/avatars/bun-bo-hue.jpg';
  }

  if (lowerName.includes('gỏi cuốn') || lowerName.includes('goi cuon')) {
    return '/avatars/goi-cuon.jpg';
  }

  if (lowerName.includes('chả cá') || lowerName.includes('cha ca')) {
    return '/avatars/cha-ca.jpg';
  }

  return '/avatars/pho-bo.jpg'; // Default image
};

// Transform API order item to frontend Order
export const transformApiOrderItemToOrder = (
  orderItem: ApiOrderItemResponse,
  order: ApiOrderResponse,
  orderIndex: number
): Order => {
  const tableNumber = parseInt(order.tableName.replace(/\D/g, '')) || 1;

  // Parse date in formats like "dd/MM/yyyy HH:mm:ss" or ISO
  const parseVnDateTime = (input?: string): Date | null => {
    if (!input) return null;
    // dd/MM/yyyy HH:mm:ss
    const m = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (m) {
      const [, d, mo, y, hh, mm, ss] = m;
      return new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss));
    }
    const ts = Date.parse(input);
    return Number.isNaN(ts) ? null : new Date(ts);
  };

  return {
    id: orderIndex + 1, // Frontend uses number IDs
    itemName: orderItem.productName,
    category: getCategoryFromProductName(orderItem.productName),
    tableNumber,
    quantity: 1, // Each API item represents 1 individual item (no quantity field in new API)
    status: mapApiStatusToFrontend(orderItem.status),
    image: orderItem.imageUrl || getImageFromProductName(orderItem.productName),
    orderTime: new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    createdTime: (() => {
      const dateValue = orderItem.createdTime || order.createdTime;
      const dt = parseVnDateTime(dateValue);
      if (!dt) return undefined;
      // Format: HH:mm:ss dd/MM/yyyy
      const pad = (value: number) => value.toString().padStart(2, '0');
      const hours = pad(dt.getHours());
      const minutes = pad(dt.getMinutes());
      const seconds = pad(dt.getSeconds());
      const day = pad(dt.getDate());
      const month = pad(dt.getMonth() + 1);
      const year = dt.getFullYear();
      return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    })(), // Convert Date to string format: HH:mm:ss dd/MM/yyyy
    readyTime: (() => {
      const dateValue = orderItem.readyTime;
      const dt = parseVnDateTime(dateValue);
      if (!dt) return undefined;
      // Format: HH:mm:ss dd/MM/yyyy
      const pad = (value: number) => value.toString().padStart(2, '0');
      const hours = pad(dt.getHours());
      const minutes = pad(dt.getMinutes());
      const seconds = pad(dt.getSeconds());
      const day = pad(dt.getDate());
      const month = pad(dt.getMonth() + 1);
      const year = dt.getFullYear();
      return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    })(), // Convert Ready Date to string format: HH:mm:ss dd/MM/yyyy
    estimatedTime: orderItem.durationTime != null ? `${orderItem.durationTime} phút` : getEstimatedTime(orderItem.productName),
    sizeName: orderItem.sizeName, // Add size name from API
    toppings: orderItem.toppings?.map(topping => topping.name) || [], // Add toppings from API
    note: orderItem.note, // Add note from API
    isUrgent: orderItem.isUrgent || false, // Add isUrgent from API
    remakedTime: (() => {
      const dateValue = orderItem.remakedTime;
      if (!dateValue) return null;
      const dt = parseVnDateTime(dateValue);
      if (!dt) return null;
      // Format: HH:mm:ss dd/MM/yyyy
      const pad = (value: number) => value.toString().padStart(2, '0');
      const hours = pad(dt.getHours());
      const minutes = pad(dt.getMinutes());
      const seconds = pad(dt.getSeconds());
      const day = pad(dt.getDate());
      const month = pad(dt.getMonth() + 1);
      const year = dt.getFullYear();
      return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    })(), // Add remakedTime from API
    remarkNote: orderItem.remarkNote || null, // Add remarkNote from API
    // Store API IDs for making API calls
    apiOrderId: order.id,
    apiItemId: orderItem.id
  };
};

// Get estimated time based on product name
const getEstimatedTime = (productName: string): string => {
  const lowerName = productName.toLowerCase();

  if (lowerName.includes('nước') || lowerName.includes('trà') || lowerName.includes('cacao')) {
    return '5 phút';
  }

  if (lowerName.includes('phở') || lowerName.includes('bún')) {
    return '20 phút';
  }

  if (lowerName.includes('gỏi')) {
    return '12 phút';
  }

  if (lowerName.includes('chả')) {
    return '15 phút';
  }

  return '10 phút'; // Default
};

// Transform API orders to frontend orders
export const transformApiOrdersToOrders = (apiOrders: ApiOrderResponse[]): Order[] => {
  const orders: Order[] = [];
  let orderIndex = 0;

  apiOrders.forEach(apiOrder => {
    apiOrder.items.forEach(item => {
      orders.push(transformApiOrderItemToOrder(item, apiOrder, orderIndex));
      orderIndex++;
    });
  });

  return orders;
}; 