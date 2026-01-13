import React, { useEffect, useMemo, useState } from 'react';
import { Order } from '@/types/kitchen';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import LateDishWarning from '@/components/moderator/LateDishWarning';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

type SelectionItem = { itemName: string; tableNumber: number; id: number };

interface TableOrders {
  tableNumber: number;
  orders: Order[];
}

interface KitchenSidebarByTableProps {
  tables: TableOrders[];
  selectedOrderKey: SelectionItem | null;
  onSidebarItemClick: (orderKey: SelectionItem) => void;
  selectedGroup: SelectionItem[] | null;
  onGroupSelection: (group: SelectionItem[]) => void;
  selectedGroups: SelectionItem[][];
  onMultipleGroupSelection: (groups: SelectionItem[][]) => void;
  itemNameToCategory?: Record<string, string>; // For context-aware sorting
  tableDataMap?: Record<number, any>; // Map tableNumber -> TableData for late dish warnings
  className?: string;
  hideCheckboxes?: boolean; // Hide checkboxes for serve tab (view-only mode)
  hideLateWarning?: boolean; // Hide late dish warning overlay
}

const toSelectionItem = (order: Order): SelectionItem => ({
  itemName: order.itemName,
  tableNumber: order.tableNumber,
  id: order.id,
});

const sortGroup = (group: SelectionItem[]): SelectionItem[] =>
  [...group].sort((a, b) => a.id - b.id);

const areSameGroup = (a: SelectionItem[], b: SelectionItem[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item.id === b[index].id);
};

type DisplayOrderGroup = {
  key: string;
  itemName: string;
  sizeName?: string;
  orders: Order[];
  quantity: number;
  hasVariations: boolean; // Indicator for note/toppings variations
};

// ============================================================================
// CONTEXT-AWARE SORTING FOR TABLE VIEW
// ============================================================================
// Sort orders within each table by priority: Đồ uống > Món chính > Tráng miệng
// BOOST dessert to main priority if table only has desserts
// ============================================================================

const groupOrdersForDisplay = (
  orders: Order[],
  tableNumber: number,
  itemNameToCategory?: Record<string, string>,
  allOrders?: Order[] // All pending orders for context analysis
): DisplayOrderGroup[] => {
  const map = new Map<string, DisplayOrderGroup>();

  orders.forEach(order => {
    const sizeKey = order.sizeName?.trim().toLowerCase() || '__NO_SIZE__';
    const key = `${order.itemName}__${sizeKey}`;

    if (!map.has(key)) {
      map.set(key, {
        key,
        itemName: order.itemName,
        sizeName: order.sizeName,
        orders: [],
        quantity: 0,
        hasVariations: false,
      });
    }

    const group = map.get(key)!;
    group.orders.push(order);

    const qty = order.quantity && order.quantity > 0 ? order.quantity : 1;
    group.quantity += qty;
  });

  // Detect if any item has note or toppings
  map.forEach((group) => {
    group.hasVariations = group.orders.some(order =>
      (order.note && order.note.trim().length > 0) ||
      (order.toppings && order.toppings.length > 0)
    );
  });

  // ============================================================================
  // Context-Aware Priority Sorting
  // ============================================================================

  // Build table context if we have the necessary data
  const getTableCategoryContext = (): Map<number, Set<string>> => {
    const tableContext = new Map<number, Set<string>>();

    if (!allOrders || !itemNameToCategory) return tableContext;

    allOrders.filter(order => order.status === 'đang chờ').forEach(order => {
      if (!tableContext.has(order.tableNumber)) {
        tableContext.set(order.tableNumber, new Set());
      }
      const category = itemNameToCategory[order.itemName] || order.category;
      if (category) {
        tableContext.get(order.tableNumber)!.add(category);
      }
    });

    return tableContext;
  };

  const tableContext = getTableCategoryContext();

  const getContextualPriority = (itemName: string): number => {
    if (!itemNameToCategory) {
      // Fallback: sort by ID if no category mapping
      return 999;
    }

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

    // If not dessert, return base priority
    if (category !== 'Tráng miệng') {
      return basePriority;
    }

    // Check table context
    const tableCategories = tableContext.get(tableNumber);
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
  };

  // OLD SORTING (commented out for reference):
  // return Array.from(map.values()).sort((a, b) => {
  //   const firstA = a.orders[0]?.id ?? 0;
  //   const firstB = b.orders[0]?.id ?? 0;
  //   return firstA - firstB;
  // });

  // NEW SORTING: Context-aware priority
  return Array.from(map.values()).sort((a, b) => {
    const priorityA = getContextualPriority(a.itemName);
    const priorityB = getContextualPriority(b.itemName);

    // Sort by priority first
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If same priority, sort by ID (time order)
    const firstA = a.orders[0]?.id ?? 0;
    const firstB = b.orders[0]?.id ?? 0;
    return firstA - firstB;
  });
};

