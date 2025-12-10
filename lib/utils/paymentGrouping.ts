// lib/utils/paymentGrouping.ts

export interface PaymentOrderItem {
    id: string;
    productName: string;
    sizeName: string;
    quantity: number; // API item lẻ -> thường = 1
    price: number;
    status: string;
    toppings: Array<{ name: string; price: number }>;
  }
  
  export interface PaymentOrder {
    id: string;
    tableName: string;
    status: string;
    paymentStatus: string;
    totalPrice: number;
    items: PaymentOrderItem[];
  }
  
  export interface GroupedPaymentOrderItem extends PaymentOrderItem {
    quantity: number;
    totalPrice: number; // (price + toppings) * quantity
  }
  
  const norm = (v: any) => String(v ?? "").trim().toLowerCase();
  const num = (v: any) => (typeof v === "number" ? v : Number(v ?? 0)) || 0;
  
  /**
   * Key group cho PAYMENT (không dùng topping.id vì payment chỉ có name/price)
   * Mặc định KHÔNG tách theo status để gộp “cùng món” cho invoice dễ nhìn.
   */
  export const createPaymentItemGroupKey = (
    item: Pick<PaymentOrderItem, "productName" | "sizeName" | "price" | "toppings" | "status">,
    opts?: { includeStatus?: boolean }
  ) => {
    const includeStatus = opts?.includeStatus ?? false;
  
    const toppingKey = (item.toppings ?? [])
      .map(t => `${norm(t.name)}:${num(t.price)}`)
      .sort()
      .join("|");
  
    return [
      norm(item.productName),
      norm(item.sizeName ?? ""),
      String(num(item.price)),
      includeStatus ? norm(item.status) : "",
      toppingKey,
    ].join("::");
  };
  
  export const calcPaymentItemTotal = (item: PaymentOrderItem, quantity: number) => {
    const q = Math.max(1, quantity);
    const base = num(item.price) * q;
    const toppingUnit = (item.toppings ?? []).reduce((s, t) => s + num(t.price), 0);
    return base + toppingUnit * q;
  };
  
  export const groupPaymentItems = (
    items: PaymentOrderItem[],
    opts?: { includeStatus?: boolean }
  ): GroupedPaymentOrderItem[] => {
    const map = new Map<string, GroupedPaymentOrderItem>();
  
    for (const it of items ?? []) {
      const key = createPaymentItemGroupKey(it, opts);
      const cur = map.get(key);
  
      if (!cur) {
        map.set(key, {
          ...it,
          // dùng key làm id để render stable
          id: key,
          quantity: Math.max(1, it.quantity ?? 1),
          totalPrice: calcPaymentItemTotal(it, Math.max(1, it.quantity ?? 1)),
        });
      } else {
        const newQ = (cur.quantity ?? 1) + Math.max(1, it.quantity ?? 1);
        cur.quantity = newQ;
        cur.totalPrice = calcPaymentItemTotal(cur, newQ);
      }
    }
  
    return Array.from(map.values());
  };
  
  /** Group items theo từng order (invoice từng order) */
  export const groupPaymentOrdersPerOrder = (
    orders: PaymentOrder[],
    opts?: { includeStatus?: boolean }
  ): (Omit<PaymentOrder, "items"> & { items: GroupedPaymentOrderItem[] })[] => {
    return (orders ?? []).map(o => {
      const grouped = groupPaymentItems(o.items ?? [], opts);
      const total = grouped.reduce((s, it) => s + it.totalPrice, 0);
  
      return {
        ...o,
        items: grouped,
        totalPrice: total, // override cho khớp dữ liệu group
      };
    });
  };
  
  /** Group tất cả items xuyên nhiều orders (invoice tổng bàn) */
  export const groupAllPaymentItemsFromOrders = (
    orders: PaymentOrder[],
    opts?: { includeStatus?: boolean }
  ): GroupedPaymentOrderItem[] => {
    const all = (orders ?? []).flatMap(o => o.items ?? []);
    return groupPaymentItems(all, opts);
  };
      