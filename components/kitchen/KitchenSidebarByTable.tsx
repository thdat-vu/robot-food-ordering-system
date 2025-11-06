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

export function KitchenSidebarByTable({
  tables,
  selectedOrderKey,
  onSidebarItemClick,
  selectedGroup,
  onGroupSelection,
  selectedGroups,
  onMultipleGroupSelection,
  className,
}: KitchenSidebarByTableProps) {
  const tableSelectionMap = useMemo(() => {
    const map = new Map<number, SelectionItem[]>();
    tables.forEach(({ tableNumber, orders }) => {
      const selectionItems = sortGroup(orders.map(toSelectionItem));
      map.set(tableNumber, selectionItems);
    });
    return map;
  }, [tables]);

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

  const handleItemCheckboxChange = (order: Order, shouldSelect: boolean) => {
    const tableItems = tableSelectionMap.get(order.tableNumber) || [];
    const tableIds = new Set(tableItems.map(item => item.id));
    const targetItem = toSelectionItem(order);

    const remainingGroups: SelectionItem[][] = [];
    let itemWasPresent = false;

    selectedGroups.forEach(group => {
      const groupIds = group.map(item => item.id);
      const isSubsetOfTable = groupIds.every(id => tableIds.has(id));
      if (!isSubsetOfTable) {
        remainingGroups.push(group);
        return;
      }

      if (group.some(item => item.id === targetItem.id)) {
        itemWasPresent = true;
        if (shouldSelect) {
          remainingGroups.push(group);
        } else {
          const remaining = group.filter(item => item.id !== targetItem.id);
          if (remaining.length > 0) {
            remainingGroups.push(sortGroup(remaining));
          }
        }
      } else {
        remainingGroups.push(group);
      }
    });

    if (shouldSelect) {
      if (!itemWasPresent) {
        onMultipleGroupSelection([...remainingGroups, [targetItem]]);
      }
    } else if (itemWasPresent) {
      onMultipleGroupSelection(remainingGroups);
    }
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
                    {orders.map(order => {
                      const itemSelected = isItemSelected(order.id);
                      const isIndividuallySelected =
                        selectedOrderKey &&
                        selectedOrderKey.id === order.id &&
                        selectedOrderKey.tableNumber === order.tableNumber;

                      return (
                        <div
                          key={order.id}
                          className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                            itemSelected || isIndividuallySelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <Checkbox
                            checked={itemSelected}
                            onCheckedChange={checked => {
                              const value = checked === true;
                              handleItemCheckboxChange(order, value);
                            }}
                            className="mt-0.5 size-5 border-2 border-blue-600 text-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:[&>[data-slot=checkbox-indicator]]:text-white"
                            aria-label={`Chọn món ${order.itemName}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 justify-start text-left h-auto bg-transparent hover:bg-white"
                            onClick={() => onSidebarItemClick(toSelectionItem(order))}
                          >
                            <div className="w-full rounded-lg bg-white px-3 py-2 shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold text-gray-800 leading-tight break-words">
                                  {order.itemName}
                                </p>
                                <span className="flex items-center justify-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                                  x{order.quantity}
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                                {order.sizeName && <span>Size: {order.sizeName}</span>}
                                {order.note && (
                                  <span className="truncate" title={order.note}>
                                    Ghi chú: {order.note}
                                  </span>
                                )}
                              </div>
                              {(() => {
                                const timestamp = formatOrderDateTime(order);
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

