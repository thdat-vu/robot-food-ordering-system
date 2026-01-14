"use client";

import React from "react";
import { Position } from "../types";

interface TableProps {
  id: number;
  position: Position;
  isActive: boolean;
  isReady?: boolean;
  isServed?: boolean;
  isSelectable?: boolean; // Has dishes that can be selected
  onClick?: (id: number, event?: React.MouseEvent) => void;
  onCheckboxChange?: (id: number, checked: boolean) => void; // Separate handler for checkbox
  lastUpdateTime?: string | null; // Last order update time for this table
}

// Parse DD/MM/YYYY HH:mm:ss format to Date
const parseDateTime = (dateStr: string): Date | null => {
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
  if (match) {
    const [, day, month, year, hours, minutes, seconds] = match;
    return new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hours, 10),
      parseInt(minutes, 10),
      parseInt(seconds, 10)
    );
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// Calculate relative time (e.g., "5 phút trước")
const getRelativeTime = (dateStr: string | null | undefined): string | null => {
  if (!dateStr) return null;

  const date = parseDateTime(dateStr);
  if (!date) return null;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};

export const Table: React.FC<TableProps> = ({
  id,
  position,
  isActive,
  isReady = false,
  isServed = false,
  isSelectable = false,
  onClick,
  onCheckboxChange,
  lastUpdateTime,
}) => {
  const getTableStyle = () => {
    if (isActive) {
      return "bg-gradient-to-br from-red-400 to-red-500 text-white shadow-red-200";
    }
    if (isReady) {
      return "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200";
    }
    if (isServed) {
      return "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-yellow-200";
    }
    return "bg-gradient-to-br from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600";
  };

  // Click on table body -> show info card
  const handleTableClick = (event: React.MouseEvent) => {
    if (onClick) {
      onClick(id, event);
    }
  };

  // Click on checkbox -> toggle selection
  const handleCheckboxClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering table click
    if (onCheckboxChange) {
      onCheckboxChange(id, !isActive);
    }
  };

  // Show special cursor and border for selectable tables
  const selectableStyle = isSelectable && !isActive
    ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent"
    : isActive
      ? "ring-2 ring-red-400 ring-offset-2 ring-offset-transparent"
      : "";

  return (
    <div
      className={`absolute transition-all duration-300 z-10 ${isActive ? "scale-105" : "hover:scale-105"
        } cursor-pointer`}
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }}
      onClick={handleTableClick}
      title={isSelectable ? "Click để xem thông tin bàn" : undefined}
    >
      <div className="relative">
        <div
          className={`w-24 h-24 rounded-2xl shadow-xl border-4 border-white flex flex-col items-center justify-center transition-all duration-300 ${getTableStyle()} ${selectableStyle}`}
        >
          <div className="text-2xl mb-1">🍽️</div>
          <span className="text-xs font-bold">Bàn {id}</span>
        </div>

        {/* Checkbox for selectable tables */}
        {isSelectable && (
          <div
            className="absolute -top-2 -right-2 z-20"
            onClick={handleCheckboxClick}
            title={isActive ? "Bỏ chọn bàn này" : "Chọn tất cả món bàn này"}
          >
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all duration-200 shadow-md ${isActive
                ? "bg-white border-red-500 text-red-600"
                : "bg-white border-gray-400 hover:border-blue-500 text-transparent hover:bg-blue-50"
                }`}
            >
              {isActive && (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Status indicator for non-selectable tables */}
        {!isSelectable && (isReady || isServed) && (
          <div
            className={`absolute -top-2 -right-2 w-5 h-5 rounded-full ${isReady ? "bg-blue-500 animate-pulse" : "bg-yellow-500"
              }`}
          />
        )}

        {/* Label showing "Click chọn" for selectable but not selected tables */}
        {isSelectable && !isActive && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
            Click chọn
          </div>
        )}

        {/* Show last update time for selectable tables (blue - ready to serve) */}
        {isSelectable && lastUpdateTime && (
          <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full shadow-sm border border-amber-300 whitespace-nowrap">
            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-semibold">{getRelativeTime(lastUpdateTime)}</span>
          </div>
        )}

        {/* Show last update time for ready tables (blue - pending/preparing) that are not selectable */}
        {isReady && !isSelectable && lastUpdateTime && (
          <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full shadow-sm border border-blue-300 whitespace-nowrap">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-semibold">{getRelativeTime(lastUpdateTime)}</span>
          </div>
        )}

        {/* Show last update time for served tables (yellow) */}
        {isServed && !isSelectable && !isReady && lastUpdateTime && (
          <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full shadow-sm border border-yellow-300 whitespace-nowrap">
            <svg className="w-3.5 h-3.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-semibold">{getRelativeTime(lastUpdateTime)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

