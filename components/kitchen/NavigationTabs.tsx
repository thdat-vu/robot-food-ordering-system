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
  const getBadgeColor = (tab: OrderStatus, isActive: boolean): string => {
    return isActive ? 'bg-primary text-white' : 'bg-gray-400 text-white';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <nav className="flex justify-center space-x-2">
        {TAB_ORDER.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Button
              key={tab}
              onClick={() => onTabChange(tab)}
              variant={isActive ? 'default' : 'ghost'}
              className={
                isActive
                  ? 'border border-primary shadow-lg text-primary-foreground font-bold bg-primary/90 hover:bg-primary'
                  : ''
              }
            >
              <span className={isActive ? 'text-white font-bold' : ''}>{TAB_DISPLAY_NAMES[tab]}</span>
              <span
                className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ml-2 ${getBadgeColor(tab, isActive)}`}
              >
                {getTabCount(tab)}
              </span>
            </Button>
          );
        })}
      </nav>
    </div>
  );
} 