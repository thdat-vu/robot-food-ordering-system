import React from 'react';
import { OrderStatus } from '@/types/kitchen';
import { TAB_DISPLAY_NAMES } from '@/constants/kitchen-data';
import { Button } from '@/components/ui/button'

interface NavigationTabsProps {
  activeTab: OrderStatus;
  onTabChange: (tab: OrderStatus) => void;
  getTabCount: (status: OrderStatus) => number;
}

const TAB_ORDER: OrderStatus[] = ["đang chờ", "đang thực hiện", "bắt đầu phục vụ"];

export function NavigationTabs({ activeTab, onTabChange, getTabCount }: NavigationTabsProps) {
  const getBadgeColor = (tab: OrderStatus): string => {
    return 'bg-gray-400 text-white';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <nav className="flex justify-center space-x-2">
        {TAB_ORDER.map((tab) => (
          <Button key={tab} onClick={() => onTabChange(tab)} variant="ghost">
            <span>{TAB_DISPLAY_NAMES[tab]}</span>
            <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${getBadgeColor(tab)}`}>
              {getTabCount(tab)}
            </span>
          </Button>
        ))}
      </nav>
    </div>
  );
} 