"use client";
import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { OrderData } from "@/entites/moderator/tableModel";
import { getApiUrl } from "@/env.config";
import OrderCard from "@/components/moderator/OrderCard";

interface HistoryPageProps {
  idTable: string;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ idTable }) => {
  const [orderData, setOrderData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const API_BASE = getApiUrl();

  // Fetch orders khi component mount hoặc idTable thay đổi
  useEffect(() => {
    if (idTable) {
      fetchOrders();
    }
  }, [idTable]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/Order/table/${idTable}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const result = await response.json();
      setOrderData(result?.data || []);
    } catch (err) {
      setOrderData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOrderExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Tính toán số lượng theo status

  return (
    <div className="h-full flex flex-col">
      {/* Orders List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải đơn hàng...</p>
            </div>
          </div>
        ) : orderData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Chưa có đơn hàng
              </h3>
              <p className="text-gray-500">Chưa có đơn hàng nào cho bàn này</p>
            </div>
          </div>
        ) : (
          <OrderCard
            tableId={idTable}
            orders={orderData}
            onToggleExpand={handleToggleOrderExpand}
            expandedOrderId={expandedOrderId}
            showDateFilter={true}
          />
        )}
      </div>

      {orderData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Tổng cộng:{" "}
            <span className="font-bold text-emerald-600">
              {orderData.length}
            </span>{" "}
            đơn hàng
          </p>
        </div>
      )}
    </div>
  );
};
