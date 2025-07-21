import React from 'react';
import { OrderStatus } from '@/types/kitchen';
import { TAB_DISPLAY_NAMES } from '@/constants/kitchen-data';

interface NavigationTabsProps {
  activeTab: OrderStatus;
  onTabChange: (tab: OrderStatus) => void;
  getTabCount: (status: OrderStatus) => number;
}

const TAB_ORDER: OrderStatus[] = ["đang chờ", "đang thực hiện", "bắt đầu phục vụ"];

export function NavigationTabs({ activeTab, onTabChange, getTabCount }: NavigationTabsProps) {
  const getBadgeColor = (tab: OrderStatus): string => {
    switch (tab) {
      case "đang chờ": 
        return 'bg-gray-400 text-white';
      case "đang thực hiện":
        return 'bg-blue-500 text-white';
      case "bắt đầu phục vụ":
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <nav className="flex justify-center space-x-2">
        {TAB_ORDER.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 ${
              activeTab === tab
                ? 'bg-gray-300 text-gray-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{TAB_DISPLAY_NAMES[tab]}</span>
            <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${getBadgeColor(tab)}`}>
              {getTabCount(tab)}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
} 