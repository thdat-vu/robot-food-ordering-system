'use client';

import React, { useState, Suspense } from 'react';
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

  const handleCancelServe = () => {
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
    setSelectedGroup(group);
    setSelectedOrderKey(null); // Clear individual selection when group is selected
  };

  // Multiple group selection handler
  const handleMultipleGroupSelection = (groups: { itemName: string; tableNumber: number; id: number }[][]) => {
    setSelectedGroups(groups);
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
              onClick={refreshOrders}
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
        onConfirm={handleConfirmServe}
        onCancel={handleCancelServe}
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
        />

        {/* Orders Content or Placeholder */}
        {isServeTab ? (
          <OrdersContent
            groupedOrders={filteredServeTabGroupedOrders}
            activeTab={activeTab}
            onGroupClick={handleGroupClick}
            onPrepareClick={handlePrepareClick}
            onServeClick={handleServeClick}
            onAcceptRedoClick={handleAcceptRedoClick}
            onRejectRedoClick={handleRejectRedoClick}
          />
        ) : selectedGroups.length > 0 ? (
          <OrdersContent
            groupedOrders={(() => {
              // Create a filtered groupedOrders with only the selected groups items
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
            })()}
            activeTab={activeTab}
            onGroupClick={handleGroupClick}
            onPrepareClick={handlePrepareClick}
            onServeClick={handleServeClick}
            onPrepareMultipleOrders={handlePrepareMultipleOrders}
            onServeMultipleOrders={handleServeMultipleOrders}
            showIndividualCards={true}
            onAcceptRedoClick={handleAcceptRedoClick}
            onRejectRedoClick={handleRejectRedoClick}
          />
        ) : selectedGroup ? (
          <OrdersContent
            groupedOrders={(() => {
              // Create a filtered groupedOrders with only the selected group items
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
            })()}
            activeTab={activeTab}
            onGroupClick={handleGroupClick}
            onPrepareClick={handlePrepareClick}
            onServeClick={handleServeClick}
            onPrepareMultipleOrders={handlePrepareMultipleOrders}
            onServeMultipleOrders={handleServeMultipleOrders}
            showIndividualCards={true}
            onAcceptRedoClick={handleAcceptRedoClick}
            onRejectRedoClick={handleRejectRedoClick}
          />
        ) : selectedOrderKey ? (
          <OrdersContent
            groupedOrders={filteredGroupedOrders}
            activeTab={activeTab}
            onGroupClick={handleGroupClick}
            onPrepareClick={handlePrepareClick}
            onServeClick={handleServeClick}
            onAcceptRedoClick={handleAcceptRedoClick}
            onRejectRedoClick={handleRejectRedoClick}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
            Chọn một món ăn để xem chi tiết
          </div>
        )}
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