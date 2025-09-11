import { useState, useEffect, useCallback } from 'react';
import { OrderData } from '@/entites/moderator/tableModel';

const useDateFilter = (
    initialOrders: OrderData[],
    tableId?: string,
    getOrdersFunction?: (tableId: string, startDate?: string | null, endDate?: string | null) => Promise<{ data: OrderData[] }>
  ) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredOrders, setFilteredOrders] = useState<OrderData[]>(initialOrders);
    const [currentDateRange, setCurrentDateRange] = useState<{
      startDate: string | null;
      endDate: string | null;
    }>({ startDate: null, endDate: null });
  
    // Update filtered orders when initial orders change
    useEffect(() => {
      if (currentDateRange.startDate === null && currentDateRange.endDate === null) {
        setFilteredOrders(initialOrders);
      }
    }, [initialOrders, currentDateRange]);
  
    const searchByDateRange = useCallback(async (startDate: string | null, endDate: string | null) => {
      if (!tableId || !getOrdersFunction) {
        // Client-side filtering
        const filtered = initialOrders.filter(order => {
          const orderDate = new Date(order.createdTime);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
  
          if (start && orderDate < start) return false;
          if (end) {
            const endOfDay = new Date(end);
            endOfDay.setHours(23, 59, 59, 999);
            if (orderDate > endOfDay) return false;
          }
          return true;
        });
        
        setFilteredOrders(filtered);
        setCurrentDateRange({ startDate, endDate });
        return;
      }
  
      // Server-side filtering
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getOrdersFunction(tableId, startDate, endDate);
        setFilteredOrders(response.data);
        setCurrentDateRange({ startDate, endDate });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải đơn hàng');
      } finally {
        setIsLoading(false);
      }
    }, [tableId, getOrdersFunction, initialOrders]);
  
    const clearError = () => setError(null);
  
    return {
      filteredOrders,
      isLoading,
      error,
      currentDateRange,
      searchByDateRange,
      clearError
    };
  };

export default useDateFilter;