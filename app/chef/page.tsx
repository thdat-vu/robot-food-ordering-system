'use client';

import React, { useState, Suspense, useEffect, useMemo, useCallback, useRef } from 'react';
import { useCustomRouter } from '@/lib/custom-router';

// Types
import { Order, OrderStatus } from '@/types/kitchen';

// Constants
import { CATEGORIES } from '@/constants/kitchen-data';

// Hooks
import { useKitchenOrders } from '@/hooks/use-kitchen-orders';
import { useToastKitchen } from '@/hooks/use-toast-kitchen';
import { useGetAllFeedbackHome } from '@/hooks/moderator/useFeedbackHooks';

// Components
import { ToastContainer } from '@/components/kitchen/ToastContainer';
import { ConfirmationModal } from '@/components/kitchen/ConfirmationModal';
import { NavigationTabs } from '@/components/kitchen/NavigationTabs';
import { KitchenSidebar } from '@/components/kitchen/KitchenSidebar';
import { KitchenSidebarByTable } from '@/components/kitchen/KitchenSidebarByTable';
import { OrdersContent } from '@/components/kitchen/OrdersContent';
import { InfoModal } from '@/components/kitchen/InfoModal';
import { SearchResultsModal } from '@/components/kitchen/SearchResultsModal';
import { MatchSuggestionModal, MatchSuggestion } from '@/components/kitchen/MatchSuggestionModal';
import UserMenu from '@/components/common/UserMenu';
import AuthGuard from '@/components/common/AuthGuard';
import { chefService } from '@/service/chef/chefService';

