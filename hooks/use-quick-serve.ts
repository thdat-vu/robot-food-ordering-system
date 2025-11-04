import {useCallback, useEffect, useMemo, useState} from "react";
import {categoriesApi, ApiProductCategoryResponse} from "@/lib/api/categories";
import {tablesApi} from "@/lib/api/tables";
import {GetFeedbackByIdtable, CheckSS} from "@/api/moderator/FeedbackApi";
import {FeedbackgGetTableId} from "@/entites/moderator/FeedbackModole";
import {productsApi} from "@/lib/api/products";
import {ordersApi} from "@/lib/api/orders";

export interface QuickRequest {
  complainId: string;
  tableId: string;
  tableName: string;
  productId: string;
  productName: string;
}

const QUICK_CATEGORY_NAME = "phục vụ nhanh";

export function useQuickServe() {
  const [productMap, setProductMap] = useState<Record<string, string>>({}); // name -> productId
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<QuickRequest[]>([]);

  // Build product name -> id map for category "Phục vụ nhanh"
  useEffect(() => {
    const load = async () => {
      try {
        const res = await categoriesApi.getProductCategories(1, 200);
        const map: Record<string, string> = {};
        (res.data || []).forEach((p: ApiProductCategoryResponse) => {
          if (p.categoryName && p.categoryName.toLowerCase() === QUICK_CATEGORY_NAME) {
            map[p.productName.toLowerCase()] = p.productId;
          }
        });
        setProductMap(map);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  const fetchQuickRequestsForActiveTables = useCallback(async () => {
    setLoading(true);
    try {
      const tablesRes = await tablesApi.getTables(1, 200);
      const tables = tablesRes.data;

      const results: QuickRequest[] = [];
      // Fetch complains per table
      for (const t of tables) {
        try {
          const fb = await GetFeedbackByIdtable(t.id);
          const list: FeedbackgGetTableId[] = (fb as any).data || [];
          const pending = list.filter((x) => x.isPending);
          pending.forEach((c) => {
            const text = (c.feedBack || "").toLowerCase();
            // Only accept requests explicitly marked as quick-serve by moderator
            if (!text.includes("yêu cầu nhanh")) return;
            const matched = Object.keys(productMap).find((name) => text.includes(name));
            if (matched) {
              results.push({
                complainId: c.complainId,
                tableId: t.id,
                tableName: t.name,
                productId: productMap[matched],
                productName: matched,
              });
            }
          });
        } catch {
          // ignore per table
        }
      }
      setRequests(results);
    } finally {
      setLoading(false);
    }
  }, [productMap]);

  const serveQuickRequest = useCallback(async (req: QuickRequest) => {
    // 1. Get product size (small or first)
    const prod = await productsApi.getProductById(req.productId);
    const sizes = (prod.data as any)?.sizes || [];
    const small = sizes.find((s: any) => String(s.sizeName || "").toLowerCase().startsWith("s")) || sizes[0];
    if (!small) throw new Error("No size for product");

    // 2. Get current order for the table to read device token
    const ordersRes = await ordersApi.getOrdersByTableIdOnly(req.tableId, null, null);
    const orders = (ordersRes.data?.data || []) as any[];
    if (!orders || orders.length === 0) throw new Error("No order found for table");
    const currentOrder = orders[0]; // newest should be first from API (assumption)
    const deviceToken = (currentOrder as any).deviderId || (currentOrder as any).deviceTokenId || "";
    if (!deviceToken) throw new Error("Missing device token for table order");

    // 3. Add item via handle
    await ordersApi.handleOrder({
      tableId: req.tableId,
      deviceToken,
      items: [
        {
          productId: req.productId,
          productSizeId: small.id,
          toppingIds: [],
        },
      ],
    });

    // 4. Find the newly added item and set status to Ready (3)
    const delivering = await ordersApi.getOrdersByTableIdWithStatus(req.tableId, "Delivering");
    const deliverOrders = (delivering.data || []) as any[];
    if (deliverOrders && deliverOrders.length > 0) {
      const lastOrder = deliverOrders[0];
      const item = (lastOrder.items || []).find((i: any) => String(i.productId).toLowerCase() === req.productId.toLowerCase());
      if (item) {
        await ordersApi.updateOrderItemStatus(lastOrder.id, item.id, 3, "Quick-serve ready");
      }
    }

    // 5. Mark complain processed
    await CheckSS(req.tableId, [req.complainId], "Đã phục vụ nhanh");
  }, []);

  return {
    productMap,
    loading,
    requests,
    fetchQuickRequestsForActiveTables,
    serveQuickRequest,
  };
}


