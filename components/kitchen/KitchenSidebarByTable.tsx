import React, { useEffect, useMemo, useState } from 'react';
import { Order } from '@/types/kitchen';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { IconMinus, IconPlus } from '@tabler/icons-react';

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
  className?: string;
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
  className,
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

  return (
    <div className={`flex flex-col h-full bg-transparent ${className || ''}`}>
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4">
        {tables.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Không có món nào trong danh sách.
          </div>
        ) : (
          tables.map(({ tableNumber, orders }) => {
            const tableSelection = tableSelectionMap.get(tableNumber) || [];
            const tableCheckboxState = getTableSelectionState(tableNumber);
            const isExpanded = expandedTables[tableNumber] ?? true;
            const isSelected = isTablePrimarySelected(tableNumber);
            const isMultiSelected = isTableGroupSelected(tableNumber);
            const groupedOrders = groupedTableMap.get(tableNumber) || [];

            return (
              <div
                key={tableNumber}
                className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 ${
                  isSelected || isMultiSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  onClick={() => onGroupSelection(tableSelection)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={tableCheckboxState}
                      onCheckedChange={checked => {
                        const value = checked === true;
                        handleTableCheckboxChange(tableNumber, value);
                      }}
                      onClick={event => event.stopPropagation()}
                      className="size-5 md:size-6 border-2 border-blue-600 text-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:[&>[data-slot=checkbox-indicator]]:text-white"
                      aria-label={`Chọn toàn bộ món bàn ${tableNumber}`}
                    />
                    <div className="flex flex-col">
                      <span className="text-base font-semibold text-gray-800">Bàn {tableNumber}</span>
                      <span className="text-xs text-gray-500">{orders.length} món</span>
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
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100"
                    aria-label={isExpanded ? 'Thu gọn bàn' : 'Mở rộng bàn'}
                  >
                    {isExpanded ? <IconMinus size={16} /> : <IconPlus size={16} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 flex flex-col gap-2">
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

                      return (
                        <div
                          key={group.key}
                          className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                            isHighlighted ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <Checkbox
                            checked={checkboxState}
                            onCheckedChange={checked => {
                              const value = checked === true;
                              handleOrdersGroupCheckboxChange(group.orders, value);
                            }}
                            className="mt-0.5 size-5 border-2 border-blue-600 text-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:[&>[data-slot=checkbox-indicator]]:text-white"
                            aria-label={`Chọn món ${group.itemName}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 justify-start text-left h-auto bg-transparent hover:bg-white"
                            onClick={() => {
                              if (representativeOrder) {
                                onSidebarItemClick(toSelectionItem(representativeOrder));
                                onGroupSelection(selectionItems);
                              }
                            }}
                          >
                            <div className="w-full rounded-lg bg-white px-3 py-2 shadow-sm">
                              <p className="text-sm font-semibold text-gray-800 leading-tight break-words">
                                {group.itemName}
                                {group.sizeName && (
                                  <span className="text-blue-600 ml-1">
                                    ({group.sizeName.charAt(0).toUpperCase()})
                                  </span>
                                )}
                                <span className="ml-2 text-gray-600 font-medium">
                                  x{totalQuantity}
                                </span>
                                {group.hasVariations && (
                                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-orange-600 font-medium">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                    </svg>
                                    Có ghi chú
                                  </span>
                                )}
                              </p>
                              {(() => {
                                if (!representativeOrder) return null;
                                const timestamp = formatOrderDateTime(representativeOrder);
                                if (!timestamp) return null;
                                return (
                                  <div className="mt-1 text-xs font-medium text-gray-400">
                                    {timestamp}
                                  </div>
                                );
                              })()}
                            </div>
                          </Button>
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

