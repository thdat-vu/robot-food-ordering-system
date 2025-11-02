"use client";
import { orderItemHubService } from "@/service/hub/orderItemHubService";
import { Order } from "@/types/kitchen";
import { useEffect, useState } from "react";
import { getApiUrl } from "@/env.config";
import toast from "react-hot-toast"; // ✅ import toast

export function useOrderItemHub() {
  const [latestItem, setLatestItem] = useState<Order | null>(null);
  const [orderList, setOrderList] = useState<Order[]>([]);
  const API_BASE_URL = getApiUrl();

  useEffect(() => {
    async function connect() {
      await orderItemHubService.start(API_BASE_URL);

      orderItemHubService.onOrderItemUpdated((item) => {
        console.log("🆕 Updated item status:", item);
        setLatestItem(item);
        // ✅ Gọi toast thật
        toast.success(`Cập nhật trạng thái món: ${item.itemName} - ${item.status}`);
      });

      orderItemHubService.onOrderItemListUpdated((list) => {
        console.log("📋 List updated:", list);
        setOrderList(list);
        toast(`Danh sách order đã được cập nhật (${list.length} món)`, {
          icon: "🍽️",
        });
      });
    }

    connect();
    return () => orderItemHubService.stop();
  }, []);

  return { latestItem, orderList };
}
