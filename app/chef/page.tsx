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

  // Sidebar item selection state
  const [selectedOrderKey, setSelectedOrderKey] = useState<{ itemName: string; tableNumber: number; id: number } | null>(null);

  // Custom hooks
  const {
    activeTab,
    selectedCategory,
    expandedGroup,
    groupedOrders,
    remainingItems,
    setActiveTab,
    setSelectedCategory,
    setExpandedGroup,
    handlePrepareOrders,
    handleServeOrder,
    shouldShowInSidebar,
    getTabCount,
    itemNameToCategory,
  } = useKitchenOrders();

  const { toasts, addToast, removeToast } = useToastKitchen();

  // Event handlers
  const handleGroupClick = (itemName: string) => {
    setExpandedGroup(expandedGroup === itemName ? null : itemName);
  };

  const handlePrepareClick = (orderId: number, itemName: string) => {
    handlePrepareOrders(orderId);
    addToast(`Đã bắt đầu thực hiện món: ${itemName}`, 'success');
  };

  const handleServeClick = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleConfirmServe = () => {
    if (selectedOrder) {
      handleServeOrder(selectedOrder.id);
      addToast(`Đã bắt đầu phục vụ món: ${selectedOrder.itemName}`, 'success');
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
          groupedOrders={groupedOrders}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <NavigationTabs
          activeTab={activeTab as OrderStatus}
          onTabChange={setActiveTab as (tab: OrderStatus) => void}
          getTabCount={getTabCount}
        />

        {/* Orders Content or Placeholder */}
        {isServeTab ? (
          <OrdersContent
            groupedOrders={serveTabGroupedOrders}
            activeTab={activeTab}
            expandedGroup={expandedGroup}
            onGroupClick={handleGroupClick}
            onPrepareClick={handlePrepareClick}
            onServeClick={handleServeClick}
          />
        ) : selectedOrderKey ? (
          <OrdersContent
            groupedOrders={filteredGroupedOrders}
            activeTab={activeTab}
            expandedGroup={expandedGroup}
            onGroupClick={handleGroupClick}
            onPrepareClick={handlePrepareClick}
            onServeClick={handleServeClick}
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