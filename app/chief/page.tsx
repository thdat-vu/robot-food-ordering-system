'use client';

import React, { useState, Suspense } from 'react';
import { useCustomRouter } from '@/lib/custom-router';

// Types
import { Order } from '@/types/kitchen';

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
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);

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

  const handlePrepareClick = (itemName: string) => {
    handlePrepareOrders(itemName);
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
  const handleSidebarItemClick = (itemName: string) => {
    setSelectedItemName(prev => (prev === itemName ? null : itemName));
  };

  // Filter groupedOrders for selected item
  const filteredGroupedOrders = selectedItemName
    ? { [selectedItemName]: groupedOrders[selectedItemName] || [] }
    : {};

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
      <KitchenSidebar
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        remainingItems={remainingItems}
        shouldShowInSidebar={shouldShowInSidebar}
        itemNameToCategory={itemNameToCategory}
        selectedItemName={selectedItemName}
        onSidebarItemClick={handleSidebarItemClick}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          getTabCount={getTabCount}
        />

        {/* Orders Content or Placeholder */}
        {selectedItemName ? (
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