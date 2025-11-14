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
  const [productMapReady, setProductMapReady] = useState(false); // Track if product map is loaded

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
        console.log('[QuickServe] Product map loaded:', map);
        setProductMap(map);
        setProductMapReady(true); // Mark as ready
      } catch (e) {
        console.error('[QuickServe] Failed to load product map:', e);
        setProductMapReady(true); // Still mark as ready even on error, to avoid infinite waiting
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
      console.log('[QuickServe] ========== STARTING FETCH ==========');
      console.log('[QuickServe] Product map ready:', productMapReady);
      console.log('[QuickServe] Product map has', Object.keys(productMap).length, 'items:', Object.keys(productMap));
      console.log('[QuickServe] Fetching from', tables.length, 'tables');
      
      // Fetch complains per table
      for (const t of tables) {
        try {
          console.log(`[QuickServe] Fetching complaints for table: ${t.name} (ID: ${t.id})`);
          const fb = await GetFeedbackByIdtable(t.id);
          console.log(`[QuickServe] Response for ${t.name}:`, fb);
          const list: FeedbackgGetTableId[] = (fb as any).data || [];
          console.log(`[QuickServe] ${t.name} has ${list.length} complaints, ${list.filter(x => x.isPending).length} pending`);
          const pending = list.filter((x) => x.isPending);
          
          pending.forEach((c) => {
            // Check resolutionNote for quick-serve marker (set by moderator)
            const resolutionNote = (c.resolutionNote || "").toLowerCase();
            console.log('[QuickServe] Table', t.name, '- Checking complaint:', {
              feedBack: c.feedBack,
              resolutionNote: c.resolutionNote,
              isPending: c.isPending
            });
            
            if (!resolutionNote.includes("yêu cầu nhanh")) return;
            
            console.log('[QuickServe] Found quick-serve request in', t.name);
            
            // Extract product name from original feedBack
            const feedBackText = (c.feedBack || "").toLowerCase();
            const matched = Object.keys(productMap).find((name) => feedBackText.includes(name));
            
            if (matched) {
              console.log('[QuickServe] Matched product:', matched, 'for table', t.name);
              results.push({
                complainId: c.complainId,
                tableId: t.id,
                tableName: t.name,
                productId: productMap[matched],
                productName: matched,
              });
            } else {
              console.warn('[QuickServe] No product match found for feedback:', c.feedBack);
            }
          });
        } catch (e) {
          console.error('[QuickServe] Error fetching complaints for table', t.name, ':', e);
        }
      }
      console.log('[QuickServe] Total requests found:', results.length, results);
      setRequests(results);
    } finally {
      setLoading(false);
    }
  }, [productMap, productMapReady]);

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
    productMapReady,
    loading,
    requests,
    fetchQuickRequestsForActiveTables,
    serveQuickRequest,
  };
}


