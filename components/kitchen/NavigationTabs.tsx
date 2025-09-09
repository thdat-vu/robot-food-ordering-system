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

const TAB_ORDER: OrderStatus[] = ["đang chờ", "đang thực hiện", "bắt đầu phục vụ", "yêu cầu làm lại" ];

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
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left spacer trimmed to remove large gap */}
        <div className="w-0"></div>

        {/* Navigation Tabs - Centered, flexible */}
        <nav className="flex-1 flex justify-center space-x-2 min-w-0">
          {TAB_ORDER.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Button
                key={tab}
                onClick={() => onTabChange(tab)}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
              >
                <span>{TAB_DISPLAY_NAMES[tab]}</span>
                <span
                  className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ml-2 ${getBadgeColor(tab, isActive)}`}
                >
                  {getTabCount(tab)}
                </span>
              </Button>
            );
          })}
        </nav>

        {/* Search Bar + Right Action */}
        {(onSearchChange || rightAction) && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {rightAction}
            {onSearchChange && onProductSelect && onSearchDropdownClose && (
              <DynamicSearch
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                searchResults={searchResults}
                showDropdown={showSearchDropdown}
                onProductSelect={onProductSelect}
                onDropdownClose={onSearchDropdownClose}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
} 