import { useState } from "react";
import { ApiBaseResponse, ApiOrderResponse } from "@/lib/api/orders";

export const useDateRangeSearch = (
  tableId: string,
  getOrdersByTableIdOnly: (
    tableId: string,
    startDate?: string | null,
    endDate?: string | null
  ) => Promise<ApiBaseResponse<ApiOrderResponse[]>>
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchOrders = async (startDate: string | null, endDate: string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getOrdersByTableIdOnly(tableId, startDate, endDate);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải đơn hàng");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { searchOrders, isLoading, error };
};