const toSelectionItems = (orders: Order[]): SelectionItem[] =>
  sortGroup(orders.map(toSelectionItem));

export function KitchenSidebarByTable({
  tables,
  selectedOrderKey,
  onSidebarItemClick,
  selectedGroup,
  onGroupSelection,
  selectedGroups,
  onMultipleGroupSelection,
  itemNameToCategory,
  tableDataMap = {},
  className,
  hideCheckboxes = false,
  hideLateWarning = false,
}: KitchenSidebarByTableProps) {
  // Collect all orders from all tables for context analysis
  const allOrders = useMemo(() => {
    return tables.flatMap(({ orders }) => orders);
  }, [tables]);

  const tableSelectionMap = useMemo(() => {
    const map = new Map<number, SelectionItem[]>();
    tables.forEach(({ tableNumber, orders }) => {
      const selectionItems = sortGroup(orders.map(toSelectionItem));
      map.set(tableNumber, selectionItems);
    });
    return map;
  }, [tables]);

  const groupedTableMap = useMemo(() => {
    const map = new Map<number, DisplayOrderGroup[]>();
    tables.forEach(({ tableNumber, orders }) => {
      // Pass tableNumber, itemNameToCategory, and allOrders for context-aware sorting
      map.set(tableNumber, groupOrdersForDisplay(orders, tableNumber, itemNameToCategory, allOrders));
    });
    return map;
  }, [tables, itemNameToCategory, allOrders]);

  const [expandedTables, setExpandedTables] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setExpandedTables(prev => {
      const next: Record<number, boolean> = {};
      tables.forEach(({ tableNumber }) => {
        next[tableNumber] = prev[tableNumber] ?? true;
      });
      return next;
    });
  }, [tables]);

  const getTableSelectionState = (tableNumber: number): boolean | 'indeterminate' => {
    const tableItems = tableSelectionMap.get(tableNumber) || [];
    const tableIds = new Set(tableItems.map(item => item.id));
    let selectedCount = 0;

    const seen = new Set<number>();
    selectedGroups.forEach(group => {
      group.forEach(item => {
        if (tableIds.has(item.id) && !seen.has(item.id)) {
          seen.add(item.id);
          selectedCount += 1;
        }
      });
    });

    if (selectedCount === 0) return false;
    if (selectedCount === tableIds.size) return true;
    return 'indeterminate';
  };

  const handleTableCheckboxChange = (tableNumber: number, shouldSelect: boolean) => {
    const tableItems = tableSelectionMap.get(tableNumber) || [];
    if (tableItems.length === 0) return;
    const tableIds = new Set(tableItems.map(item => item.id));

    const remainingGroups: SelectionItem[][] = [];

    selectedGroups.forEach(group => {
      const groupIds = group.map(item => item.id);
      const isSubsetOfTable = groupIds.every(id => tableIds.has(id));
      if (!isSubsetOfTable) {
        remainingGroups.push(group);
      }
    });

    if (shouldSelect) {
      const nextGroups = [...remainingGroups, tableItems];
      onMultipleGroupSelection(nextGroups);
    } else {
      onMultipleGroupSelection(remainingGroups);
    }
  };

  const handleOrdersGroupCheckboxChange = (orders: Order[], shouldSelect: boolean) => {
    if (orders.length === 0) return;

    const targetItems = toSelectionItems(orders);
    const targetIds = new Set(targetItems.map(item => item.id));

    const nextGroups: SelectionItem[][] = [];

    selectedGroups.forEach(group => {
      const filtered = group.filter(item => !targetIds.has(item.id));
      if (filtered.length > 0) {
        nextGroups.push(sortGroup(filtered));
      }
    });

    if (shouldSelect) {
      const alreadyExists = nextGroups.some(group => areSameGroup(group, targetItems));
      if (!alreadyExists) {
        nextGroups.push(targetItems);
      }
    }

    onMultipleGroupSelection(nextGroups);
  };

  const isItemSelected = (orderId: number): boolean => {
    return selectedGroups.some(group => group.some(item => item.id === orderId));
  };

  const isTableGroupSelected = (tableNumber: number): boolean => {
    const tableSelection = tableSelectionMap.get(tableNumber);
    if (!tableSelection || tableSelection.length === 0) return false;
    return selectedGroups.some(group => areSameGroup(group, tableSelection));
  };

  const isTablePrimarySelected = (tableNumber: number): boolean => {
    const tableSelection = tableSelectionMap.get(tableNumber);
    if (!tableSelection || tableSelection.length === 0 || !selectedGroup) return false;
    return areSameGroup(sortGroup(selectedGroup), tableSelection);
  };

  const formatOrderDateTime = (dateString?: string): string => {
    if (!dateString) return '';

    // Try parsing as already formatted string (HH:mm:ss dd/MM/yyyy)
    const alreadyFormatted = dateString.match(/^(\d{2}):(\d{2}):(\d{2})\s+(\d{2})\/(\d{2})\/(\d{4})$/);
    if (alreadyFormatted) {
      return dateString; // Already in correct format
    }

    // Try parsing as Date
    const parsed = new Date(dateString);
    if (!Number.isNaN(parsed.getTime())) {
      const pad = (value: number) => value.toString().padStart(2, '0');
      const hours = pad(parsed.getHours());
      const minutes = pad(parsed.getMinutes());
      const seconds = pad(parsed.getSeconds());
      const day = pad(parsed.getDate());
      const month = pad(parsed.getMonth() + 1);
      const year = parsed.getFullYear();
      return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    }

    return dateString;
  };

  const renderCreatedTimeIcon = () => (
    <svg
      className="w-3 h-3 text-gray-400"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );

  const renderReadyTimeIcon = () => (
    <svg
      className="w-3 h-3 text-emerald-500"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );

  const renderRemakedTimeIcon = () => (
    <svg
      className="w-3 h-3 text-red-500"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );

  // Get category accent color
  const getCategoryAccent = (categoryName?: string) => {
    switch (categoryName) {
      case 'Đồ uống':
        return { bg: 'from-cyan-500 to-blue-500', badge: 'bg-cyan-100 text-cyan-700 border-cyan-200' };
      case 'Món chính':
        return { bg: 'from-orange-500 to-red-500', badge: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'Tráng miệng':
        return { bg: 'from-pink-500 to-purple-500', badge: 'bg-pink-100 text-pink-700 border-pink-200' };
      default:
        return { bg: 'from-gray-500 to-gray-600', badge: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  return (
    <div className={`flex flex-col h-full bg-transparent ${className || ''}`}>
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4">
        {tables.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Không có món nào trong danh sách</p>
          </div>
        ) : (
          tables.map(({ tableNumber, orders }) => {
            const tableSelection = tableSelectionMap.get(tableNumber) || [];
            const tableCheckboxState = getTableSelectionState(tableNumber);
            const isExpanded = expandedTables[tableNumber] ?? true;
            const isSelected = isTablePrimarySelected(tableNumber);
            const isMultiSelected = isTableGroupSelected(tableNumber);
            const groupedOrders = groupedTableMap.get(tableNumber) || [];

            const tableData = tableDataMap[tableNumber];

            return (
              <div
                key={tableNumber}
                className={`relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 ${isSelected || isMultiSelected
                  ? 'border-blue-500 ring-2 ring-blue-200 shadow-blue-100'
                  : 'border-transparent hover:border-blue-300'
                  }`}
              >
                {/* Late dish warning overlay */}
                {tableData && !hideLateWarning && <LateDishWarning table={tableData} borderRadius="rounded-2xl" />}

                {/* Header with gradient */}
                <div
                  className={`flex items-center justify-between px-4 py-4 cursor-pointer transition-colors ${isSelected || isMultiSelected ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'hover:bg-gray-50'
                    }`}
                  onClick={() => onGroupSelection(tableSelection)}
                >
                  <div className="flex items-center gap-4">
                    {/* Table checkbox - hidden when hideCheckboxes is true */}
                    {!hideCheckboxes && (
                      <Checkbox
                        checked={tableCheckboxState}
                        onCheckedChange={checked => {
                          const value = checked === true;
                          handleTableCheckboxChange(tableNumber, value);
                        }}
                        onClick={event => event.stopPropagation()}
                        className="size-6 md:size-7 rounded-lg border-2 border-blue-500 text-blue-600 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-indigo-600 data-[state=checked]:border-blue-600 data-[state=checked]:[&>[data-slot=checkbox-indicator]]:text-white shadow-sm transition-all duration-200"
                        aria-label={`Chọn toàn bộ món bàn ${tableNumber}`}
                      />
                    )}
                    <div className="flex items-center gap-3">
                      {/* Table icon with gradient */}
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">{tableNumber}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-800">Bàn {tableNumber}</span>
                        {/* Show count with status-appropriate text, hide for "bắt đầu phục vụ" */}
                        {orders[0]?.status !== 'bắt đầu phục vụ' && (
                          <span className="text-sm text-gray-500 font-medium">
                            {orders.length} món {orders[0]?.status === 'đang thực hiện' ? 'đang thực hiện' : 'đang chờ'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      setExpandedTables(prev => ({
                        ...prev,
                        [tableNumber]: !(prev[tableNumber] ?? true),
                      }));
                    }}
                    className={`h-10 w-10 flex items-center justify-center rounded-xl border-2 transition-all duration-300 ${isExpanded
                      ? 'bg-gray-100 border-gray-200 text-gray-600'
                      : 'bg-blue-50 border-blue-200 text-blue-600'
                      } hover:scale-105`}
                    aria-label={isExpanded ? 'Thu gọn bàn' : 'Mở rộng bàn'}
                  >
                    {isExpanded ? <IconMinus size={18} /> : <IconPlus size={18} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 flex flex-col gap-3">
                    {groupedOrders.map((group, groupIndex) => {
                      const selectionItems = toSelectionItems(group.orders);
                      const selectedCount = group.orders.filter(order => isItemSelected(order.id)).length;
                      const checkboxState =
                        selectedCount === group.orders.length
                          ? true
                          : selectedCount > 0
                            ? 'indeterminate'
                            : false;
                      const anySelected = selectedCount > 0;
                      const isGroupPrimarySelected =
                        selectedGroup && areSameGroup(sortGroup(selectedGroup), selectionItems);
                      const isGroupMultiSelected = selectedGroups.some(selected =>
                        areSameGroup(sortGroup(selected), selectionItems)
                      );
                      const isIndividuallySelected =
                        selectedOrderKey &&
                        group.orders.some(
                          order =>
                            selectedOrderKey.id === order.id &&
                            selectedOrderKey.tableNumber === order.tableNumber
                        );
                      const isHighlighted =
                        anySelected || isGroupPrimarySelected || isGroupMultiSelected || !!isIndividuallySelected;
                      const representativeOrder = group.orders[0];
                      const totalQuantity =
                        group.quantity > 0 ? group.quantity : group.orders.length;

                      // Calculate total count of items with same name (regardless of size) in this table
                      const totalItemsWithSameName = orders.filter(
                        order => order.itemName === group.itemName
                      ).reduce((sum, order) => {
                        const qty = order.quantity && order.quantity > 0 ? order.quantity : 1;
                        return sum + qty;
                      }, 0);

                      // Check if order should be highlighted (isUrgent or has remakedTime)
                      const isUrgentOrRemade = representativeOrder?.isUrgent || (representativeOrder?.remakedTime !== null && representativeOrder?.remakedTime !== undefined);
                      const finalHighlighted = isHighlighted || isUrgentOrRemade;

                      // Get category info for styling
                      const category = itemNameToCategory?.[group.itemName];
                      const categoryAccent = getCategoryAccent(category);

                      return (
                        <div
                          key={group.key}
                          className={`relative overflow-hidden flex items-start gap-3 rounded-xl border-2 p-3 transition-all duration-300 cursor-pointer hover:shadow-md ${isHighlighted
                            ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm'
                            : isUrgentOrRemade
                              ? 'border-red-300 shadow-red-100 ring-2 ring-red-200 bg-gradient-to-r from-red-50 to-orange-50'
                              : 'border-gray-100 bg-gray-50 hover:border-blue-200'
                            }`}
                          onClick={() => {
                            if (representativeOrder) {
                              onSidebarItemClick(toSelectionItem(representativeOrder));
                              onGroupSelection(selectionItems);
                            }
                          }}
                        >
                          {/* Urgent badge - top right corner */}
                          {representativeOrder?.isUrgent && (
                            <div className="absolute top-2 right-2 z-10 pointer-events-none">
                              <div className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-white shadow-2xl backdrop-blur-md border-2 bg-red-600 border-red-300 animate-[bounce_1s_infinite]">
                                <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-sm">KHẨN CẤP</span>
                              </div>
                            </div>
                          )}

                          {/* Left accent bar */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${categoryAccent.bg}`}></div>

                          {/* Item checkbox - hidden when hideCheckboxes is true */}
                          {!hideCheckboxes && (
                            <Checkbox
                              checked={checkboxState}
                              onCheckedChange={checked => {
                                const value = checked === true;
                                handleOrdersGroupCheckboxChange(group.orders, value);
                              }}
                              onClick={event => event.stopPropagation()}
                              className="mt-1 ml-2 size-5 rounded-md border-2 border-blue-500 text-blue-600 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-indigo-600 data-[state=checked]:border-blue-600 data-[state=checked]:[&>[data-slot=checkbox-indicator]]:text-white shadow-sm"
                              aria-label={`Chọn món ${group.itemName}`}
                            />
                          )}

                          <div className={`flex-1 min-w-0 ${hideCheckboxes ? 'ml-3' : 'ml-1'}`}>
                            {/* Item name, total count, size and quantity on same line */}
                            <h4 className="text-sm font-bold text-gray-900 leading-tight mb-2 flex items-center gap-2 flex-wrap">
                              {/* Total count badge - shows total items with same name in table */}
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold shadow-sm">
                                {totalItemsWithSameName}
                              </span>
                              <span>{group.itemName}</span>
                              <span className="text-gray-400 font-normal">-</span>
                              {/* Size badge */}
                              {group.sizeName && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                  {group.sizeName.charAt(0).toUpperCase()}
                                </span>
                              )}
                              {/* Quantity badge */}
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${categoryAccent.badge} border`}>
                                x{totalQuantity}
                              </span>
                              {/* Note indicator */}
                              {group.hasVariations && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  Ghi chú
                                </span>
                              )}
                            </h4>

                            {/* Toppings display line */}
                            {(() => {
                              // Collect all toppings from all orders in this group
                              const allToppings = group.orders.flatMap(order => order.toppings || []);
                              if (allToppings.length === 0) return null;

                              // Find max count of each topping per individual order (not total sum)
                              const toppingMaxCounts: Record<string, number> = {};
                              group.orders.forEach(order => {
                                const orderToppings = order.toppings || [];
                                const orderToppingCounts: Record<string, number> = {};
                                orderToppings.forEach(topping => {
                                  orderToppingCounts[topping] = (orderToppingCounts[topping] || 0) + 1;
                                });
                                // Update max count for each topping
                                Object.entries(orderToppingCounts).forEach(([topping, count]) => {
                                  toppingMaxCounts[topping] = Math.max(toppingMaxCounts[topping] || 0, count);
                                });
                              });

                              return (
                                <div className="mt-1 flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Topping:
                                  </span>
                                  {Object.entries(toppingMaxCounts).map(([topping, count]) => (
                                    <span
                                      key={topping}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
                                    >
                                      {topping}
                                      {count > 1 && (
                                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-purple-200 text-purple-800 text-[10px] font-bold">
                                          x{count}
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              );
                            })()}

                            {/* Timestamps - Horizontal layout with labels */}
                            <TooltipProvider>
                              <div className="mt-2 flex items-center gap-3 flex-wrap">
                                {representativeOrder?.createdTime && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 cursor-help hover:text-gray-700 transition-colors px-2 py-1 rounded-md hover:bg-gray-50">
                                        {renderCreatedTimeIcon()}
                                        <span className="text-gray-600 font-semibold">Tạo:</span>
                                        <span className="text-gray-500">{formatOrderDateTime(representativeOrder.createdTime)}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Ngày giờ tạo món</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {/* Show remakedTime for urgent/remade items, otherwise show readyTime */}
                                {representativeOrder?.isUrgent && representativeOrder?.remakedTime ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 cursor-help hover:text-red-700 transition-colors px-2 py-1 rounded-md hover:bg-red-50">
                                        {renderRemakedTimeIcon()}
                                        <span className="text-red-700 font-semibold">Trả lại:</span>
                                        <span className="text-red-600">{formatOrderDateTime(representativeOrder.remakedTime)}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Ngày giờ món bị trả lại</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : representativeOrder?.readyTime ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 cursor-help hover:text-emerald-700 transition-colors px-2 py-1 rounded-md hover:bg-emerald-50">
                                        {renderReadyTimeIcon()}
                                        <span className="text-emerald-700 font-semibold">Xong:</span>
                                        <span className="text-emerald-600">{formatOrderDateTime(representativeOrder.readyTime)}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Ngày giờ xong</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : null}
                              </div>
                            </TooltipProvider>
                          </div>

                          {/* Arrow indicator */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${isHighlighted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

