import React from 'react';
import { OrderStatus } from '@/types/kitchen';
import { TAB_DISPLAY_NAMES } from '@/constants/kitchen-data';
import { Button } from '@/components/ui/button'

interface NavigationTabsProps {
  activeTab: OrderStatus;
  onTabChange: (tab: OrderStatus) => void;
  getTabCount: (status: OrderStatus) => number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const TAB_ORDER: OrderStatus[] = ["đang chờ", "đang thực hiện", "bắt đầu phục vụ", "yêu cầu làm lại", "đã huỷ" ];

export function NavigationTabs({ 
  activeTab, 
  onTabChange, 
  getTabCount, 
  searchQuery = "", 
  onSearchChange 
}: NavigationTabsProps) {
  const getBadgeColor = (tab: OrderStatus, isActive: boolean): string => {
    return isActive ? 'bg-primary text-white' : 'bg-gray-400 text-white';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left spacer for balance */}
        <div className="w-64"></div>

        {/* Navigation Tabs - Centered */}
        <nav className="flex space-x-2">
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

        {/* Search Bar */}
        {onSearchChange && (
          <div className="flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-64 px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 