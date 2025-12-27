import React, { useEffect, useMemo, useState } from 'react';
import { Order } from '@/types/kitchen';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import LateDishWarning from '@/components/moderator/LateDishWarning';

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

  const formatOrderDateTime = (order: Order): string => {
    const raw = order.createdTime || order.orderTime;
    if (!raw) return '';

    const parsed = new Date(raw);
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

    return raw;
  };

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
                className={`relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
                  isSelected || isMultiSelected 
                    ? 'border-blue-500 ring-2 ring-blue-200 shadow-blue-100' 
                    : 'border-transparent hover:border-blue-300'
                }`}
              >
                {/* Late dish warning overlay */}
                {tableData && !hideLateWarning && <LateDishWarning table={tableData} borderRadius="rounded-2xl" />}
                
                {/* Header with gradient */}
                <div
                  className={`flex items-center justify-between px-4 py-4 cursor-pointer transition-colors ${
                    isSelected || isMultiSelected ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'hover:bg-gray-50'
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
                    className={`h-10 w-10 flex items-center justify-center rounded-xl border-2 transition-all duration-300 ${
                      isExpanded 
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
                    {groupedOrders.map(group => {
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
                      
                      // Get category info for styling
                      const category = itemNameToCategory?.[group.itemName];
                      const categoryAccent = getCategoryAccent(category);

                      return (
                        <div
                          key={group.key}
                          className={`relative overflow-hidden flex items-start gap-3 rounded-xl border-2 p-3 transition-all duration-300 cursor-pointer hover:shadow-md ${
                            isHighlighted 
                              ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm' 
                              : 'border-gray-100 bg-gray-50 hover:border-blue-200'
                          }`}
                          onClick={() => {
                            if (representativeOrder) {
                              onSidebarItemClick(toSelectionItem(representativeOrder));
                              onGroupSelection(selectionItems);
                            }
                          }}
                        >
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
                            {/* Item name and badges */}
                            <h4 className="text-sm font-bold text-gray-900 leading-tight mb-2">
                              {group.itemName}
                            </h4>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Size badge */}
                              {group.sizeName && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                  Size {group.sizeName.charAt(0).toUpperCase()}
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
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                  </svg>
                                  Ghi chú
                                </span>
                              )}
                            </div>
                            
                            {/* Timestamp */}
                            {(() => {
                              if (!representativeOrder) return null;
                              const timestamp = formatOrderDateTime(representativeOrder);
                              if (!timestamp) return null;
                              return (
                                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-400">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {timestamp}
                                </div>
                              );
                            })()}
                          </div>
                          
                          {/* Arrow indicator */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                            isHighlighted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
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

