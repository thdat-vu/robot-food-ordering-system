import { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, OrderStatus, OrderCounts, GroupedOrders, RemainingItems } from '@/types/kitchen';
import { MOCK_ORDERS, SIDEBAR_ANIMATION_DURATION } from '@/constants/kitchen-data';
import { ordersApi } from '@/lib/api/orders';
import { transformApiOrdersToOrders, mapFrontendStatusToApi } from '@/lib/utils/order-transformer';

export function useKitchenOrders() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<OrderStatus>("đang chờ");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [isSidebarAnimating, setIsSidebarAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idMappings, setIdMappings] = useState<any[]>([]);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ordersApi.getOrders(1, 100); // Get first 100 orders
      
      if (response.data && response.data.length > 0) {
        const transformedOrders = transformApiOrdersToOrders(response.data);
        setOrders(transformedOrders);
        setIdMappings([]); // For now, we'll use empty mappings
      } else {
        console.error('Failed to fetch orders: No data received');
        setError('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error fetching orders');
      // Fallback to mock data if API fails
      setOrders(MOCK_ORDERS);
      setIdMappings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders by status and category
  const filteredOrders = useMemo((): Order[] => {
    return orders.filter(order => {
      const statusMatch = order.status === activeTab;
      const categoryMatch = selectedCategory === "Tất cả" || order.category === selectedCategory;
      return statusMatch && categoryMatch;
    });
  }, [orders, activeTab, selectedCategory]);

  // Group filtered orders by item name
  const groupedOrders = useMemo((): GroupedOrders => {
    const grouped: GroupedOrders = {};
    
    filteredOrders.forEach(order => {
      if (!grouped[order.itemName]) {
        grouped[order.itemName] = [];
      }
      grouped[order.itemName].push(order);
    });
    
    return grouped;
  }, [filteredOrders]);

  // Calculate order counts by status
  const orderCounts = useMemo((): OrderCounts => {
    return {
      all: orders.length,
      toCook: orders.filter(order => order.status === "đang chờ").length,
      ready: orders.filter(order => order.status === "đang thực hiện").length,
      completed: orders.filter(order => order.status === "bắt đầu phục vụ").length
    };
  }, [orders]);

  // Calculate remaining items (not completed)
  const remainingItems = useMemo((): RemainingItems => {
    const remaining: RemainingItems = {};
    
    orders.forEach(order => {
      if (order.status !== "bắt đầu phục vụ") {
        remaining[order.itemName] = (remaining[order.itemName] || 0) + 1;
      }
    });
    
    return remaining;
  }, [orders]);

  // Create a mapping from itemName to category
  const itemNameToCategory = useMemo(() => {
    const map: Record<string, string> = {};
    orders.forEach(order => {
      if (!map[order.itemName]) {
        map[order.itemName] = order.category;
      }
    });
    return map;
  }, [orders]);

  // Check if item should be shown in sidebar
  const shouldShowInSidebar = (itemName: string): boolean => {
    return remainingItems[itemName] > 0;
  };

  // Get count for specific tab
  const getTabCount = (status: OrderStatus): number => {
    switch (status) {
      case "đang chờ": return orderCounts.toCook;
      case "đang thực hiện": return orderCounts.ready;
      case "bắt đầu phục vụ": return orderCounts.completed;
      default: return 0;
    }
  };

  // Update order status to "đang thực hiện" via API
  const handlePrepareOrders = useCallback(async (orderId: number): Promise<void> => {
    try {
      // Find the order to get its API ID
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        console.error('Order not found:', orderId);
        return;
      }

      // Update local state immediately for better UX
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId && order.status === "đang chờ"
            ? { ...order, status: "đang thực hiện" }
            : order
        )
      );
      setExpandedGroup(null);

      // Make API call to update order item status to "Preparing" (status 2)
      const response = await ordersApi.updateOrderItemStatus(
        order.apiOrderId,
        order.apiItemId,
        2 // Preparing status
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to update order status');
      }

      console.log('Order status updated successfully via API');
      
    } catch (err) {
      console.error('Error updating order status:', err);
      // Revert the change if API call fails
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: "đang chờ" }
            : order
        )
      );
      throw err; // Re-throw to let the UI handle the error
    }
  }, [orders]);

  // Update specific order status to "bắt đầu phục vụ" via API
  const handleServeOrder = useCallback(async (orderId: number): Promise<void> => {
    try {
      // Find the order to get its API ID
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        console.error('Order not found:', orderId);
        return;
      }

      // Update local state immediately for better UX
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId
            ? { ...order, status: "bắt đầu phục vụ" }
            : order
        )
      );

      // Make API call to update order item status to "Ready" (status 3)
      const response = await ordersApi.updateOrderItemStatus(
        order.apiOrderId,
        order.apiItemId,
        3 // Ready status
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to update order status');
      }

      console.log('Order status updated successfully via API');
      
    } catch (err) {
      console.error('Error updating order status:', err);
      // Revert the change if API call fails
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: "đang thực hiện" }
            : order
        )
      );
      throw err; // Re-throw to let the UI handle the error
    }
  }, [orders]);

  // Refresh orders from API
  const refreshOrders = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Effect to handle sidebar animation
  useEffect(() => {
    const allCompleted = Object.values(groupedOrders).every(group => 
      group.every(order => order.status === "bắt đầu phục vụ")
    );

    if (allCompleted && !isSidebarAnimating) {
      setIsSidebarAnimating(true);
      setTimeout(() => {
        setIsSidebarAnimating(false);
      }, SIDEBAR_ANIMATION_DURATION);
    } else if (!allCompleted && isSidebarAnimating) {
      setIsSidebarAnimating(false);
    }
  }, [groupedOrders, isSidebarAnimating]);

  return {
    // State
    orders,
    activeTab,
    selectedCategory,
    expandedGroup,
    isSidebarAnimating,
    isLoading,
    error,
    
    // Computed values
    filteredOrders,
    groupedOrders,
    orderCounts,
    remainingItems,
    itemNameToCategory,
    
    // Actions
    setActiveTab,
    setSelectedCategory,
    setExpandedGroup,
    handlePrepareOrders,
    handleServeOrder,
    refreshOrders,
    
    // Helpers
    shouldShowInSidebar,
    getTabCount,
  };
} 