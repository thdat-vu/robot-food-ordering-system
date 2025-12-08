"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetAllFeedbackHome } from "@/hooks/moderator/useFeedbackHooks";
import { useSignalR } from "@/hooks/useSignalR";
import { getApiUrl } from "@/env.config";
import type { TableData } from "@/entites/moderator/FeedbackModole";

type TablesMap = Record<string, TableData>;
type HubMethods = Record<string, (...args: any[]) => void>;

export function useModeratorRealtimeTables() {
  const { run } = useGetAllFeedbackHome();

  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  }, [run]);

  const [data, setData] = useState<TablesMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hubUrl = useMemo(() => {
    const apiUrl = getApiUrl();
    const normalizedBase = apiUrl.replace(/\/api\/?$/, "");
    return `${normalizedBase}/hubs/moderator-dashboard`;
  }, []);

  const fallbackInFlight = useRef(false);
  const fallbackTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchSnapshot = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);

      const res = await runRef.current();
      const newData = (res as any)?.data as TablesMap | undefined;
      if (!newData || typeof newData !== "object") return;

      setData(newData);
    } catch (e) {
      console.error("Moderator fetch error:", e);
      if (!silent) setError("Có lỗi khi tải dữ liệu bàn.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  const fallbackRefresh = useCallback(() => {
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);

    fallbackTimer.current = setTimeout(async () => {
      if (fallbackInFlight.current) return;
      fallbackInFlight.current = true;
      try {
        await fetchSnapshot(true);
      } finally {
        fallbackInFlight.current = false;
      }
    }, 400);
  }, [fetchSnapshot]);

  const hubMethods: HubMethods = useMemo(
    () => ({
      // ✅ Snapshot: BE bắn 1 payload object (snapshot)
      PendingComplainsSnapshotUpdated: (payload: any) => {
        const snap = payload?.data ?? payload;

        if (snap && typeof snap === "object") {
          setData(snap as TablesMap);
          setIsLoading(false);
          return;
        }

        fallbackRefresh();
      },

      // ✅ Delta: BE bắn 2 args (tableId, info)
      DashboardTableUpdated: (tableId: string, info: any) => {
        console.log("📩 [SR] DashboardTableUpdated", tableId, info);

        if (!tableId || !info) return fallbackRefresh();

        setData((prev) => ({ ...prev, [tableId]: info as TableData }));
      },

      // (optional) nếu còn bắn event cũ thì bắt luôn
      PendingComplainTableUpdated: (tableId: string, info: any) => {
        console.log("📩 [SR] PendingComplainTableUpdated", tableId, info);

        if (!tableId || !info) return fallbackRefresh();

        setData((prev) => ({ ...prev, [tableId]: info as TableData }));
      },
    }),
    [fallbackRefresh]
  );

  const { isConnected } = useSignalR({
    url: hubUrl,
    groupName: "Moderators",
    hubMethods,
  });

  useEffect(() => {
    fetchSnapshot(false);
    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, [fetchSnapshot]);

  return {
    data,
    isLoading,
    error,
    isRealtimeConnected: isConnected,
    refresh: () => fetchSnapshot(false),
  };
}
