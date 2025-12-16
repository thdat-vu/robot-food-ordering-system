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
      <div className="flex-shrink-0 p-4 md:p-6 pb-3 md:pb-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <IconList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">Danh mục món ăn</h2>
            <p className="text-sm text-white/70">Chọn món để thực hiện</p>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 md:pb-6">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Category Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <IconList className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-800">Bộ lọc danh mục</h3>
            </div>
            <div className="flex flex-col gap-2">
              {categories.map(category => {
                let IconComponent = IconList;
                let gradientClass = 'from-gray-500 to-gray-600';
                let selectedBg = 'bg-gray-600';
                
                if (category.name === 'Đồ uống') {
                  IconComponent = IconCup;
                  gradientClass = 'from-cyan-500 to-blue-500';
                  selectedBg = 'bg-gradient-to-r from-cyan-500 to-blue-500';
                } else if (category.name === 'Món chính') {
                  IconComponent = IconSoup;
                  gradientClass = 'from-orange-500 to-red-500';
                  selectedBg = 'bg-gradient-to-r from-orange-500 to-red-500';
                } else if (category.name === 'Tráng miệng') {
                  IconComponent = IconIceCream;
                  gradientClass = 'from-pink-500 to-purple-500';
                  selectedBg = 'bg-gradient-to-r from-pink-500 to-purple-500';
                } else if (category.name === 'Tất cả') {
                  gradientClass = 'from-blue-500 to-indigo-600';
                  selectedBg = 'bg-gradient-to-r from-blue-500 to-indigo-600';
                }
                
                const isSelected = selectedCategory === category.name;
                const count = categoryCounts[category.name] ?? 0;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => onCategorySelect(category.name)}
                    className={`relative overflow-hidden flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 ${
                      isSelected 
                        ? `${selectedBg} text-white shadow-lg transform scale-[1.02]`
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-white/20' : `bg-gradient-to-r ${gradientClass}`
                      }`}>
                        <IconComponent className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-white'}`} />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </span>
                    <span className={`inline-flex items-center justify-center min-w-[28px] px-2.5 py-1 text-xs font-bold rounded-full ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {count}
                    </span>
                  </button>
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
                  
                  // Get category color for accent
                  const getCategoryAccent = (category: string) => {
                    switch (category) {
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
                  const categoryAccent = getCategoryAccent(group.category);

                  return (
                    <div
                      key={`sidebar-group-${group.groupKey}-${groupIdx}`}
                      className={`relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] border-2 ${
                        isInMultipleSelection 
                          ? 'border-blue-500 ring-2 ring-blue-200 shadow-blue-100' 
                          : 'border-transparent hover:border-blue-300'
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
                      {/* Top gradient accent bar */}
                      <div className={`h-1.5 bg-gradient-to-r ${categoryAccent.bg}`}></div>
                      
                      <div className="p-3 md:p-4">
                        <div className="flex items-center gap-3">
                          {/* Checkbox with improved styling */}
                          <div className="flex-shrink-0">
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
                              className="size-6 md:size-7 rounded-lg border-2 border-blue-500 text-blue-600 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-indigo-600 data-[state=checked]:border-blue-600 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-200 data-[state=checked]:[&>[data-slot=checkbox-indicator]]:text-white shadow-sm transition-all duration-200"
                              aria-label="Chọn nhóm"
                            />
                          </div>
                          
                          {/* Content area */}
                          <div className="flex-1 min-w-0">
                            {/* Item name */}
                            <h4 className="font-bold text-gray-900 text-base leading-tight truncate">
                              {group.itemName}
                            </h4>
                            
                            {/* Badges row */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {/* Size badge */}
                              {group.sizeName && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                  Size {group.sizeName.charAt(0).toUpperCase()}
                                </span>
                              )}
                              
                              {/* Quantity badge */}
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${categoryAccent.badge} border`}>
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
                          </div>
                          
                          {/* Arrow indicator */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                            isInMultipleSelection ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
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