import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {categoriesApi, ApiProductCategoryResponse} from "@/lib/api/categories";
import axios from "@/lib/axios";
import { useSignalR } from "@/hooks/useSignalR";
import { getApiUrl } from "@/env.config";

export interface QuickRequest {
  id: string;          // QuickServeItemId
  complainId: string;
  tableId: string;
  tableName: string;
  itemName: string;
  isServed: boolean;
  createdTime?: string;
  lastUpdatedTime?: string;
}

const QUICK_CATEGORY_NAME = "phục vụ nhanh";

export function useQuickServe() {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<QuickRequest[]>([]);
  const [servedRequests, setServedRequests] = useState<QuickRequest[]>([]);
  const realtimeFetchInFlight = useRef(false);

  const apiBaseUrl = useMemo(() => getApiUrl(), []);

  const signalRHubUrl = useMemo(() => {
    const normalizedBase = apiBaseUrl.replace(/\/api\/?$/, "");
    return `${normalizedBase}/orderNotificationHub`;
  }, [apiBaseUrl]);

  // Fetch pending quick-serve items from backend QuickServe API

  const fetchQuickRequestsForActiveTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBaseUrl}/Complain/QuickServe/pending`);
      const data: any[] = res.data?.data ?? [];

      const mapped: QuickRequest[] = data.map((item) => ({
        id: item.id,
        complainId: item.complainId,
        tableId: item.tableId,
        tableName: item.tableName,
        itemName: item.itemName,
        isServed: item.isServed,
        createdTime: item.createdTime,
        lastUpdatedTime: item.lastUpdatedTime,
      }));

      console.log('[QuickServe] Pending quick-serve items:', mapped);
      setRequests(mapped);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  const fetchServedQuickRequests = useCallback(async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/Complain/QuickServe/served`);
      const data: any[] = res.data?.data ?? [];

      const mapped: QuickRequest[] = data.map((item) => ({
        id: item.id,
        complainId: item.complainId,
        tableId: item.tableId,
        tableName: item.tableName,
        itemName: item.itemName,
        isServed: item.isServed,
        createdTime: item.createdTime,
        lastUpdatedTime: item.lastUpdatedTime,
      }));

      console.log('[QuickServe] Served quick-serve items:', mapped);
      setServedRequests(mapped);
    } catch (err) {
      console.warn('[QuickServe] Failed to fetch served items', err);
    }
  }, [apiBaseUrl]);

  const serveQuickRequest = useCallback(async (req: QuickRequest) => {
    console.log('[QuickServe] Serving quick item:', req.itemName, 'for table:', req.tableName);

    await axios.post(`${apiBaseUrl}/Complain/QuickServe/serve/${req.id}`);

    console.log('[QuickServe] Marked quick-serve item as served:', req.id);
  }, [apiBaseUrl]);

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
    fetchQuickRequestsForActiveTables();
    fetchServedQuickRequests();
  }, [fetchQuickRequestsForActiveTables, fetchServedQuickRequests]);

  const hubMethods = useMemo(
    () => ({
      OrderItemStatusChanged: () => {
        triggerRealtimeRefresh();
        fetchServedQuickRequests();
      },
      OrderStatusChanged: () => {
        triggerRealtimeRefresh();
        fetchServedQuickRequests();
      },
      WaiterNotification: () => {
        triggerRealtimeRefresh();
        fetchServedQuickRequests();
      },
    }),
    [triggerRealtimeRefresh, fetchServedQuickRequests]
  );

  const { isConnected: isRealtimeConnected } = useSignalR({
    url: signalRHubUrl,
    groupName: "Waiters",
    hubMethods,
  });

  return {
    loading,
    requests,
    servedRequests,
    fetchQuickRequestsForActiveTables,
    fetchServedQuickRequests,
    serveQuickRequest,
    isRealtimeConnected,
  };
}


