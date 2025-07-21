import React from 'react';
import { Category, RemainingItems } from '@/types/kitchen';

interface KitchenSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryName: string) => void;
  remainingItems: RemainingItems;
  shouldShowInSidebar: (itemName: string) => boolean;
}

export function KitchenSidebar({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  remainingItems, 
  shouldShowInSidebar 
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
      <button
        onClick={() => onCategorySelect("Đồ uống")}
        className={`w-full ${bgColor} hover:opacity-90 transition-colors duration-200 ${textColor} font-medium py-3 px-6 rounded-full text-center`}
      >
        {itemName}
      </button>
    </div>
  );

  return (
    <div className="w-80 bg-gray-200 p-6 flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Danh mục món ăn</h2>
      
      {/* Category Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3 text-gray-700">Bộ lọc</h3>
        <div className="flex flex-col gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.name)}
              className={`${category.color} ${
                selectedCategory === category.name ? 'ring-2 ring-blue-300' : ''
              } hover:opacity-90 transition-all duration-200 text-white font-medium py-2 px-4 rounded-lg text-center`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Beverages Section - Dynamic based on remaining orders */}
      {remainingItems["Nước chanh dây"] > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            {Array.from({ length: remainingItems["Nước chanh dây"] || 0 }, (_, index) => 
              renderAnimatedButton(
                "Nước chanh dây", 
                index, 
                "bg-yellow-400 hover:bg-yellow-500", 
                "text-black",
                `${index * 100}ms`
              )
            )}
          </div>
        </div>
      )}

      {/* Mixed Items Section - Dynamic based on remaining orders */}
      {(shouldShowInSidebar("Nước chanh dây") || shouldShowInSidebar("Trà đào ối hồng") || shouldShowInSidebar("Cacao đá xay")) && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            {shouldShowInSidebar("Nước chanh dây") && 
              renderAnimatedButton("Nước chanh dây", 0, "bg-green-500 hover:bg-green-600")
            }
            {shouldShowInSidebar("Trà đào ối hồng") && 
              renderAnimatedButton(
                "Trà đào ối hồng", 
                0, 
                "bg-green-500 hover:bg-green-600", 
                "text-white",
                shouldShowInSidebar("Nước chanh dây") ? '100ms' : '0ms'
              )
            }
            {shouldShowInSidebar("Cacao đá xay") && 
              renderAnimatedButton(
                "Cacao đá xay", 
                0, 
                "bg-green-500 hover:bg-green-600", 
                "text-white",
                shouldShowInSidebar("Trà đào ối hồng") ? '200ms' : shouldShowInSidebar("Nước chanh dây") ? '100ms' : '0ms'
              )
            }
          </div>
        </div>
      )}
    </div>
  );
} 