import React from 'react';
import { Category, RemainingItems, GroupedOrders } from '@/types/kitchen';
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
  className?: string;
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
  className
}: KitchenSidebarProps) {
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
    <div className={`w-80 bg-gray-200 flex flex-col h-screen ${className || ''}`}>
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <h2 className="text-xl font-bold text-gray-800">Danh mục món ăn</h2>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col gap-6">
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
                    className="justify-start"
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Filtered Items Section - show only items matching selectedCategory */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col gap-4"> {/* gap between groups */}
              {(() => {
                // Flatten all filtered orders into a single array
                const allOrders = Object.entries(groupedOrders)
                  .filter(([itemName, orders]) => shouldShowInSidebar(itemName) && filterByCategory(itemName))
                  .flatMap(([itemName, orders]) =>
                    orders
                      .filter(order => order.status !== 'bắt đầu phục vụ')
                      .map((order) => ({
                        itemName,
                        tableNumber: order.tableNumber,
                        id: order.id,
                      }))
                  );
                // Group into chunks of 3
                const groups = [];
                for (let i = 0; i < allOrders.length; i += 3) {
                  groups.push(allOrders.slice(i, i + 3));
                }
                return groups.map((group, groupIdx) => {
                  const isSelected = isGroupSelected(group);
                  const isInMultipleSelection = isGroupInMultipleSelection(group);
                  return (
                    <div
                      key={`sidebar-group-${groupIdx}`}
                      className={`bg-gray-100 rounded-xl shadow p-3 flex flex-col gap-2 cursor-pointer transition-all duration-200 ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        onGroupSelection(group);
                        // Toggle the checkbox for multiple selection
                        if (isInMultipleSelection) {
                          // Uncheck: remove from multiple selection
                          const newSelectedGroups = (selectedGroups || []).filter(selectedGroup => {
                            if (selectedGroup.length !== group.length) return true;
                            return !selectedGroup.every((item, index) => 
                              item.itemName === group[index].itemName &&
                              item.tableNumber === group[index].tableNumber &&
                              item.id === group[index].id
                            );
                          });
                          onMultipleGroupSelection(newSelectedGroups);
                        } else {
                          // Check: add to multiple selection
                          onMultipleGroupSelection([...(selectedGroups || []), group]);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <Checkbox
                          checked={isInMultipleSelection}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              onMultipleGroupSelection([...(selectedGroups || []), group]);
                            } else {
                              const newSelectedGroups = (selectedGroups || []).filter(selectedGroup => {
                                if (selectedGroup.length !== group.length) return true;
                                return !selectedGroup.every((item, index) => 
                                  item.itemName === group[index].itemName &&
                                  item.tableNumber === group[index].tableNumber &&
                                  item.id === group[index].id
                                );
                              });
                              onMultipleGroupSelection(newSelectedGroups);
                            }
                          }}
                          onClick={(e) => handleCheckboxClick(e, group)}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {group.length} món
                        </span>
                      </div>
                      {group.map(({ itemName, tableNumber, id }) => {
                        const isIndividualSelected =
                          selectedOrderKey &&
                          selectedOrderKey.itemName === itemName &&
                          selectedOrderKey.tableNumber === tableNumber &&
                          selectedOrderKey.id === id;
                        return (
                          <div
                            key={`${itemName}-table-${tableNumber}-${id}`}
                            className="transition-all duration-500 ease-in-out transform opacity-100 translate-y-0 scale-100 w-full"
                          >
                            <Button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent group selection when clicking individual item
                                onSidebarItemClick({ itemName, tableNumber, id });
                              }}
                              variant="secondary"
                              className={`hover:bg-gray-200 ${isIndividualSelected ? 'bg-gray-300' : ''} text-left max-w-full h-auto min-h-[48px] px-3 py-2`}
                            >
                              <div className="flex w-full items-center gap-2">
                                <span className="block text-sm leading-tight truncate flex-1 min-w-0">
                                  {itemName}
                                </span>
                                <span className="text-sm leading-tight font-semibold flex-shrink-0 bg-gray-200 text-gray-900 rounded px-2 py-0.5">
                                  Bàn {tableNumber}
                                </span>
                              </div>
                            </Button>
                          </div>
                        );
                      })}
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
    </div>
  );
} 