'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useCustomRouter } from '@/lib/custom-router';

// Types
import { Order, OrderStatus } from '@/types/kitchen';

// Constants
import { CATEGORIES } from '@/constants/kitchen-data';

// Hooks
import { useKitchenOrders } from '@/hooks/use-kitchen-orders';
import { useToastKitchen } from '@/hooks/use-toast-kitchen';

// Components
import { ToastContainer } from '@/components/kitchen/ToastContainer';
import { ConfirmationModal } from '@/components/kitchen/ConfirmationModal';
import { NavigationTabs } from '@/components/kitchen/NavigationTabs';
import { KitchenSidebar } from '@/components/kitchen/KitchenSidebar';
import { OrdersContent } from '@/components/kitchen/OrdersContent';

function ChiefPageContent() {
  const router = useCustomRouter();
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalAction, setModalAction] = useState<'serve' | 'reject'>('serve');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar item selection state
  const [selectedOrderKey, setSelectedOrderKey] = useState<{ itemName: string; tableNumber: number; id: number } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{ itemName: string; tableNumber: number; id: number }[] | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<{ itemName: string; tableNumber: number; id: number }[][]>([]);

  // Custom hooks
  const {
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
    refreshOrders,
    shouldShowInSidebar,
    getTabCount,
    itemNameToCategory,
  } = useKitchenOrders();

  const { toasts, addToast, removeToast } = useToastKitchen();

  // Auto-fetch orders every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshOrders(true); // Use silent refresh to avoid loading state
    }, 2000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [refreshOrders]);

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
      await handlePrepareOrders(orderId);
      addToast(`Đã bắt đầu thực hiện món: ${itemName}`, 'success');
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

  const handleCancelModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Sidebar item click handler
  const handleSidebarItemClick = (orderKey: { itemName: string; tableNumber: number; id: number }) => {
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
    // Toggle logic: if the same group is selected, deselect it
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

  // Multiple group selection handler
  const handleMultipleGroupSelection = (groups: { itemName: string; tableNumber: number; id: number }[][]) => {
    setSelectedGroups(groups);
    setSelectedGroup(null); // Clear single group selection when multiple groups are selected
    setSelectedOrderKey(null); // Clear individual selection when groups are selected
  };

  // Handle preparing multiple orders at once
  const handlePrepareMultipleOrders = async (orders: { itemName: string; tableNumber: number; id: number }[]) => {
    try {
      // Prepare all orders in the group
      for (const order of orders) {
        await handlePrepareOrders(order.id);
      }
      addToast(`Đã bắt đầu thực hiện ${orders.length} món cùng lúc`, 'success');
    } catch (error) {
      addToast(`Lỗi khi cập nhật trạng thái cho ${orders.length} món`, 'error');
    }
  };

  // Handle serving multiple orders at once
  const handleServeMultipleOrders = async (orders: { itemName: string; tableNumber: number; id: number }[]) => {
    try {
      // Serve all orders in the group
      for (const order of orders) {
        await handleServeOrder(order.id);
      }
      addToast(`Đã bắt đầu phục vụ ${orders.length} món cùng lúc`, 'success');
    } catch (error) {
      addToast(`Lỗi khi cập nhật trạng thái cho ${orders.length} món`, 'error');
    }
  };

  // Filter groupedOrders for selected order
  let filteredGroupedOrders: Record<string, Order[]> = {};
  if (selectedOrderKey) {
    const { itemName, tableNumber, id } = selectedOrderKey;
    const orderList = (groupedOrders as Record<string, Order[]>)[itemName] || [];
    const foundOrder = orderList.find(
      o => o.tableNumber === tableNumber && o.id === id
    );
    if (foundOrder) {
      filteredGroupedOrders = { [itemName]: [foundOrder] };
    }
  }

  // Get all orders in 'bắt đầu phục vụ' state for the right panel
  const isServeTab = activeTab === 'bắt đầu phục vụ';
  let serveTabGroupedOrders: Record<string, Order[]> = {};
  if (isServeTab) {
    // Flatten all groupedOrders into a single array of orders in 'bắt đầu phục vụ' state
    const allOrders = Object.values(groupedOrders as Record<string, Order[]>).flat();
    const serveOrders = allOrders.filter(order => order.status === 'bắt đầu phục vụ');
    // Group by itemName for OrdersContent
    serveTabGroupedOrders = serveOrders.reduce((acc: Record<string, Order[]>, order: Order) => {
      if (!acc[order.itemName]) acc[order.itemName] = [];
      acc[order.itemName].push(order);
      return acc;
    }, {} as Record<string, Order[]>);
  }

  // Apply search filter to all order data
  const filteredGroupedOrdersForSearch = filterOrdersBySearch(groupedOrders as Record<string, Order[]>);
  const filteredServeTabGroupedOrders = filterOrdersBySearch(serveTabGroupedOrders);

  // Helper: sort grouped orders by category priority: Đồ uống > Món chính > Tráng miệng
  const sortGroupedByCategoryPriority = (input: Record<string, Order[]>): Record<string, Order[]> => {
    const categoryPriority = (categoryName: string | undefined): number => {
      switch (categoryName) {
        case 'Đồ uống':
          return 0;
        case 'Món chính':
          return 1;
        case 'Tráng miệng':
          return 2;
        default:
          return 3;
      }
    };

    const sortedEntries = Object.entries(input).sort(([itemNameA], [itemNameB]) => {
      const aCat = itemNameToCategory[itemNameA];
      const bCat = itemNameToCategory[itemNameB];
      return categoryPriority(aCat) - categoryPriority(bCat);
    });

    return sortedEntries.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, Order[]>);
  };

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        selectedOrder={selectedOrder}
        onConfirm={modalAction === 'serve' ? handleConfirmServe : handleConfirmReject}
        onCancel={handleCancelModal}
        action={modalAction}
      />

      {/* Kitchen Sidebar */}
      <div className={isServeTab ? 'pointer-events-none opacity-50' : ''}>
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
          groupedOrders={groupedOrders}
          selectedGroups={selectedGroups}
          onMultipleGroupSelection={handleMultipleGroupSelection}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <NavigationTabs
          activeTab={activeTab as OrderStatus}
          onTabChange={setActiveTab as (tab: OrderStatus) => void}
          getTabCount={getTabCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          rightAction={(
            (() => {
              // Build a CTA for top-right based on current context
              // Use selected groups if available, else selected single order, else nothing
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
          )}
        />

        {/* Orders Content or Placeholder */}
        {(() => {
          // Check if we have any selection
          const hasSelection = selectedGroups.length > 0 || selectedGroup || selectedOrderKey;
          
          // If no selection and not serve tab with orders, show placeholder
          if (!hasSelection && !(isServeTab && Object.keys(filteredServeTabGroupedOrders).length > 0)) {
            return (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
                Chọn một món ăn để xem chi tiết
              </div>
            );
          }

          // Serve tab with orders
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
              />
            );
          }

          // Selected groups
          if (selectedGroups.length > 0) {
            const filtered = (() => {
              const filtered: Record<string, Order[]> = {};
              selectedGroups.forEach(group => {
                group.forEach(({ itemName, tableNumber, id }) => {
                  const orderList = (filteredGroupedOrdersForSearch as Record<string, Order[]>)[itemName] || [];
                  const foundOrder = orderList.find(
                    o => o.tableNumber === tableNumber && o.id === id
                  );
                  if (foundOrder) {
                    if (!filtered[itemName]) filtered[itemName] = [];
                    filtered[itemName].push(foundOrder);
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
              />
            );
          }

          // Selected group
          if (selectedGroup) {
            const filtered = (() => {
              const filtered: Record<string, Order[]> = {};
              selectedGroup.forEach(({ itemName, tableNumber, id }) => {
                const orderList = (filteredGroupedOrdersForSearch as Record<string, Order[]>)[itemName] || [];
                const foundOrder = orderList.find(
                  o => o.tableNumber === tableNumber && o.id === id
                );
                if (foundOrder) {
                  if (!filtered[itemName]) filtered[itemName] = [];
                  filtered[itemName].push(foundOrder);
                }
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
              />
            );
          }

          // Selected order key
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
              />
            );
          }

          // Fallback placeholder
          return (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
              Chọn một món ăn để xem chi tiết
            </div>
          );
        })()}
      </div>
    </div>
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