import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Order, OrderStatus, OrderCounts, GroupedOrders, RemainingItems } from '@/types/kitchen';
import { MOCK_ORDERS, SIDEBAR_ANIMATION_DURATION } from '@/constants/kitchen-data';
import { chefService } from '@/service/chef/chefService';
import { useSignalR } from '@/hooks/useSignalR';
import { getApiUrl } from '@/env.config';

export function useKitchenOrders() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<OrderStatus>("đang thực hiện");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [isSidebarAnimating, setIsSidebarAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idMappings, setIdMappings] = useState<any[]>([]);
  const realtimeFetchInFlight = useRef(false);
  const refreshDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const signalRHubUrl = useMemo(() => {
    const apiUrl = getApiUrl();
    const normalizedBase = apiUrl.replace(/\/api\/?$/, '');
    return `${normalizedBase}/orderNotificationHub`;
  }, []);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { orders } = await chefService.fetchOrders(1, 100);
      // Treat an empty payload as a valid state (no orders) instead of an error
      setOrders(orders);
      setIdMappings([]);
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

  // Silent fetch orders from API (for auto-refresh)
  const silentFetchOrders = useCallback(async () => {
    try {
      setError(null);
      
      const { orders } = await chefService.fetchOrders(1, 100);
      // Always sync to latest payload, even when empty, so UI shows "không có món"
      setOrders(orders);
      setIdMappings([]);
    } catch (err) {
      console.error('Error silently fetching orders:', err);
      // Don't set error for silent refresh to avoid UI disruption
    }
  }, []);

  const triggerRealtimeRefresh = useCallback(async () => {
    // Clear any pending debounced refresh
    if (refreshDebounceTimeout.current) {
      clearTimeout(refreshDebounceTimeout.current);
      refreshDebounceTimeout.current = null;
    }

    // Debounce rapid notifications (e.g., Remark -> Preparing in quick succession)
    refreshDebounceTimeout.current = setTimeout(async () => {
      // If a refresh is already in progress, wait a bit more
      if (realtimeFetchInFlight.current) {
        console.log('⏳ Refresh in progress, scheduling another refresh...');
        setTimeout(async () => {
          if (!realtimeFetchInFlight.current) {
            realtimeFetchInFlight.current = true;
            try {
              console.log('🔄 Executing scheduled refresh...');
              await silentFetchOrders();
              console.log('✅ Scheduled refresh completed');
            } finally {
              realtimeFetchInFlight.current = false;
            }
          }
        }, 500);
        return;
      }
      
      console.log('🔄 Triggering realtime refresh...');
      realtimeFetchInFlight.current = true;
      try {
        await silentFetchOrders();
        console.log('✅ Realtime refresh completed');
      } finally {
        realtimeFetchInFlight.current = false;
      }
    }, 300); // 300ms debounce to batch rapid notifications
  }, [silentFetchOrders]);

  const hubMethods = useMemo(
    () => ({
      OrderItemStatusChanged: (data?: any) => {
        console.log('🔔 OrderItemStatusChanged notification received', data);
        triggerRealtimeRefresh();
      },
      OrderStatusChanged: (data?: any) => {
        console.log('🔔 OrderStatusChanged notification received', data);
        triggerRealtimeRefresh();
      },
      KitchenNotification: (data?: any) => {
        console.log('🔔 KitchenNotification received', data);
        triggerRealtimeRefresh();
      },
    }),
    [triggerRealtimeRefresh]
  );

  const { isConnected: isRealtimeConnected } = useSignalR({
    url: signalRHubUrl,
    groupName: 'Kitchen',
    hubMethods,
  });

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

  // Group filtered orders by item name only (sizes are merged)
  // Previous behavior (kept for reference, do not remove):
  // const groupedOrders = useMemo((): GroupedOrders => {
  //   const grouped: GroupedOrders = {};
  //   
  //   filteredOrders.forEach(order => {
  //     const sizeKey = order.sizeName?.trim().toLowerCase() || '__NO_SIZE__';
  //     const groupKey = `${order.itemName}__${sizeKey}`;
  //     
  //     if (!grouped[groupKey]) {
  //       grouped[groupKey] = [];
  //     }
  //     grouped[groupKey].push(order);
  //   });
  //   
  //   return grouped;
  // }, [filteredOrders]);
  const groupedOrders = useMemo((): GroupedOrders => {
    const grouped: GroupedOrders = {};
    
    filteredOrders.forEach(order => {
      const groupKey = order.itemName;
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(order);
    });
    
    return grouped;
  }, [filteredOrders]);

  // Calculate order counts by status (each API item is now individual, so count items directly)
  const orderCounts = useMemo((): OrderCounts => {
    return {
      all: orders.length,
      toCook: orders.filter(order => order.status === "đang chờ").length,
      ready: orders.filter(order => order.status === "đang thực hiện").length,
      completed: orders.filter(order => order.status === "bắt đầu phục vụ").length,
      redo: orders.filter(order => order.status === "yêu cầu làm lại").length
    };
  }, [orders]);

  // Calculate remaining items (not completed, not served, not cancelled)
  const remainingItems = useMemo((): RemainingItems => {
    const remaining: RemainingItems = {};
    
    orders.forEach(order => {
      if (order.status !== "bắt đầu phục vụ" && order.status !== "đã phục vụ" && order.status !== "đã huỷ") {
        remaining[order.itemName] = (remaining[order.itemName] || 0) + 1; // Count individual items
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
      case "yêu cầu làm lại": return orderCounts.redo;
      default: return 0;
    }
  };

  // Update order status to "đang thực hiện" via service
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

      // Update via service: Preparing (2)
      const response = await chefService.setOrderItemPreparing(order.apiOrderId, order.apiItemId);
      if (response.statusCode !== 200) {
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

  // Update specific order status to "bắt đầu phục vụ" via service
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

      // Update via service: Ready (3)
      const response = await chefService.setOrderItemReady(order.apiOrderId, order.apiItemId);
      if (response.statusCode !== 200) {
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

  // Accept redo request - change status from "yêu cầu làm lại" to "đang thực hiện"
  const handleAcceptRedoRequest = useCallback(async (orderId: number): Promise<void> => {
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
            ? { ...order, status: "đang thực hiện" }
            : order
        )
      );

      // Update via service: Preparing (2)
      const response = await chefService.setOrderItemPreparing(order.apiOrderId, order.apiItemId);
      if (response.statusCode !== 200) {
        throw new Error(response.message || 'Failed to update order status');
      }

      console.log('Redo request accepted successfully via API');
      
    } catch (err) {
      console.error('Error accepting redo request:', err);
      // Revert the change if API call fails
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: "yêu cầu làm lại" }
            : order
        )
      );
      throw err; // Re-throw to let the UI handle the error
    }
  }, [orders]);

  // Reject redo request - change status from "yêu cầu làm lại" to "cancelled"
  const handleRejectRedoRequest = useCallback(async (orderId: number): Promise<void> => {
    try {
      // Find the order to get its API ID
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        console.error('Order not found:', orderId);
        return;
      }

      // Update local state immediately for better UX - remove from orders list
      setOrders(prevOrders => 
        prevOrders.filter(order => order.id !== orderId)
      );

      // Update via service: Cancelled (6)
      const response = await chefService.setOrderItemCancelled(order.apiOrderId, order.apiItemId);
      if (response.statusCode !== 200) {
        throw new Error(response.message || 'Failed to update order status');
      }

      console.log('Redo request rejected successfully via API');
      
    } catch (err) {
      console.error('Error rejecting redo request:', err);
      // Revert the change if API call fails
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: "yêu cầu làm lại" }
            : order
        )
      );
      throw err; // Re-throw to let the UI handle the error
    }
  }, [orders]);

  // Cancel an order item from any state that is not already served
  const handleCancelOrder = useCallback(async (orderId: number, remarkNote?: string): Promise<void> => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        console.error('Order not found:', orderId);
        return;
      }

      // Optimistic update: remove item from local list
      setOrders(prev => prev.filter(o => o.id !== orderId));

      // Update via service to Cancelled (6)
      const response = await chefService.setOrderItemCancelled(order.apiOrderId, order.apiItemId, remarkNote);
      if (response.statusCode !== 200) {
        throw new Error(response.message || 'Failed to cancel order item');
      }
    } catch (err) {
      console.error('Error cancelling order item:', err);
      // If failed, refetch to restore accurate state
      await fetchOrders();
      throw err;
    }
  }, [orders, fetchOrders]);

  // Refresh orders from API
  const refreshOrders = useCallback((silent: boolean = false) => {
    if (!silent) {
      fetchOrders();
    } else {
      silentFetchOrders();
    }
  }, [fetchOrders, silentFetchOrders]);

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
    handleAcceptRedoRequest,
    handleRejectRedoRequest,
    handleCancelOrder,
    refreshOrders,
    isRealtimeConnected,
    
    // Helpers
    shouldShowInSidebar,
    getTabCount,
  };
} 