const formatCurrentDateTime = (date: Date): string => {
  const weekdayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const weekday = weekdayNames[date.getDay()] ?? '';
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${weekday} - ${day}/${month}/${year} - ${hours}:${minutes}`;
};

function ChiefPageContent() {
  const router = useCustomRouter();
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalAction, setModalAction] = useState<'serve' | 'reject'>('serve');
  const [isPriorityInfoOpen, setIsPriorityInfoOpen] = useState(false);
  const [isDessertPriorityInfoOpen, setIsDessertPriorityInfoOpen] = useState(false);
  const [lastCheckedGroup, setLastCheckedGroup] = useState<{ itemName: string; tableNumber: number; id: number }[] | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<string>(() => formatCurrentDateTime(new Date()));

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedSearchProduct, setSelectedSearchProduct] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Sidebar item selection state
  const [selectedOrderKey, setSelectedOrderKey] = useState<{ itemName: string; tableNumber: number; id: number } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{ itemName: string; tableNumber: number; id: number }[] | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<{ itemName: string; tableNumber: number; id: number }[][]>([]);
  const [hasManualSelection, setHasManualSelection] = useState(false);
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>('byDish');
  const [matchSuggestions, setMatchSuggestions] = useState<MatchSuggestion[] | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const matchSuggestionSignatureRef = useRef<string | null>(null);
  const tableFetchInFlight = useRef(false);
  
  // Animation state for disappearing items
  const [animatingOutIds, setAnimatingOutIds] = useState<Set<number>>(new Set());

  // Custom hooks
  const {
    orders,
    activeTab,
    selectedCategory,
    expandedGroup,
    groupedOrders,
    remainingItems,
    isLoading,
    error,
    setActiveTab,
    setSelectedCategory,
    setExpandedGroup,
    handlePrepareOrders,
    handleServeOrder,
    handleAcceptRedoRequest,
    handleRejectRedoRequest,
    handleCancelOrder,
    refreshOrders,
    shouldShowInSidebar,
    getTabCount,
    itemNameToCategory,
  } = useKitchenOrders();


  const { toasts, addToast, removeToast } = useToastKitchen();

  // Fetch table data for late dish warnings
  const { run: fetchTableData } = useGetAllFeedbackHome();
  const [tableDataMap, setTableDataMap] = useState<Record<number, any>>({});

  const isPageVisible = () => {
    if (typeof document === 'undefined') return true;
    return !document.hidden;
  };

  // Extract table number from tableName (e.g., "Bàn 4" -> 4)
  const extractTableNumber = (tableName: string): number | null => {
    const match = tableName.match(/Bàn\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  // Fetch table data periodically for late dish warnings
  useEffect(() => {
    let isMounted = true;

    const loadTableData = async () => {
      if (!isPageVisible()) return;
      if (tableFetchInFlight.current) return;
      try {
        tableFetchInFlight.current = true;
        const res = await fetchTableData();
        if (!res || typeof res !== "object") return;

        const tableData = (res as any).data;
        if (!tableData || typeof tableData !== "object") return;

        if (!isMounted) return;

        // Map tableName -> TableData to tableNumber -> TableData
        // Same logic as moderator screen
        const map: Record<number, any> = {};
        Object.values(tableData).forEach((table: any) => {
          if (table?.tableName) {
            const tableNumber = extractTableNumber(table.tableName);
            if (tableNumber !== null) {
              // Ensure we have all required fields for LateDishWarning
              // isWaitingDish, waitingDurationInMinutes, pendingItems should come from API
              map[tableNumber] = {
                ...table,
                // Ensure these fields exist (they should come from API)
                isWaitingDish: table.isWaitingDish ?? false,
                waitingDurationInMinutes: table.waitingDurationInMinutes ?? null,
                pendingItems: table.pendingItems ?? 0,
              };
            }
          }
        });

        setTableDataMap(prev => {
          // Only update if data actually changed to avoid unnecessary re-renders
          const prevStr = JSON.stringify(prev);
          const newStr = JSON.stringify(map);
          return prevStr === newStr ? prev : map;
        });
      } catch (error) {
        console.error("Error loading table data for late dish warnings:", error);
      } finally {
        tableFetchInFlight.current = false;
      }
    };

    loadTableData();
    // Poll every 5 seconds with visibility + in-flight guard to avoid spamming API
    const interval = setInterval(loadTableData, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchTableData]);

  // Dynamic search functionality
  const getSearchableProducts = useCallback(() => {
    // Only search items currently in 'đang chờ'
    const pendingOrders = orders.filter(order => order.status === 'đang chờ');
    
    // Get unique product names
    const uniqueProducts = [...new Set(pendingOrders.map(order => order.itemName))];
    return uniqueProducts;
  }, [orders]);

  // Update search results when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const allProducts = getSearchableProducts();
    const filteredProducts = allProducts.filter(product =>
      product.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(filteredProducts);
    setShowSearchDropdown(filteredProducts.length > 0);
  }, [searchQuery, getSearchableProducts]);

  // Handle product selection from search
  const handleProductSelect = (productName: string) => {
    setSelectedSearchProduct(productName);
    setShowSearchModal(true);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  // Get orders for selected product sorted by newest first
  const getSelectedProductOrders = useCallback(() => {
    if (!selectedSearchProduct) return [];
    
    const productOrders = orders.filter(order => 
      order.itemName === selectedSearchProduct &&
      order.status !== 'đã phục vụ' && order.status !== 'đã huỷ'
    );
    
    // Sort by newest first (descending order)
    return productOrders.sort((a, b) => {
      // Use createdTime if available, otherwise use orderTime
      const timeA = a.createdTime || a.orderTime;
      const timeB = b.createdTime || b.orderTime;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
  }, [selectedSearchProduct, orders]);

  // Handle cancel order for search results (only for 'đang chờ' status)
  const handleCancelFromSearch = async (order: Order, reason?: string) => {
    if (order.status !== 'đang chờ') {
      addToast('Chỉ có thể huỷ món ở trạng thái "đang chờ"', 'error');
      return;
    }
    
    try {
      // Explicitly cancel the specific API order item ID to avoid cancelling all items
      await chefService.setOrderItemCancelled(order.apiOrderId, order.apiItemId, reason);
      // Refresh to reflect latest state
      await refreshOrders(false);
      addToast(`Đã huỷ món: ${order.itemName}`, 'success');
    } catch (error) {
      addToast(`Lỗi khi huỷ món: ${order.itemName}`, 'error');
    }
  };

  // Build set of currently selected order IDs from all selection modes
  const getCurrentlySelectedIds = useCallback((): Set<number> => {
    const ids = new Set<number>();
    if (selectedGroups && selectedGroups.length > 0) {
      selectedGroups.flat().forEach(it => ids.add(it.id));
    }
    if (selectedGroup && selectedGroup.length > 0) {
      selectedGroup.forEach(it => ids.add(it.id));
    }
    if (selectedOrderKey) {
      ids.add(selectedOrderKey.id);
    }
    return ids;
  }, [selectedGroups, selectedGroup, selectedOrderKey]);
  const selectedIds = getCurrentlySelectedIds();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(formatCurrentDateTime(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const leftPanelTabs = useMemo(
    () => ([
      { key: 'byDish' as LeftPanelTab, label: 'Theo món' },
      { key: 'byTable' as LeftPanelTab, label: 'Theo bàn' },
    ]),
    []
  );

  // Check if all items of a category in trạng thái "đang chờ" for specific table(s) are already selected
  const areAllCategorySelectedForTables = useCallback((category: string, tables: number[], proposedSelection?: Set<number>): boolean => {
    const pendingIds = orders
      .filter(o => o.status === 'đang chờ' && o.category === category && tables.includes(o.tableNumber))
      .map(o => o.id);
    if (pendingIds.length === 0) return true; // no pending items on those tables
    const selectedIdsLocal = proposedSelection || getCurrentlySelectedIds();
    return pendingIds.every(id => selectedIdsLocal.has(id));
  }, [orders, getCurrentlySelectedIds]);

  type SelectionItem = { itemName: string; tableNumber: number; id: number };
  type LeftPanelTab = 'byDish' | 'byTable';

  const ALLOWED_MATCH_CATEGORIES = useMemo(() => new Set(['Món chính', 'Đồ uống']), []);
  const normalizeValue = useCallback((value?: string | null) => (value ? value.trim().toLowerCase() : ''), []);
  const normalizeToppings = useCallback((toppings?: string[]) => {
    if (!toppings || toppings.length === 0) return '';
    return toppings
      .map(topping => topping.trim().toLowerCase())
      .sort()
      .join('|');
  }, []);
  // Match key now only uses item name to allow grouping across sizes/notes/toppings.
  // Previous logic (kept for reference):
  // return [
  //   normalizeValue(order.itemName),
  //   normalizeValue(order.sizeName),
  //   normalizeValue(order.note),
  //   normalizeToppings(order.toppings),
  // ].join('::');
  // Last change (ignored size but still used note/toppings):
  // return [
  //   normalizeValue(order.itemName),
  //   normalizeValue(order.note),
  //   normalizeToppings(order.toppings),
  // ].join('::');
  const buildMatchKey = useCallback((order: Order) => {
    return normalizeValue(order.itemName);
  }, [normalizeValue]);

  // ============================================================================
  // TABLE-AWARE WARNING LOGIC (Updated for Context-Aware Priority)
  // ============================================================================
  // Check each table INDIVIDUALLY instead of all tables together.
  // If a table only has desserts (boosted priority), SKIP the check.
  // ============================================================================

  // Show a warning only if selecting/preparing main dishes while NOT all drinks
  // on the SAME table are selected (check PER TABLE, not all tables)
  const maybeWarnForMainSelection = (items: SelectionItem[], proposedSelection?: Set<number>) => {
    if (!items || items.length === 0) return;
    
    // Group items by table
    const tableGroups = new Map<number, SelectionItem[]>();
    items.forEach(item => {
      if (!tableGroups.has(item.tableNumber)) {
        tableGroups.set(item.tableNumber, []);
      }
      tableGroups.get(item.tableNumber)!.push(item);
    });

    // Check each table individually
    for (const [tableNumber, tableItems] of tableGroups) {
      const hasMain = tableItems.some(it => itemNameToCategory[it.itemName] === 'Món chính');
      if (!hasMain) continue; // Skip if this table has no main dishes in selection

      // Check table context: Does this table have drinks in the entire order?
      const tableCategories = getTableCategoryContext.get(tableNumber);
      if (!tableCategories) continue;

      // If table only has desserts (no drinks, no mains), SKIP check
      const hasOnlyDessert = tableCategories.has('Tráng miệng') && 
                            !tableCategories.has('Đồ uống') && 
                            !tableCategories.has('Món chính');
      if (hasOnlyDessert) continue;

      // If table has drinks, check if all drinks are selected
      if (tableCategories.has('Đồ uống')) {
        if (!areAllCategorySelectedForTables('Đồ uống', [tableNumber], proposedSelection)) {
          setIsPriorityInfoOpen(true);
          return; // Show warning and exit
        }
      }
    }
  };

  // Show a warning if selecting/preparing desserts while NOT all main dishes
  // on the SAME table are selected (check PER TABLE, not all tables)
  const maybeWarnForDessertSelection = (items: SelectionItem[], proposedSelection?: Set<number>) => {
    if (!items || items.length === 0) return;
    
    // Group items by table
    const tableGroups = new Map<number, SelectionItem[]>();
    items.forEach(item => {
      if (!tableGroups.has(item.tableNumber)) {
        tableGroups.set(item.tableNumber, []);
      }
      tableGroups.get(item.tableNumber)!.push(item);
    });

    // Check each table individually
    for (const [tableNumber, tableItems] of tableGroups) {
      const hasDessert = tableItems.some(it => itemNameToCategory[it.itemName] === 'Tráng miệng');
      if (!hasDessert) continue; // Skip if this table has no desserts in selection

      // Check table context: Does this table have main dishes in the entire order?
      const tableCategories = getTableCategoryContext.get(tableNumber);
      if (!tableCategories) continue;

      // If table only has desserts (no drinks, no mains), SKIP check (boosted priority case)
      const hasOnlyDessert = tableCategories.has('Tráng miệng') && 
                            !tableCategories.has('Đồ uống') && 
                            !tableCategories.has('Món chính');
      if (hasOnlyDessert) continue;

      // If table has main dishes, check if all main dishes are selected
      if (tableCategories.has('Món chính')) {
        if (!areAllCategorySelectedForTables('Món chính', [tableNumber], proposedSelection)) {
          setIsDessertPriorityInfoOpen(true);
          return; // Show warning and exit
        }
      }
    }
  };

  // Clear all selections when switching tabs to avoid stale CTA selections
  useEffect(() => {
    setSelectedGroups([]);
    setSelectedGroup(null);
    setSelectedOrderKey(null);
    setHasManualSelection(false); // Reset manual selection flag on tab change
  }, [activeTab]);


  // Ensure selections are cleared immediately on tab change (defensive in addition to effect)
  const handleTabChange = useCallback((tab: OrderStatus) => {
    setSelectedGroups([]);
    setSelectedGroup(null);
    setSelectedOrderKey(null);
    setHasManualSelection(false); // Reset manual selection flag on tab change
    setActiveTab(tab);
  }, [setActiveTab]);

  useEffect(() => {
    if (leftPanelTab !== 'byDish') {
      setSelectedGroups([]);
      setSelectedGroup(null);
      setSelectedOrderKey(null);
    }
    setHasManualSelection(false);
  }, [leftPanelTab]);

  // Wrapper function for manual refresh button
  const handleManualRefresh = () => {
    refreshOrders(false); // Use normal refresh for manual button
  };

  // Filter orders based on search query
  const filterOrdersBySearch = (orders: Record<string, Order[]>) => {
    if (!searchQuery.trim()) {
      return orders;
    }

    const filtered: Record<string, Order[]> = {};
    const query = searchQuery.toLowerCase();

    Object.entries(orders).forEach(([itemName, orderList]) => {
      const filteredOrders = orderList.filter(order => 
        order.itemName.toLowerCase().includes(query) ||
        order.tableNumber.toString().includes(query) ||
        (order.toppings && order.toppings.some(topping => 
          topping.toLowerCase().includes(query)
        )) ||
        (order.sizeName && order.sizeName.toLowerCase().includes(query))
      );

      if (filteredOrders.length > 0) {
        filtered[itemName] = filteredOrders;
      }
    });

    return filtered;
  };

  // Event handlers
  const handleGroupClick = (itemName: string) => {
    setExpandedGroup(expandedGroup === itemName ? null : itemName);
  };

  const handlePrepareClick = async (orderId: number, itemName: string) => {
    try {
      // Warning when preparing main dish or dessert with table-specific priority
      const found = orders.find(o => o.id === orderId);
      if (found) {
        const item = { itemName: found.itemName, tableNumber: found.tableNumber, id: found.id };
        maybeWarnForMainSelection([item]);
        maybeWarnForDessertSelection([item]);
      } else {
        // Fallback using provided itemName without table context (no warning)
      }
      await handlePrepareOrders(orderId);
      addToast(`Đã bắt đầu thực hiện món: ${itemName}`, 'success');
      // Clear any existing selections to keep the top-right counter accurate
      setSelectedGroups([]);
      setSelectedGroup(null);
      setSelectedOrderKey(null);
    } catch (error) {
      addToast(`Lỗi khi cập nhật trạng thái: ${itemName}`, 'error');
    }
  };

  const handleServeClick = (order: Order) => {
    setSelectedOrder(order);
    setModalAction('serve');
    setShowModal(true);
  };


  const handleAcceptRedoClick = async (orderId: number, itemName: string) => {
    try {
      await handleAcceptRedoRequest(orderId);
      addToast(`Đã chấp nhận yêu cầu làm lại: ${itemName}`, 'success');
    } catch (error) {
      addToast(`Lỗi khi chấp nhận yêu cầu làm lại: ${itemName}`, 'error');
    }
  };

  const handleRejectRedoClick = async (orderId: number, itemName: string) => {
    try {
      await handleRejectRedoRequest(orderId);
      addToast(`Đã từ chối yêu cầu làm lại: ${itemName}`, 'success');
    } catch (error) {
      addToast(`Lỗi khi từ chối yêu cầu làm lại: ${itemName}`, 'error');
    }
  };

  const handleRejectClick = (order: Order) => {
    setSelectedOrder(order);
    setModalAction('reject');
    setShowModal(true);
  };

  const handleRejectRedoClickWrapper = (orderId: number, itemName: string) => {
    // Find the order in groupedOrders
    const orderList = Object.values(groupedOrders as Record<string, Order[]>).flat();
    const order = orderList.find(o => o.id === orderId);
    if (order) {
      handleRejectClick(order);
    }
  };

  const handleConfirmServe = async () => {
    if (selectedOrder) {
      try {
        await handleServeOrder(selectedOrder.id);
        addToast(`Đã bắt đầu phục vụ món: ${selectedOrder.itemName}`, 'success');
      } catch (error) {
        addToast(`Lỗi khi cập nhật trạng thái: ${selectedOrder.itemName}`, 'error');
      }
    }
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleConfirmReject = async () => {
    if (selectedOrder) {
      try {
        await handleRejectRedoRequest(selectedOrder.id);
        addToast(`Đã từ chối yêu cầu làm lại: ${selectedOrder.itemName}`, 'success');
      } catch (error) {
        addToast(`Lỗi khi từ chối yêu cầu làm lại: ${selectedOrder.itemName}`, 'error');
      }
    }
    setShowModal(false);
    setSelectedOrder(null);
  };

  // const handleConfirmCancel = async () => {
  //   if (selectedOrder) {
  //     try {
  //       await handleCancelOrder(selectedOrder.id);
  //       addToast(`Đã huỷ món: ${selectedOrder.itemName}`, 'success');
  //     } catch (error) {
  //       addToast(`Lỗi khi huỷ món: ${selectedOrder.itemName}`, 'error');
  //     }
  //   }
  //   setShowModal(false);
  //   setSelectedOrder(null);
  // };

  // const handleCancelModal = () => {
  //   setShowModal(false);
  //   setSelectedOrder(null);
  // };

  // Sidebar item click handler
  const handleSidebarItemClick = (orderKey: { itemName: string; tableNumber: number; id: number }) => {
    setHasManualSelection(true); // Mark as manual selection
    
    // Determine if this action will deselect the current selection
    const willDeselect =
      !!selectedOrderKey &&
      selectedOrderKey.itemName === orderKey.itemName &&
      selectedOrderKey.tableNumber === orderKey.tableNumber &&
      selectedOrderKey.id === orderKey.id;

    // Only warn on selection (not on deselection)
    if (!willDeselect) {
      // Create proposed selection for the single item being selected
      const proposedSelection = new Set([orderKey.id]);
      maybeWarnForMainSelection([orderKey], proposedSelection);
      maybeWarnForDessertSelection([orderKey], proposedSelection);
    }
    setSelectedOrderKey(prev => {
      if (
        prev &&
        prev.itemName === orderKey.itemName &&
        prev.tableNumber === orderKey.tableNumber &&
        prev.id === orderKey.id
      ) {
        return null;
      }
      return orderKey;
    });
  };

  // Group selection handler
  const handleGroupSelection = (group: { itemName: string; tableNumber: number; id: number }[]) => {
    setHasManualSelection(true); // Mark as manual selection
    
    // Toggle logic: if the same group is selected, deselect it
    // Warning for main/dessert priorities on the same table(s). Only on selection.
    const isSameAsSelected = (() => {
      if (!selectedGroup || !group || selectedGroup.length !== group.length) return false;
      return selectedGroup.every((item, index) =>
        item.itemName === group[index].itemName &&
        item.tableNumber === group[index].tableNumber &&
        item.id === group[index].id
      );
    })();
    if (group && group.length > 0 && !isSameAsSelected) {
      // Create proposed selection for the group being selected
      const proposedSelection = new Set(group.map(item => item.id));
      maybeWarnForMainSelection(group, proposedSelection);
      maybeWarnForDessertSelection(group, proposedSelection);
    }
    setSelectedGroup(prev => {
      if (prev && prev.length === group.length && 
          prev.every((item, index) => 
            item.itemName === group[index].itemName &&
            item.tableNumber === group[index].tableNumber &&
            item.id === group[index].id
          )) {
        // Same group selected, deselect it
        return null;
      }
      // Different group or no group selected, select the new group
      return group;
    });
    setSelectedGroups([]); // Clear multiple selection when single group is selected
    setSelectedOrderKey(null); // Clear individual selection when group is selected
  };

  // ============================================================================
  // CONTEXT-AWARE PRIORITY SYSTEM
  // ============================================================================
  // These hooks were MOVED HERE (before autoSelectFirstGroups) to fix hoisting error.
  // Original position: around line 850+ (see commented out code there)
  // 
  // Purpose: Boost dessert priority to main dish level if table only has desserts.
  // Example: Bàn 2 chỉ đặt Rau câu dừa → priority = 1 (thay vì 2)
  // ============================================================================

  // Helper: Analyze table context to determine if dessert should be boosted
  const getTableCategoryContext = useMemo(() => {
    const tableContext = new Map<number, Set<string>>();
    
    // Only consider orders that are "đang chờ" for context analysis
    orders.filter(order => order.status === 'đang chờ').forEach(order => {
      if (!tableContext.has(order.tableNumber)) {
        tableContext.set(order.tableNumber, new Set());
      }
      const category = itemNameToCategory[order.itemName] || order.category;
      if (category) {
        tableContext.get(order.tableNumber)!.add(category);
      }
    });
    
    return tableContext;
  }, [orders, itemNameToCategory]);

  // Helper: Calculate contextual priority based on table context
  const getContextualPriority = useCallback((itemName: string, tableNumber?: number): number => {
    const category = itemNameToCategory[itemName];
    
    // Base priority
    const basePriority = (() => {
      switch (category) {
        case 'Đồ uống':
          return 0;
        case 'Món chính':
          return 1;
        case 'Tráng miệng':
          return 2;
        default:
          return 3;
      }
    })();
    
    // If no table context or not dessert, return base priority
    if (!tableNumber || category !== 'Tráng miệng') {
      return basePriority;
    }
    
    // Check table context
    const tableCategories = getTableCategoryContext.get(tableNumber);
    if (!tableCategories || tableCategories.size === 0) {
      return basePriority;
    }
    
    // BOOST PRIORITY: If table only has dessert (no drinks and no main dishes), 
    // treat dessert as main dish priority
    const hasOnlyDessert = tableCategories.has('Tráng miệng') && 
                          !tableCategories.has('Đồ uống') && 
                          !tableCategories.has('Món chính');
    
    if (hasOnlyDessert) {
      return 1; // Boost to main dish priority
    }
    
    return basePriority;
  }, [itemNameToCategory, getTableCategoryContext]);

  // Multiple group selection handler
  const handleMultipleGroupSelection = (groups: { itemName: string; tableNumber: number; id: number }[][], isAutomatic = false) => {
    if (!isAutomatic) {
      setHasManualSelection(true); // Mark as manual selection only if not automatic
    }
    
    // Warn only when adding to the selection; suppress when removing
    const prevLen = selectedGroups.length;
    const newLen = groups.length;
    const isAdding = newLen > prevLen;
    if (isAdding) {
      const flat = groups.flat();
      // Create proposed selection based on the new groups being set (complete replacement)
      const proposedSelection = new Set(flat.map(item => item.id));
      maybeWarnForMainSelection(flat, proposedSelection);
      maybeWarnForDessertSelection(flat, proposedSelection);
      // Track the group that was just checked
      const findAddedGroup = (): { itemName: string; tableNumber: number; id: number }[] | null => {
        const areSameGroup = (a: { itemName: string; tableNumber: number; id: number }[], b: { itemName: string; tableNumber: number; id: number }[]) => {
          if (!a || !b || a.length !== b.length) return false;
          return a.every((item, index) =>
            item.itemName === b[index].itemName &&
            item.tableNumber === b[index].tableNumber &&
            item.id === b[index].id
          );
        };
        for (const g of groups) {
          const existed = selectedGroups.some(sg => areSameGroup(sg, g));
          if (!existed) return g;
        }
        return null;
      };
      const added = findAddedGroup();
      if (added) setLastCheckedGroup(added);
    }
    setSelectedGroups(groups);
    setSelectedGroup(null); // Clear single group selection when multiple groups are selected
    setSelectedOrderKey(null); // Clear individual selection when groups are selected
  };

  const appendSelectionItems = useCallback((items: SelectionItem[]) => {
    if (!items || items.length === 0) return;
    setHasManualSelection(true);
    setSelectedGroups(prev => {
      const existingIds = new Set(prev.flat().map(item => item.id));
      const deduped = items.filter(item => !existingIds.has(item.id));
      if (deduped.length === 0) {
        return prev;
      }

      const nextGroups = [...prev, deduped];
      const proposedSelection = new Set(nextGroups.flat().map(item => item.id));
      maybeWarnForMainSelection(deduped, proposedSelection);
      maybeWarnForDessertSelection(deduped, proposedSelection);
      setLastCheckedGroup(deduped);
      return nextGroups;
    });
  }, [maybeWarnForMainSelection, maybeWarnForDessertSelection]);

  // Function to automatically select the first 3 groups based on context-aware category priority
  const autoSelectFirstGroups = useCallback(() => {
    // Only auto-select for relevant tabs, not for serve tab, and only if user hasn't made manual selection
    if (activeTab === 'bắt đầu phục vụ' || hasManualSelection || leftPanelTab !== 'byDish') {
      return;
    }

    // Helper to filter items by selectedCategory
    const filterByCategory = (itemName: string) => {
      if (selectedCategory === 'Tất cả') return true;
      return itemNameToCategory[itemName] === selectedCategory;
    };

    // Process grouped orders - each group is already grouped by itemName+size+note+toppings
    const displayGroups = Object.entries(groupedOrders)
      .map(([groupKey, ordersInGroup]) => {
        const representative = ordersInGroup[0];
        if (!representative) return null;
        
        const filtered = ordersInGroup.filter(order => order.status !== 'bắt đầu phục vụ');
        if (filtered.length === 0) return null;

        return {
          itemName: representative.itemName,
          category: representative.category,
          tableNumber: representative.tableNumber, // For context-aware priority
          selectionItems: filtered.map(order => ({ 
            itemName: order.itemName, 
            tableNumber: order.tableNumber, 
            id: order.id 
          }))
        };
      })
      .filter((group): group is NonNullable<typeof group> => 
        group !== null && 
        shouldShowInSidebar(group.itemName) && 
        filterByCategory(group.itemName)
      )
      .sort((a, b) => {
        // Use context-aware priority instead of simple category priority
        const priorityA = getContextualPriority(a.itemName, a.tableNumber);
        const priorityB = getContextualPriority(b.itemName, b.tableNumber);
        return priorityA - priorityB;
      });

    // Select the first 3 groups if available
    if (displayGroups.length > 0) {
      const groupsToSelect = displayGroups.slice(0, 3).map(group => group.selectionItems);
      
      // Only select if not already selected to avoid unnecessary re-renders
      const isAlreadySelected = selectedGroups.length === groupsToSelect.length && 
        selectedGroups.every((selectedGroup, index) => {
          const targetGroup = groupsToSelect[index];
          if (!targetGroup || selectedGroup.length !== targetGroup.length) return false;
          return selectedGroup.every((item, itemIndex) => 
            item.itemName === targetGroup[itemIndex].itemName &&
            item.tableNumber === targetGroup[itemIndex].tableNumber &&
            item.id === targetGroup[itemIndex].id
          );
        });
      
      if (!isAlreadySelected) {
        handleMultipleGroupSelection(groupsToSelect, true); // Pass true for automatic selection
      }
    }
  }, [activeTab, selectedCategory, groupedOrders, shouldShowInSidebar, itemNameToCategory, selectedGroups, handleMultipleGroupSelection, hasManualSelection, leftPanelTab, getContextualPriority]);

  // Auto-select first group when page loads or significant data changes
  useEffect(() => {
    // Small delay to ensure selections are cleared first
    const timeoutId = setTimeout(() => {
      autoSelectFirstGroups();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [autoSelectFirstGroups, groupedOrders, selectedCategory]);

  // Auto-select first group when switching tabs (after selections are cleared)
  useEffect(() => {
    // Delay to ensure the clear selections effect runs first
    const timeoutId = setTimeout(() => {
      autoSelectFirstGroups();
    }, 150);
    
    return () => clearTimeout(timeoutId);
  }, [activeTab, autoSelectFirstGroups]);

  // Handle preparing multiple orders at once
  const handlePrepareMultipleOrders = async (orders: { itemName: string; tableNumber: number; id: number }[]) => {
    try {
      // Warning for both priority rules on the same table(s)
      maybeWarnForMainSelection(orders);
      maybeWarnForDessertSelection(orders);
      
      // Mark all items as animating out
      const orderIds = orders.map(o => o.id);
      setAnimatingOutIds(new Set(orderIds));
      
      // Wait for animation to complete (300ms for fade-out animation)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Prepare all orders in parallel using Promise.all
      await Promise.all(orders.map(order => handlePrepareOrders(order.id)));
      
      addToast(`Đã bắt đầu thực hiện ${orders.length} món cùng lúc`, 'success');
      
      // Clear animations and selections after bulk action
      setAnimatingOutIds(new Set());
      setSelectedGroups([]);
      setSelectedGroup(null);
      setSelectedOrderKey(null);
    } catch (error) {
      // Clear animation state on error
      setAnimatingOutIds(new Set());
      addToast(`Lỗi khi cập nhật trạng thái cho ${orders.length} món`, 'error');
    }
  };

  // Handle serving multiple orders at once
  const handleServeMultipleOrders = async (orders: { itemName: string; tableNumber: number; id: number }[]) => {
    try {
      // Mark all items as animating out
      const orderIds = orders.map(o => o.id);
      setAnimatingOutIds(new Set(orderIds));
      
      // Wait for animation to complete (300ms for fade-out animation)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Serve all orders in parallel using Promise.all
      await Promise.all(orders.map(order => handleServeOrder(order.id)));
      
      addToast(`Đã bắt đầu phục vụ ${orders.length} món cùng lúc`, 'success');
      
      // Clear animations and selections after bulk action
      setAnimatingOutIds(new Set());
      setSelectedGroups([]);
      setSelectedGroup(null);
      setSelectedOrderKey(null);
    } catch (error) {
      // Clear animation state on error
      setAnimatingOutIds(new Set());
      addToast(`Lỗi khi cập nhật trạng thái cho ${orders.length} món`, 'error');
    }
  };

  // Filter groupedOrders for selected order
  let filteredGroupedOrders: Record<string, Order[]> = {};
  if (selectedOrderKey) {
    const { id } = selectedOrderKey;
    // Find the order by id across all groups
    Object.entries(groupedOrders as Record<string, Order[]>).forEach(([groupKey, orderList]) => {
      const foundOrder = orderList.find(o => o.id === id);
      if (foundOrder) {
        filteredGroupedOrders = { [groupKey]: [foundOrder] };
      }
    });
  }

  // Get all orders in 'bắt đầu phục vụ' state for the right panel
  const isServeTab = activeTab === 'bắt đầu phục vụ';
  const isInProgressTab = activeTab === 'đang thực hiện';
  let serveTabGroupedOrders: Record<string, Order[]> = {};
  if (isServeTab) {
    // Filter groupedOrders to only include 'bắt đầu phục vụ' status while maintaining grouping
    Object.entries(groupedOrders as Record<string, Order[]>).forEach(([groupKey, orderList]) => {
      const serveOrders = orderList.filter(order => order.status === 'bắt đầu phục vụ');
      if (serveOrders.length > 0) {
        serveTabGroupedOrders[groupKey] = serveOrders;
      }
    });
  }

  // Apply search filter to all order data
  const filteredGroupedOrdersForSearch = filterOrdersBySearch(groupedOrders as Record<string, Order[]>);
  const filteredServeTabGroupedOrders = filterOrdersBySearch(serveTabGroupedOrders);
  const filteredInProgressGroupedOrders = filteredGroupedOrdersForSearch;

  const tablesByNumber = useMemo(() => {
    const tableMap = new Map<number, Order[]>();

    Object.values(filteredGroupedOrdersForSearch).forEach(orderList => {
      orderList.forEach(order => {
        if (!tableMap.has(order.tableNumber)) {
          tableMap.set(order.tableNumber, []);
        }
        tableMap.get(order.tableNumber)!.push(order);
      });
    });

    return Array.from(tableMap.entries())
      .map(([tableNumber, tableOrders]) => ({
        tableNumber,
        orders: [...tableOrders].sort((a, b) => a.id - b.id),
      }))
      .sort((a, b) => a.tableNumber - b.tableNumber);
  }, [filteredGroupedOrdersForSearch]);

  useEffect(() => {
    const eligibleTabs = new Set<OrderStatus>(['đang chờ', 'đang thực hiện']);
    if (leftPanelTab !== 'byTable' || !eligibleTabs.has(activeTab)) {
      setMatchSuggestions(null);
      setIsMatchModalOpen(false);
      matchSuggestionSignatureRef.current = null;
      return;
    }

    if (!selectedGroups || selectedGroups.length === 0) {
      setMatchSuggestions(null);
      setIsMatchModalOpen(false);
      matchSuggestionSignatureRef.current = null;
      return;
    }

    const selectedIds = new Set(selectedGroups.flat().map(item => item.id));
    if (selectedIds.size === 0) {
      setMatchSuggestions(null);
      setIsMatchModalOpen(false);
      matchSuggestionSignatureRef.current = null;
      return;
    }

    const statusFilteredOrders = orders.filter(order => order.status === activeTab);
    const selectedOrders = statusFilteredOrders.filter(order => selectedIds.has(order.id));
    if (selectedOrders.length === 0) {
      setMatchSuggestions(null);
      setIsMatchModalOpen(false);
      matchSuggestionSignatureRef.current = null;
      return;
    }

    const baseMap = new Map<string, { representative: Order; baseTables: Set<number> }>();
    selectedOrders.forEach(order => {
      if (!ALLOWED_MATCH_CATEGORIES.has(order.category)) return;
      const key = buildMatchKey(order);
      if (!baseMap.has(key)) {
        baseMap.set(key, { representative: order, baseTables: new Set([order.tableNumber]) });
      } else {
        baseMap.get(key)!.baseTables.add(order.tableNumber);
      }
    });

    if (baseMap.size === 0) {
      setMatchSuggestions(null);
      setIsMatchModalOpen(false);
      matchSuggestionSignatureRef.current = null;
      return;
    }

    const selectedTables = new Set(selectedOrders.map(order => order.tableNumber));
    const suggestionBuilders = new Map<
      string,
      { representative: Order; baseTables: Set<number>; candidates: Map<number, Order[]> }
    >();

    statusFilteredOrders.forEach(order => {
      if (selectedIds.has(order.id)) return;
      if (!ALLOWED_MATCH_CATEGORIES.has(order.category)) return;
      if (selectedTables.has(order.tableNumber)) return;
      const key = buildMatchKey(order);
      const baseEntry = baseMap.get(key);
      if (!baseEntry) return;
      const builder =
        suggestionBuilders.get(key) || {
          representative: baseEntry.representative,
          baseTables: baseEntry.baseTables,
          candidates: new Map<number, Order[]>(),
        };
      if (!builder.candidates.has(order.tableNumber)) {
        builder.candidates.set(order.tableNumber, []);
      }
      builder.candidates.get(order.tableNumber)!.push(order);
      suggestionBuilders.set(key, builder);
    });

    const builtSuggestions: MatchSuggestion[] = Array.from(suggestionBuilders.entries())
      .map(([key, builder]) => ({
        id: key,
        itemName: builder.representative.itemName,
        sizeName: builder.representative.sizeName,
        category: builder.representative.category,
        note: builder.representative.note,
        toppings: builder.representative.toppings,
        baseTables: Array.from(builder.baseTables).sort((a, b) => a - b),
        candidates: Array.from(builder.candidates.entries())
          .map(([tableNumber, tableOrders]) => ({
            tableNumber,
            orders: tableOrders
              .sort((a, b) => a.id - b.id)
              .map(order => ({
                id: order.id,
                itemName: order.itemName,
                tableNumber: order.tableNumber,
                sizeName: order.sizeName,
                note: order.note,
                toppings: order.toppings,
                createdTime: order.createdTime || order.orderTime,
                estimatedTime: order.estimatedTime,
              })),
          }))
          .sort((a, b) => a.tableNumber - b.tableNumber),
      }))
      .filter(suggestion => suggestion.candidates.length > 0);

    if (builtSuggestions.length === 0) {
      setMatchSuggestions(null);
      setIsMatchModalOpen(false);
      matchSuggestionSignatureRef.current = null;
      return;
    }

    const suggestionIds = builtSuggestions
      .flatMap(suggestion =>
        suggestion.candidates.flatMap(candidate => candidate.orders.map(order => order.id))
      )
      .sort((a, b) => a - b);
    const selectionSignature = Array.from(selectedIds)
      .sort((a, b) => a - b)
      .join(',');
    const candidateSignature = suggestionIds.join(',');
    const signature = `${activeTab}__${selectionSignature}__${candidateSignature}`;

    if (matchSuggestionSignatureRef.current !== signature) {
      matchSuggestionSignatureRef.current = signature;
      setMatchSuggestions(builtSuggestions);
      setIsMatchModalOpen(true);
    }
  }, [
    selectedGroups,
    leftPanelTab,
    orders,
    activeTab,
    ALLOWED_MATCH_CATEGORIES,
    buildMatchKey,
  ]);

  const handleMatchModalCancel = useCallback(() => {
    setIsMatchModalOpen(false);
  }, []);

  const handleMatchModalConfirm = useCallback(
    (items: SelectionItem[]) => {
      if (items.length > 0) {
        appendSelectionItems(items);
      }
      setMatchSuggestions(null);
      setIsMatchModalOpen(false);
    },
    [appendSelectionItems]
  );
  // ============================================================================
  // NOTE: getTableCategoryContext and getContextualPriority have been MOVED UP
  // to line 482 and line 499 to fix hoisting error.
  // Original position was here (around line 719-776) but caused:
  // "ReferenceError: Cannot access 'getContextualPriority' before initialization"
  // 
  // Keeping commented out code below for reference:
  // ============================================================================
  
  // // Helper: Analyze table context to determine if dessert should be boosted
  // const getTableCategoryContext = useMemo(() => {
  //   const tableContext = new Map<number, Set<string>>();
  //   
  //   // Only consider orders that are "đang chờ" for context analysis
  //   orders.filter(order => order.status === 'đang chờ').forEach(order => {
  //     if (!tableContext.has(order.tableNumber)) {
  //       tableContext.set(order.tableNumber, new Set());
  //     }
  //     const category = itemNameToCategory[order.itemName] || order.category;
  //     if (category) {
  //       tableContext.get(order.tableNumber)!.add(category);
  //     }
  //   });
  //   
  //   return tableContext;
  // }, [orders, itemNameToCategory]);

  // // Helper: Calculate contextual priority based on table context
  // const getContextualPriority = useCallback((itemName: string, tableNumber?: number): number => {
  //   const category = itemNameToCategory[itemName];
  //   
  //   // Base priority
  //   const basePriority = (() => {
  //     switch (category) {
  //       case 'Đồ uống':
  //         return 0;
  //       case 'Món chính':
  //         return 1;
  //       case 'Tráng miệng':
  //         return 2;
  //       default:
  //         return 3;
  //     }
  //   })();
  //   
  //   // If no table context or not dessert, return base priority
  //   if (!tableNumber || category !== 'Tráng miệng') {
  //     return basePriority;
  //   }
  //   
  //   // Check table context
  //   const tableCategories = getTableCategoryContext.get(tableNumber);
  //   if (!tableCategories || tableCategories.size === 0) {
  //     return basePriority;
  //   }
  //   
  //   // BOOST PRIORITY: If table only has dessert (no drinks and no main dishes), 
  //   // treat dessert as main dish priority
  //   const hasOnlyDessert = tableCategories.has('Tráng miệng') && 
  //                         !tableCategories.has('Đồ uống') && 
  //                         !tableCategories.has('Món chính');
  //   
  //   if (hasOnlyDessert) {
  //     return 1; // Boost to main dish priority
  //   }
  //   
  //   return basePriority;
  // }, [itemNameToCategory, getTableCategoryContext]);

  // Helper: sort grouped orders by category priority: Đồ uống > Món chính > Tráng miệng
  // BUT with context-aware priority boost for tables with only desserts
  const sortGroupedByCategoryPriority = useCallback((input: Record<string, Order[]>): Record<string, Order[]> => {
    const sortedEntries = Object.entries(input).sort(([itemNameA, ordersA], [itemNameB, ordersB]) => {
      // Get representative table number for priority calculation
      const tableA = ordersA[0]?.tableNumber;
      const tableB = ordersB[0]?.tableNumber;
      
      const priorityA = getContextualPriority(itemNameA, tableA);
      const priorityB = getContextualPriority(itemNameB, tableB);
      
      return priorityA - priorityB;
    });

    return sortedEntries.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, Order[]>);
  }, [getContextualPriority]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div className="flex items-center justify-center w-full">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="text-red-500 mb-4">Lỗi: {error}</div>
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowRoles={['Chef']}>
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="fixed top-4 right-4 z-50">
        <UserMenu />
      </div>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        selectedOrder={selectedOrder}
        onConfirm={modalAction === 'serve' ? handleConfirmServe : handleConfirmReject}
        onCancel={() => { setShowModal(false); setSelectedOrder(null); }}
        action={modalAction}
      />

      {/* Info Modal: Drinks before Main warning */}
      <InfoModal
        isOpen={isPriorityInfoOpen}
        message="Nên ưu tiên làm Đồ uống trước Món chính."
        onClose={() => setIsPriorityInfoOpen(false)}
        onCancel={() => {
          setHasManualSelection(true); // Mark as manual selection
          if (lastCheckedGroup) {
            const areSameGroup = (a: { itemName: string; tableNumber: number; id: number }[], b: { itemName: string; tableNumber: number; id: number }[]) => {
              if (!a || !b || a.length !== b.length) return false;
              return a.every((item, index) =>
                item.itemName === b[index].itemName &&
                item.tableNumber === b[index].tableNumber &&
                item.id === b[index].id
              );
            };
            setSelectedGroups(prev => prev.filter(g => !areSameGroup(g, lastCheckedGroup)));
          }
          setIsPriorityInfoOpen(false);
        }}
      />

      {/* Info Modal: Main before Dessert warning */}
      <InfoModal
        isOpen={isDessertPriorityInfoOpen}
        message="Nên ưu tiên làm Món chính trước Tráng miệng."
        onClose={() => setIsDessertPriorityInfoOpen(false)}
        onCancel={() => {
          setHasManualSelection(true); // Mark as manual selection
          if (lastCheckedGroup) {
            const areSameGroup = (a: { itemName: string; tableNumber: number; id: number }[], b: { itemName: string; tableNumber: number; id: number }[]) => {
              if (!a || !b || a.length !== b.length) return false;
              return a.every((item, index) =>
                item.itemName === b[index].itemName &&
                item.tableNumber === b[index].tableNumber &&
                item.id === b[index].id
              );
            };
            setSelectedGroups(prev => prev.filter(g => !areSameGroup(g, lastCheckedGroup)));
          }
          setIsDessertPriorityInfoOpen(false);
        }}
      />

      <MatchSuggestionModal
        isOpen={isMatchModalOpen}
        suggestions={matchSuggestions}
        onCancel={handleMatchModalCancel}
        onConfirm={handleMatchModalConfirm}
        mode={activeTab === 'đang thực hiện' ? 'serve' : 'prepare'}
      />

      {/* Search Results Modal */}
      <SearchResultsModal
        isOpen={showSearchModal}
        onClose={() => {
          setShowSearchModal(false);
          setSelectedSearchProduct(null);
        }}
        productName={selectedSearchProduct}
        orders={getSelectedProductOrders()}
        onCancelOrder={handleCancelFromSearch}
      />

      <div className="flex flex-1 min-h-0">
        <div
          className={`flex w-1/2 min-h-0 flex-col border-r border-gray-200 bg-white ${isServeTab ? 'pointer-events-none opacity-50' : ''}`}
        >
          {/* <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Chờ chế biến</h2>
          </div> */}

          <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-200 bg-gray-50">
            {leftPanelTabs.map(tab => {
              const isActive = leftPanelTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setLeftPanelTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-h-0 overflow-hidden bg-gray-50">
            {leftPanelTab === 'byDish' && (
              <div className="h-full">
                <KitchenSidebar
                  categories={CATEGORIES}
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                  remainingItems={remainingItems}
                  shouldShowInSidebar={shouldShowInSidebar}
                  itemNameToCategory={itemNameToCategory}
                  selectedOrderKey={selectedOrderKey}
                  onSidebarItemClick={handleSidebarItemClick}
                  selectedGroup={selectedGroup}
                  onGroupSelection={handleGroupSelection}
                  groupedOrders={filteredGroupedOrdersForSearch}
                  selectedGroups={selectedGroups}
                  onMultipleGroupSelection={handleMultipleGroupSelection}
                  orders={orders}
                  className="bg-transparent h-full"
                  fluid
                />
              </div>
            )}

            {leftPanelTab === 'byTable' && (
              <KitchenSidebarByTable
                tables={tablesByNumber}
                selectedOrderKey={selectedOrderKey}
                onSidebarItemClick={handleSidebarItemClick}
                selectedGroup={selectedGroup}
                onGroupSelection={handleGroupSelection}
                selectedGroups={selectedGroups}
                onMultipleGroupSelection={handleMultipleGroupSelection}
                itemNameToCategory={itemNameToCategory} // For context-aware sorting
                tableDataMap={tableDataMap} // For late dish warnings
                className="bg-transparent h-full"
              />
            )}
          </div>
        </div>

        <div className="flex w-1/2 min-h-0 flex-col bg-white">
          <div className="px-6 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{currentDateTime}</span>
            </div>
          </div>

          <NavigationTabs
            activeTab={activeTab as OrderStatus}
            onTabChange={handleTabChange as (tab: OrderStatus) => void}
            getTabCount={getTabCount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            showSearchDropdown={showSearchDropdown}
            onProductSelect={handleProductSelect}
            onSearchDropdownClose={() => setShowSearchDropdown(false)}
            rightAction={
              /*
              (() => {
                if (activeTab === 'đang chờ') {
                  const selectedOrders = selectedGroups.length > 0
                    ? selectedGroups.flat()
                    : selectedGroup || (selectedOrderKey ? [selectedOrderKey] : []);
                  if (selectedOrders.length > 0) {
                    return (
                      <button
                        onClick={() => {
                          if (selectedGroups.length > 0) {
                            handlePrepareMultipleOrders(selectedOrders);
                          } else if (selectedGroup) {
                            handlePrepareMultipleOrders(selectedGroup);
                          } else if (selectedOrderKey) {
                            handlePrepareClick(selectedOrderKey.id, selectedOrderKey.itemName);
                          }
                        }}
                        className="font-medium text-sm px-4 py-2 rounded-full shadow bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                      >
                        {`Thực hiện${selectedOrders.length > 1 ? ` (${selectedOrders.length})` : ''}`}
                      </button>
                    );
                  }
                }
                if (activeTab === 'đang thực hiện') {
                  const selectedOrders = selectedGroups.length > 0
                    ? selectedGroups.flat()
                    : selectedGroup || (selectedOrderKey ? [selectedOrderKey] : []);
                  if (selectedOrders.length > 0) {
                    return (
                      <button
                        onClick={() => {
                          if (selectedGroups.length > 0) {
                            handleServeMultipleOrders(selectedOrders);
                          } else if (selectedGroup) {
                            handleServeMultipleOrders(selectedGroup);
                          } else if (selectedOrderKey) {
                            const all = Object.values(groupedOrders as Record<string, Order[]>).flat();
                            const found = all.find(o => o.id === selectedOrderKey!.id);
                            if (found) handleServeClick(found);
                          }
                        }}
                        className="font-medium text-sm px-4 py-2 rounded-full shadow bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap"
                      >
                        {`Bắt đầu phục vụ${selectedOrders.length > 1 ? ` (${selectedOrders.length})` : ''}`}
                      </button>
                    );
                  }
                }
                return null;
              })()
              */
              null
            }
          />

          <div className="flex-1 min-h-0 overflow-hidden bg-gray-50">
            <div className="h-full overflow-y-auto">
              {(() => {
                const hasSelection = selectedGroups.length > 0 || selectedGroup || selectedOrderKey;

                if (isServeTab && Object.keys(filteredServeTabGroupedOrders).length > 0) {
                  const sortedForServe = sortGroupedByCategoryPriority(filteredServeTabGroupedOrders);
                  return (
                    <OrdersContent
                      groupedOrders={sortedForServe}
                      activeTab={activeTab}
                      onGroupClick={handleGroupClick}
                      onPrepareClick={handlePrepareClick}
                      onServeClick={handleServeClick}
                      onAcceptRedoClick={handleAcceptRedoClick}
                      onRejectRedoClick={handleRejectRedoClickWrapper}
                      selectedIds={selectedIds}
                      animatingOutIds={animatingOutIds}
                    />
                  );
                }

                if (isInProgressTab && Object.keys(filteredInProgressGroupedOrders).length > 0) {
                  const sortedInProgress = sortGroupedByCategoryPriority(filteredInProgressGroupedOrders);
                  return (
                    <OrdersContent
                      groupedOrders={sortedInProgress}
                      activeTab={activeTab}
                      onGroupClick={handleGroupClick}
                      onPrepareClick={handlePrepareClick}
                      onServeClick={handleServeClick}
                      onServeMultipleOrders={handleServeMultipleOrders}
                      showIndividualCards={true}
                      onAcceptRedoClick={handleAcceptRedoClick}
                      onRejectRedoClick={handleRejectRedoClickWrapper}
                      selectedIds={selectedIds}
                      animatingOutIds={animatingOutIds}
                    />
                  );
                }

                if (!hasSelection) {
                  const sortedDefault = sortGroupedByCategoryPriority(filteredGroupedOrdersForSearch);
                  return (
                    <OrdersContent
                      groupedOrders={sortedDefault}
                      activeTab={activeTab}
                      onGroupClick={handleGroupClick}
                      onPrepareClick={handlePrepareClick}
                      onServeClick={handleServeClick}
                      onServeMultipleOrders={handleServeMultipleOrders}
                      onAcceptRedoClick={handleAcceptRedoClick}
                      onRejectRedoClick={handleRejectRedoClickWrapper}
                      selectedIds={selectedIds}
                      showIndividualCards={true}
                      animatingOutIds={animatingOutIds}
                    />
                  );
                }

                if (selectedGroups.length > 0) {
                  const filtered = (() => {
                    const filtered: Record<string, Order[]> = {};
                    const selectedIds = new Set(selectedGroups.flat().map(item => item.id));
                    
                    // Iterate through all grouped orders and find matching ones by id
                    Object.entries(filteredGroupedOrdersForSearch as Record<string, Order[]>).forEach(([groupKey, orderList]) => {
                      orderList.forEach(order => {
                        if (selectedIds.has(order.id)) {
                          if (!filtered[groupKey]) filtered[groupKey] = [];
                          filtered[groupKey].push(order);
                        }
                      });
                    });
                    
                    return filtered;
                  })();

                  const sortedSelectedGroups = sortGroupedByCategoryPriority(filtered);
                  return (
                    <OrdersContent
                      groupedOrders={sortedSelectedGroups}
                      activeTab={activeTab}
                      onGroupClick={handleGroupClick}
                      onPrepareClick={handlePrepareClick}
                      onServeClick={handleServeClick}
                      onPrepareMultipleOrders={handlePrepareMultipleOrders}
                      onServeMultipleOrders={handleServeMultipleOrders}
                      showIndividualCards={true}
                      onAcceptRedoClick={handleAcceptRedoClick}
                      onRejectRedoClick={handleRejectRedoClickWrapper}
                      selectedIds={selectedIds}
                      animatingOutIds={animatingOutIds}
                    />
                  );
                }

                if (selectedGroup) {
                  const filtered = (() => {
                    const filtered: Record<string, Order[]> = {};
                    const selectedIdsSet = new Set(selectedGroup.map(item => item.id));
                    
                    // Iterate through all grouped orders and find matching ones by id
                    Object.entries(filteredGroupedOrdersForSearch as Record<string, Order[]>).forEach(([groupKey, orderList]) => {
                      orderList.forEach(order => {
                        if (selectedIdsSet.has(order.id)) {
                          if (!filtered[groupKey]) filtered[groupKey] = [];
                          filtered[groupKey].push(order);
                        }
                      });
                    });
                    
                    return filtered;
                  })();

                  const sortedSelectedGroup = sortGroupedByCategoryPriority(filtered);
                  return (
                    <OrdersContent
                      groupedOrders={sortedSelectedGroup}
                      activeTab={activeTab}
                      onGroupClick={handleGroupClick}
                      onPrepareClick={handlePrepareClick}
                      onServeClick={handleServeClick}
                      onPrepareMultipleOrders={handlePrepareMultipleOrders}
                      onServeMultipleOrders={handleServeMultipleOrders}
                      showIndividualCards={true}
                      onAcceptRedoClick={handleAcceptRedoClick}
                      onRejectRedoClick={handleRejectRedoClickWrapper}
                      selectedIds={selectedIds}
                      animatingOutIds={animatingOutIds}
                    />
                  );
                }

                if (selectedOrderKey) {
                  const sortedSelectedOrder = sortGroupedByCategoryPriority(filteredGroupedOrders);
                  return (
                    <OrdersContent
                      groupedOrders={sortedSelectedOrder}
                      activeTab={activeTab}
                      onGroupClick={handleGroupClick}
                      onPrepareClick={handlePrepareClick}
                      onServeClick={handleServeClick}
                      onAcceptRedoClick={handleAcceptRedoClick}
                      onRejectRedoClick={handleRejectRedoClickWrapper}
                      selectedIds={selectedIds}
                      animatingOutIds={animatingOutIds}
                    />
                  );
                }

                return (
                  <div className="flex h-full items-center justify-center text-gray-400 text-xl">
                    Chọn một món ăn để xem chi tiết
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}

// Loading component for Suspense fallback
function ChiefPageLoading() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="flex items-center justify-center w-full">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    </div>
  );
}

export default function ChiefPage() {
  return (
    <Suspense fallback={<ChiefPageLoading />}>
      <ChiefPageContent />
    </Suspense>
  );
} 