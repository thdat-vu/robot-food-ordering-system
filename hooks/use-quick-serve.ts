import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {categoriesApi, ApiProductCategoryResponse} from "@/lib/api/categories";
import {tablesApi} from "@/lib/api/tables";
import {GetFeedbackByIdtable, CheckSS} from "@/api/moderator/FeedbackApi";
import {FeedbackgGetTableId} from "@/entites/moderator/FeedbackModole";
import {productsApi} from "@/lib/api/products";
import {ordersApi} from "@/lib/api/orders";
import { useSignalR } from "@/hooks/useSignalR";
import { getApiUrl } from "@/env.config";

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
  const realtimeFetchInFlight = useRef(false);

  const signalRHubUrl = useMemo(() => {
    const apiUrl = getApiUrl();
    const normalizedBase = apiUrl.replace(/\/api\/?$/, "");
    return `${normalizedBase}/orderNotificationHub`;
  }, []);

  // Build product name -> id map for category "Phục vụ nhanh"
  useEffect(() => {
    const load = async () => {
      try {
        const res = await categoriesApi.getProductCategories(1, 200);
        const map: Record<string, string> = {};
        const allCategories: string[] = [];
        
        (res.data || []).forEach((p: ApiProductCategoryResponse) => {
          // Collect all unique category names for debugging
          if (p.categoryName && !allCategories.includes(p.categoryName.toLowerCase())) {
            allCategories.push(p.categoryName.toLowerCase());
          }
          
          // Match category name (case-insensitive, flexible matching)
          const categoryNameLower = (p.categoryName || "").toLowerCase();
          if (categoryNameLower.includes(QUICK_CATEGORY_NAME) || QUICK_CATEGORY_NAME.includes(categoryNameLower)) {
            const productNameLower = p.productName.toLowerCase();
            map[productNameLower] = p.productId;
            console.log('[QuickServe] Added to product map:', productNameLower, '→', p.productId, 'from category:', p.categoryName);
          }
        });
        
        console.log('[QuickServe] Product map loaded:', map);
        console.log('[QuickServe] All categories found:', allCategories);
        console.log('[QuickServe] Looking for category containing:', QUICK_CATEGORY_NAME);
        
        if (Object.keys(map).length === 0) {
          console.warn('[QuickServe] ⚠️ Product map is EMPTY! No products found in category "phục vụ nhanh"');
          console.warn('[QuickServe] Available categories:', allCategories);
        }
        
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
            // Handle both PascalCase (from backend) and camelCase (if mapped)
            const resolutionNote = (c.resolutionNote || c.ResolutionNote || "").toLowerCase();
            console.log('[QuickServe] Table', t.name, '- Checking complaint:', {
              feedBack: c.feedBack,
              resolutionNote: c.resolutionNote || c.ResolutionNote,
              isPending: c.isPending
            });
            
            if (!resolutionNote.includes("yêu cầu nhanh")) return;
            
            console.log('[QuickServe] Found quick-serve request in', t.name);
            
            // Extract product name from original feedBack
            const feedBackText = (c.feedBack || "").toLowerCase();
            
            // Try to match with product map first
            let matched = Object.keys(productMap).find((name) => feedBackText.includes(name));
            let matchedProductId: string | undefined = matched ? productMap[matched] : undefined;
            let matchedProductName: string | undefined = matched;
            
            // Fallback: If no match in product map, try to match common keywords
            if (!matched) {
              console.log('[QuickServe] No match in product map, trying fallback keywords...');
              
              // Common quick-serve product keywords
              const keywordMap: Record<string, string> = {
                "nước mắm": "nước mắm",
                "nuoc mam": "nước mắm",
                "nước tương": "nước tương",
                "nuoc tuong": "nước tương",
                "nước chấm": "nước mắm",
                "nuoc cham": "nước mắm",
              };
              
              // Find matching keyword
              const matchedKeyword = Object.keys(keywordMap).find((keyword) => 
                feedBackText.includes(keyword)
              );
              
              if (matchedKeyword) {
                matchedProductName = keywordMap[matchedKeyword];
                console.log('[QuickServe] Matched keyword:', matchedKeyword, '→ product:', matchedProductName);
                
                // Try to find product ID from product map by normalized name
                const normalizedName = matchedProductName.toLowerCase();
                matchedProductId = productMap[normalizedName];
                
                if (!matchedProductId) {
                  console.warn('[QuickServe] Product name found but no ID in map. Product map keys:', Object.keys(productMap));
                  // Still add to results but without productId - will need to handle in UI
                }
              }
            }
            
            if (matchedProductName) {
              console.log('[QuickServe] Matched product:', matchedProductName, 'for table', t.name, 'productId:', matchedProductId);
              results.push({
                complainId: c.complainId,
                tableId: t.id,
                tableName: t.name,
                productId: matchedProductId || "", // Empty string if not found, will need to handle
                productName: matchedProductName,
              });
            } else {
              console.warn('[QuickServe] No product match found for feedback:', c.feedBack, 'Available product map keys:', Object.keys(productMap));
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
    // Temporarily disable complain status update per requirement
    // await CheckSS(req.tableId, [req.complainId], "Đã phục vụ nhanh");
  }, []);

  const triggerRealtimeRefresh = useCallback(async () => {
    if (realtimeFetchInFlight.current) {
      return;
    }
    realtimeFetchInFlight.current = true;
    try {
      await fetchQuickRequestsForActiveTables();
    } finally {
      realtimeFetchInFlight.current = false;
    }
  }, [fetchQuickRequestsForActiveTables]);

  useEffect(() => {
    if (productMapReady) {
      fetchQuickRequestsForActiveTables();
    }
  }, [productMapReady, fetchQuickRequestsForActiveTables]);

  const hubMethods = useMemo(
    () => ({
      OrderItemStatusChanged: () => {
        triggerRealtimeRefresh();
      },
      OrderStatusChanged: () => {
        triggerRealtimeRefresh();
      },
      WaiterNotification: () => {
        triggerRealtimeRefresh();
      },
    }),
    [triggerRealtimeRefresh]
  );

  const { isConnected: isRealtimeConnected } = useSignalR({
    url: signalRHubUrl,
    groupName: "Waiters",
    hubMethods,
  });

  return {
    productMap,
    productMapReady,
    loading,
    requests,
    fetchQuickRequestsForActiveTables,
    serveQuickRequest,
    isRealtimeConnected,
  };
}


