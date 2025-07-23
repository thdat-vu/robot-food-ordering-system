import { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, OrderCounts, GroupedOrders, RemainingItems } from '@/types/kitchen';
import { MOCK_ORDERS, SIDEBAR_ANIMATION_DURATION } from '@/constants/kitchen-data';

export function useKitchenOrders() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<OrderStatus>("đang chờ");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [isSidebarAnimating, setIsSidebarAnimating] = useState(false);

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

  // Update order status to "đang thực hiện"
  const handlePrepareOrders = (orderId: number): void => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId && order.status === "đang chờ"
          ? { ...order, status: "đang thực hiện" }
          : order
      )
    );
    setExpandedGroup(null);
  };

  // Update specific order status to "bắt đầu phục vụ"
  const handleServeOrder = (orderId: number): void => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId
          ? { ...order, status: "bắt đầu phục vụ" }
          : order
      )
    );
  };

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
    
    // Computed values
    filteredOrders,
    groupedOrders,
    orderCounts,
    remainingItems,
    itemNameToCategory, // <-- add this
    
    // Actions
    setActiveTab,
    setSelectedCategory,
    setExpandedGroup,
    handlePrepareOrders,
    handleServeOrder,
    
    // Helpers
    shouldShowInSidebar,
    getTabCount,
  };
} 