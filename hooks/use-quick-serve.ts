import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {categoriesApi, ApiProductCategoryResponse} from "@/lib/api/categories";
import {tablesApi} from "@/lib/api/tables";
import {GetFeedbackByIdtable, CheckSS} from "@/api/moderator/FeedbackApi";
import {FeedbackgGetTableId} from "@/entites/moderator/FeedbackModole";
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
            
            // Extract product names from original feedBack
            const feedBackText = (c.feedBack || "").toLowerCase();
            
            // Common quick-serve product keywords (for fallback matching)
            const keywordMap: Record<string, string> = {
              "nước mắm": "Nước mắm",
              "nuoc mam": "Nước mắm",
              "nước tương": "Nước tương",
              "nuoc tuong": "Nước tương",
              "nước chấm": "Nước mắm",
              "nuoc cham": "Nước mắm",
              "tương ớt": "Tương ớt",
              "tuong ot": "Tương ớt",
              "muối": "Muối",
              "muoi": "Muối",
              "tiêu": "Tiêu",
              "tieu": "Tiêu",
              "đũa": "Đũa",
              "dua": "Đũa",
              "thìa": "Thìa",
              "thia": "Thìa",
              "khăn giấy": "Khăn giấy",
              "khan giay": "Khăn giấy",
              "giấy ăn": "Khăn giấy",
              "giay an": "Khăn giấy",
            };
            
            // Collect all matched product names (avoid duplicates)
            const matchedProductNames = new Set<string>();
            
            // 1. First, match with product map (exact matches from database)
            Object.keys(productMap).forEach((productName) => {
              if (feedBackText.includes(productName)) {
                // Capitalize first letter for display
                const displayName = productName.charAt(0).toUpperCase() + productName.slice(1);
                matchedProductNames.add(displayName);
                console.log('[QuickServe] Matched from product map:', productName);
              }
            });
            
            // 2. Fallback: Match with common keywords for products not in map
            Object.keys(keywordMap).forEach((keyword) => {
              if (feedBackText.includes(keyword)) {
                const displayName = keywordMap[keyword];
                matchedProductNames.add(displayName);
                console.log('[QuickServe] Matched from keyword fallback:', keyword, '→', displayName);
              }
            });
            
            console.log('[QuickServe] Matched products for this feedback:', [...matchedProductNames]);
            
            // Create ONE QuickRequest with combined product names
            if (matchedProductNames.size > 0) {
              // Combine all product names with " + "
              const combinedProductName = [...matchedProductNames].join(" + ");
              
              console.log('[QuickServe] Creating single request for:', combinedProductName, 'table:', t.name);
              results.push({
                complainId: c.complainId, // Keep original complainId (single record)
                tableId: t.id,
                tableName: t.name,
                productId: "", // Empty - will handle serving differently for combined items
                productName: combinedProductName,
              });
            } else {
              // Fallback: Use original feedback text if no products matched
              console.warn('[QuickServe] No product match found, using original feedback:', c.feedBack);
              results.push({
                complainId: c.complainId,
                tableId: t.id,
                tableName: t.name,
                productId: "",
                productName: c.feedBack || "Yêu cầu phục vụ",
              });
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
    // For quick-serve items (condiments, utensils, etc.), we don't add them to the order
    // We just mark the complaint as processed
    
    console.log('[QuickServe] Serving request:', req.productName, 'for table:', req.tableName);
    
    // Extract original complainId (remove any _index suffix if present from old logic)
    const originalComplainId = req.complainId.includes('_') 
      ? req.complainId.split('_')[0] 
      : req.complainId;
    
    // Mark complaint as processed
    await CheckSS(req.tableId, [originalComplainId], `Đã phục vụ: ${req.productName}`, false);
    
    console.log('[QuickServe] Marked complaint as processed:', originalComplainId);
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


