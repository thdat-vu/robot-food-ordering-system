import React from 'react';
import { Category, RemainingItems } from '@/types/kitchen';
import { Button } from '@/components/ui/button'
import { IconList, IconCup, IconSoup, IconIceCream } from '@tabler/icons-react'

interface KitchenSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryName: string) => void;
  remainingItems: RemainingItems;
  shouldShowInSidebar: (itemName: string) => boolean;
  itemNameToCategory: Record<string, string>;
  selectedItemName: string | null; // <-- add this
  onSidebarItemClick: (itemName: string) => void; // <-- add this
}

export function KitchenSidebar({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  remainingItems, 
  shouldShowInSidebar, 
  itemNameToCategory,
  selectedItemName,
  onSidebarItemClick
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
        onClick={() => onSidebarItemClick(itemName)}
        variant="secondary"
        className={`hover:bg-gray-200 ${selectedItemName === itemName ? 'bg-gray-300' : ''}`}
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

  return (
    <div className="w-80 bg-gray-200 flex flex-col h-screen">
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
            <div className="flex flex-col gap-3">
              {Object.entries(remainingItems)
                .filter(([itemName, count]) => shouldShowInSidebar(itemName) && filterByCategory(itemName))
                .map(([itemName, count]) =>
                  Array.from({ length: count }, (_, index) =>
                    renderAnimatedButton(
                      itemName,
                      index,
                      itemNameToCategory[itemName] === 'Đồ uống' ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-green-500 hover:bg-green-600',
                      itemNameToCategory[itemName] === 'Đồ uống' ? 'text-black' : 'text-white',
                      `${index * 100}ms`
                    )
                  )
                )}
            </div>
          </div>

          {/* Add bottom padding for better scrolling experience */}
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
} 