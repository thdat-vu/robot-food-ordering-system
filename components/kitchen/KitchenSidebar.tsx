import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Category, RemainingItems, GroupedOrders, Order } from '@/types/kitchen';
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { IconList, IconCup, IconSoup, IconIceCream } from '@tabler/icons-react'

interface KitchenSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryName: string) => void;
  remainingItems: RemainingItems;
  shouldShowInSidebar: (itemName: string) => boolean;
  itemNameToCategory: Record<string, string>;
  selectedOrderKey: { itemName: string; tableNumber: number; id: number } | null;
  onSidebarItemClick: (orderKey: { itemName: string; tableNumber: number; id: number }) => void;
  selectedGroup: { itemName: string; tableNumber: number; id: number }[] | null;
  onGroupSelection: (group: { itemName: string; tableNumber: number; id: number }[]) => void;
  selectedGroups: { itemName: string; tableNumber: number; id: number }[][];
  onMultipleGroupSelection: (groups: { itemName: string; tableNumber: number; id: number }[][]) => void;
  groupedOrders: GroupedOrders;
  orders: Order[];
  className?: string;
  initialWidth?: number; // in px, default 320
  minWidthPx?: number; // default 260
  maxWidthPx?: number; // default 480
  fluid?: boolean;
}

export function KitchenSidebar({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  remainingItems, 
  shouldShowInSidebar, 
  itemNameToCategory,
  selectedOrderKey,
  onSidebarItemClick,
  selectedGroup,
  onGroupSelection,
  selectedGroups,
  onMultipleGroupSelection,
  groupedOrders,
  orders,
  className,
  initialWidth = 480,
  minWidthPx = 260,
  maxWidthPx = 480,
  fluid = false
}: KitchenSidebarProps) {
  // Resizable width state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number>(initialWidth);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Keep sidebar reasonable on tablets by capping width to a percentage of viewport
  const getDynamicMaxWidth = (): number => {
    if (typeof window === 'undefined') return maxWidthPx;
    const percentCap = Math.round(window.innerWidth * 0.4); // at most 40% of viewport
    return Math.min(maxWidthPx, Math.max(minWidthPx, percentCap));
  };

  // On mount and when viewport changes, clamp or set a sensible width
  useEffect(() => {
    if (fluid) return;

    const applyResponsiveWidth = () => {
      const dynamicMax = getDynamicMaxWidth();
      const preferred = Math.min(dynamicMax, Math.max(minWidthPx, sidebarWidth || initialWidth));
      setSidebarWidth(preferred);
    };
    applyResponsiveWidth();
    window.addEventListener('resize', applyResponsiveWidth);
    return () => window.removeEventListener('resize', applyResponsiveWidth);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fluid]);

  const onResizeMouseDown = (e: React.MouseEvent) => {
    if (fluid) return;
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing || fluid) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nextWidth = e.clientX - rect.left; // distance from left edge
      const dynamicMax = getDynamicMaxWidth();
      const clamped = Math.max(minWidthPx, Math.min(dynamicMax, nextWidth));
      setSidebarWidth(clamped);
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidthPx, fluid]);

  // Compute counts per category using remainingItems (all pending items)
  const categoryCounts = useMemo((): Record<string, number> => {
    const counts: Record<string, number> = {
      'Tất cả': 0,
      'Đồ uống': 0,
      'Món chính': 0,
      'Tráng miệng': 0,
    };
    // remainingItems * quantity
    Object.entries(remainingItems).forEach(([itemName, count]) => {
      const categoryName = itemNameToCategory[itemName];
      // find actual order to get quantity
      const order = orders?.find(o => o.itemName === itemName);
      const quantity = order ? order.quantity : 1;
      
      if (categoryName && counts.hasOwnProperty(categoryName)) {
        counts[categoryName] += count * quantity;
      }
      counts['Tất cả'] += count * quantity;
    });
    return counts;
  }, [remainingItems, itemNameToCategory]);
  const renderAnimatedButton = (
    itemName: string, 
    index: number, 
    bgColor: string, 
    textColor: string = "text-white",
    delay: string = "0ms"
  ) => (
    <div
      key={`${itemName}-${index}`}
      className={`transition-all duration-500 ease-in-out transform ${
        shouldShowInSidebar(itemName) 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
      }`}
      style={{ transitionDelay: delay }}
    >
      <Button
        onClick={() => onSidebarItemClick({ itemName, tableNumber: 0, id: 0 })}
        variant="secondary"
        className={`hover:bg-gray-200 ${selectedOrderKey?.itemName === itemName ? 'bg-gray-300' : ''}`}
      >
        {itemName}
      </Button>
    </div>
  );

  const renderCategoryButton = (
    itemName: string,
    categoryName: string,
    bgColor: string,
    textColor: string = "text-white"
  ) => (
    <Button onClick={() => onCategorySelect(categoryName)}>
      {itemName}
    </Button>
  );

  // Helper to filter items by selectedCategory
  const filterByCategory = (itemName: string) => {
    if (selectedCategory === 'Tất cả') return true;
    return itemNameToCategory[itemName] === selectedCategory;
  };

  // Helper to check if a group is selected
  const isGroupSelected = (group: { itemName: string; tableNumber: number; id: number }[]) => {
    if (!selectedGroup || selectedGroup.length !== group.length) return false;
    return selectedGroup.every((item, index) => 
      item.itemName === group[index].itemName &&
      item.tableNumber === group[index].tableNumber &&
      item.id === group[index].id
    );
  };

  // Helper to check if a group is in multiple selection
  const isGroupInMultipleSelection = (group: { itemName: string; tableNumber: number; id: number }[]) => {
    if (!selectedGroups) return false;
    return selectedGroups.some(selectedGroup => {
      if (selectedGroup.length !== group.length) return false;
      return selectedGroup.every((item, index) => 
        item.itemName === group[index].itemName &&
        item.tableNumber === group[index].tableNumber &&
        item.id === group[index].id
      );
    });
  };

  // Handle checkbox click for multiple selection
  const handleCheckboxClick = (e: React.MouseEvent, group: { itemName: string; tableNumber: number; id: number }[]) => {
    e.stopPropagation(); // Prevent group selection when clicking checkbox
    
    if (!selectedGroups) {
      onMultipleGroupSelection([group]);
    } else {
      const isSelected = isGroupInMultipleSelection(group);
      if (isSelected) {
        // Remove group from selection
        const newSelectedGroups = selectedGroups.filter(selectedGroup => {
          if (selectedGroup.length !== group.length) return true;
          return !selectedGroup.every((item, index) => 
            item.itemName === group[index].itemName &&
            item.tableNumber === group[index].tableNumber &&
            item.id === group[index].id
          );
        });
        onMultipleGroupSelection(newSelectedGroups.length > 0 ? newSelectedGroups : []);
      } else {
        // Add group to selection
        onMultipleGroupSelection([...selectedGroups, group]);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      style={fluid ? { width: '100%' } : { width: sidebarWidth }}
      className={`bg-gray-200 flex flex-col h-screen relative flex-shrink-0 ${className || ''}`}
    >
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 md:p-6 pb-3 md:pb-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">Danh mục món ăn</h2>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 md:pb-6">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Category Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-700">Bộ lọc</h3>
            <div className="flex flex-col gap-2">
              {categories.map(category => {
                let IconComponent = IconList;
                if (category.name === 'Đồ uống') IconComponent = IconCup;
                else if (category.name === 'Món chính') IconComponent = IconSoup;
                else if (category.name === 'Tráng miệng') IconComponent = IconIceCream;
                return (
                  <Button
                    key={category.id}
                    onClick={() => onCategorySelect(category.name)}
                    variant="outline"
                    size="sm"
                    className="justify-between"
                  >
                    <span className="flex items-center">
                      <IconComponent className="mr-2 h-4 w-4" />
                      {category.name}
                    </span>
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-gray-200 text-gray-900">
                      {categoryCounts[category.name] ?? 0}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Filtered Items Section - show only items matching selectedCategory */}
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:gap-4"> {/* gap between groups */}
              {(() => {
                // Build table context for context-aware priority
                const tableContext = new Map<number, Set<string>>();
                orders.filter(order => order.status === 'đang chờ').forEach(order => {
                  if (!tableContext.has(order.tableNumber)) {
                    tableContext.set(order.tableNumber, new Set());
                  }
                  const category = itemNameToCategory[order.itemName] || order.category;
                  if (category) {
                    tableContext.get(order.tableNumber)!.add(category);
                  }
                });

                // Context-aware priority: boost dessert to main priority if table only has dessert
                const getContextualPriority = (itemName: string, tableNumber?: number): number => {
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

                // Process grouped orders - each group is already grouped by itemName+size only
                const displayGroups = Object.entries(groupedOrders)
                  .map(([groupKey, ordersInGroup]) => {
                    // Extract first order as representative
                    const representative = ordersInGroup[0];
                    if (!representative) return null;
                    
                    // Filter out "bắt đầu phục vụ" orders
                    const filtered = ordersInGroup.filter(order => order.status !== 'bắt đầu phục vụ');
                    if (filtered.length === 0) return null;

                    // Detect if any item has note or toppings
                    const hasVariations = filtered.some(order => 
                      (order.note && order.note.trim().length > 0) || 
                      (order.toppings && order.toppings.length > 0)
                    );

                    return {
                      groupKey,
                      itemName: representative.itemName,
                      sizeName: representative.sizeName,
                      category: representative.category,
                      tableNumber: representative.tableNumber, // For context-aware priority
                      orders: filtered,
                      hasVariations,
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

                // Render each group
                return displayGroups.map((group, groupIdx) => {
                  const isSelected = isGroupSelected(group.selectionItems);
                  const isInMultipleSelection = isGroupInMultipleSelection(group.selectionItems);
                  const totalQuantity = group.orders.length;

                  return (
                    <div
                      key={`sidebar-group-${group.groupKey}-${groupIdx}`}
                      className={`bg-gray-100 rounded-xl shadow p-2.5 md:p-3 cursor-pointer transition-all duration-200 ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        onGroupSelection(group.selectionItems);
                        // Toggle the checkbox for multiple selection
                        if (isInMultipleSelection) {
                          const newSelectedGroups = (selectedGroups || []).filter(selectedGroup => {
                            if (selectedGroup.length !== group.selectionItems.length) return true;
                            return !selectedGroup.every((item, index) => 
                              item.itemName === group.selectionItems[index].itemName &&
                              item.tableNumber === group.selectionItems[index].tableNumber &&
                              item.id === group.selectionItems[index].id
                            );
                          });
                          onMultipleGroupSelection(newSelectedGroups);
                        } else {
                          onMultipleGroupSelection([...(selectedGroups || []), group.selectionItems]);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isInMultipleSelection}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              onMultipleGroupSelection([...(selectedGroups || []), group.selectionItems]);
                            } else {
                              const newSelectedGroups = (selectedGroups || []).filter(selectedGroup => {
                                if (selectedGroup.length !== group.selectionItems.length) return true;
                                return !selectedGroup.every((item, index) => 
                                  item.itemName === group.selectionItems[index].itemName &&
                                  item.tableNumber === group.selectionItems[index].tableNumber &&
                                  item.id === group.selectionItems[index].id
                                );
                              });
                              onMultipleGroupSelection(newSelectedGroups);
                            }
                          }}
                          onClick={(e) => handleCheckboxClick(e, group.selectionItems)}
                          className="size-5 md:size-6 border-2 border-blue-600 text-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-200 data-[state=checked]:[&>[data-slot=checkbox-indicator]]:text-white shadow-sm"
                          aria-label="Chọn nhóm"
                        />
                        <div className="flex-1 bg-white rounded-lg px-3 py-2 shadow-sm">
                          <p className="text-sm font-semibold text-gray-800 leading-tight">
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
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Add bottom padding for better scrolling experience */}
          <div className="h-4"></div>
        </div>
      </div>

      {/* Right-edge resize handle */}
      {!fluid && (
        <div
          onMouseDown={onResizeMouseDown}
          className="absolute top-0 right-0 h-full w-2 cursor-col-resize bg-transparent hover:bg-gray-300/60"
          aria-label="Kéo để thay đổi độ rộng thanh bên"
        />
      )}
    </div>
  );
} 