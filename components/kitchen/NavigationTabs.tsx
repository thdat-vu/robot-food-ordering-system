import React from 'react';
import { OrderStatus } from '@/types/kitchen';
import { TAB_DISPLAY_NAMES } from '@/constants/kitchen-data';
import { Button } from '@/components/ui/button';
import { DynamicSearch } from './DynamicSearch';

interface NavigationTabsProps {
  activeTab: OrderStatus;
  onTabChange: (tab: OrderStatus) => void;
  getTabCount: (status: OrderStatus) => number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchResults?: string[];
  showSearchDropdown?: boolean;
  onProductSelect?: (productName: string) => void;
  onSearchDropdownClose?: () => void;
  rightAction?: React.ReactNode;
}

// Note: The 'yêu cầu làm lại' tab is intentionally hidden per request.
// To restore it, add 'yêu cầu làm lại' back to the array below.
const TAB_ORDER: OrderStatus[] = ["đang chờ", "đang thực hiện", "bắt đầu phục vụ" /*, "yêu cầu làm lại"*/ ];

export function NavigationTabs({ 
  activeTab, 
  onTabChange, 
  getTabCount, 
  searchQuery = "", 
  onSearchChange,
  searchResults = [],
  showSearchDropdown = false,
  onProductSelect,
  onSearchDropdownClose,
  rightAction
}: NavigationTabsProps) {
  const getBadgeColor = (tab: OrderStatus, isActive: boolean): string => {
    return isActive ? 'bg-primary text-white' : 'bg-gray-400 text-white';
  };

  return (
  <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center md:justify-between">
        {/* Left spacer trimmed to remove large gap */}
        <div className="hidden md:block w-0"></div>

        {/* Navigation Tabs - Centered, flexible */}
        <nav className="order-1 md:order-none flex-1 flex flex-wrap justify-center gap-2 min-w-0">
          {TAB_ORDER.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Button
                key={tab}
                onClick={() => onTabChange(tab)}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className="px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm"
              >
                <span>{TAB_DISPLAY_NAMES[tab]}</span>
                <span
                  className={`inline-flex items-center justify-center px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-bold rounded-full ml-2 ${getBadgeColor(tab, isActive)}`}
                >
                  {getTabCount(tab)}
                </span>
              </Button>
            );
          })}
        </nav>

        {/* Search Bar + Right Action */}
        {(onSearchChange || rightAction) && (
          <div className="order-2 md:order-none flex items-center gap-2 md:gap-3 flex-shrink-0 justify-between md:justify-end w-full md:w-auto">
            {rightAction}
            {onSearchChange && onProductSelect && onSearchDropdownClose && (
              <DynamicSearch
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                searchResults={searchResults}
                showDropdown={showSearchDropdown}
                onProductSelect={onProductSelect}
                onDropdownClose={onSearchDropdownClose}
                className="w-full md:w-auto"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
} 