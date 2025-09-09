import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface DynamicSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: string[];
  showDropdown: boolean;
  onProductSelect: (productName: string) => void;
  onDropdownClose: () => void;
}

export function DynamicSearch({
  searchQuery,
  onSearchChange,
  searchResults,
  showDropdown,
  onProductSelect,
  onDropdownClose
}: DynamicSearchProps) {
  return (
    <Popover open={showDropdown} onOpenChange={(open) => !open && onDropdownClose()}>
      <PopoverTrigger asChild>
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm món để huỷ"
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
      </PopoverTrigger>
      
      {showDropdown && searchResults.length > 0 && (
        <PopoverContent className="w-64 p-0" align="start">
          <div className="max-h-60 overflow-y-auto">
            {searchResults.map((product, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => onProductSelect(product)}
              >
                <div className="flex items-center space-x-2">
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span className="truncate">{product}</span>
                </div>
              </Button>
            ))}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
