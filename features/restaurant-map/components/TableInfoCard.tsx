"use client";

import React from "react";
import { ChefHat, User, Clock } from "lucide-react";
import { Position } from "../types";

interface Dish {
  id?: string;
  name?: string;
  tableNumber: number;
  status: string;
  orderTime?: string;
  createdTime?: string;
  readyTime?: string;
  servedTime?: string;
  quantity?: number;
  sizeName?: string;
}

interface TableInfoCardProps {
  tableId: number;
  position: Position;
  totalDishes: number;
  preparingCount: number;
  servedCount: number;
  lastUpdateTime?: string | null;
  dishes?: Dish[];
  onClose: () => void;
}

export const TableInfoCard: React.FC<TableInfoCardProps> = ({
  tableId,
  position,
  totalDishes,
  preparingCount,
  servedCount,
  lastUpdateTime,
  dishes = [],
  onClose,
}) => {
  // Parse time string và trả về Date object (ưu tiên dd/MM/yyyy HH:mm:ss)
  const parseTime = (timeStr?: string | null): Date | null => {
    if (!timeStr) return null;
    try {
      // Thử parse format "dd/MM/yyyy HH:mm:ss" trước để tránh nhầm với MM/dd
      const parts = timeStr.split(" ");
      if (parts.length >= 2) {
        const [datePart, timePart] = parts;
        const [day, month, year] = datePart.split("/").map(Number);
        const [hour, minute, second] = timePart.split(":").map(Number);
        if ([day, month, year, hour, minute, second].every((v) => !isNaN(v))) {
          const parsedDate = new Date(year, month - 1, day, hour, minute, second);
          if (!isNaN(parsedDate.getTime())) return parsedDate;
        }
      }

      // Fallback: để Date tự parse nếu format khác
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) return date;
    } catch {
      // Ignore
    }
    return null;
  };

  // Tính thời gian "X giờ trước" và format HH:mm:ss
  const getTimeDisplay = (timeStr?: string | null): { timeAgo: string; time: string } => {
    const date = parseTime(timeStr);
    if (!date) {
      return { timeAgo: "", time: "—" };
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    let timeAgo = "";
    if (diffSeconds < 60) {
      timeAgo = "Vừa xong";
    } else if (diffMinutes < 60) {
      timeAgo = `${diffMinutes} phút trước`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} giờ trước`;
    } else {
      timeAgo = `${diffDays} ngày trước`;
    }
    
    // Format HH:mm:ss
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const time = `${hours}:${minutes}:${seconds}`;
    
    return { timeAgo, time };
  };

  const timeDisplay = getTimeDisplay(lastUpdateTime);
  
  // Phân loại món: chưa xong và đã xong
  const unservedDishes = dishes.filter(d => d.status !== "đã phục vụ");
  const servedDishes = dishes.filter(d => d.status === "đã phục vụ");
  
  // Format time string to show only time (HH:mm:ss) - remove date
  const formatTimeOnly = (timeStr?: string | null): string => {
    if (!timeStr) return '';
    
    // Try parsing format: "HH:mm:ss dd/MM/yyyy"
    const match1 = timeStr.match(/^(\d{2}):(\d{2}):(\d{2})\s+(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match1) {
      return `${match1[1]}:${match1[2]}:${match1[3]}`;
    }
    
    // Try parsing format: "dd/MM/yyyy HH:mm:ss"
    const match2 = timeStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
    if (match2) {
      const hours = match2[4].padStart(2, '0');
      return `${hours}:${match2[5]}:${match2[6]}`;
    }
    
    // Try parsing as ISO date
    const parsed = new Date(timeStr);
    if (!Number.isNaN(parsed.getTime())) {
      const pad = (value: number) => value.toString().padStart(2, '0');
      return `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
    }
    
    return timeStr;
  };

  // Nhóm món theo tên và size, kèm thời gian
  const groupDishesByNameAndSize = (dishList: Dish[]): Array<{ name: string; sizeName?: string; count: number; status: string; time?: string }> => {
    const grouped = new Map<string, { name: string; sizeName?: string; count: number; status: string; time?: string }>();
    
    dishList.forEach(dish => {
      const name = dish.name || "Món không tên";
      const sizeName = dish.sizeName;
      const key = `${name}::${sizeName || '__NO_SIZE__'}`;
      
      // Lấy thời gian: 
      // - Nếu món đã phục vụ (status === "đã phục vụ" hoặc "Served"), ưu tiên servedTime
      // - Nếu không, ưu tiên readyTime, sau đó createdTime, cuối cùng orderTime
      const isServed = dish.status === "đã phục vụ" || dish.status === "Served";
      const time = isServed 
        ? (dish.servedTime || dish.readyTime || dish.createdTime || dish.orderTime)
        : (dish.readyTime || dish.createdTime || dish.orderTime);
      const formattedTime = formatTimeOnly(time);
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          name,
          sizeName,
          count: 0,
          status: dish.status,
          time: formattedTime
        });
      }
      const group = grouped.get(key)!;
      group.count += dish.quantity || 1;
    });
    
    return Array.from(grouped.values());
  };
  
  const groupedUnserved = groupDishesByNameAndSize(unservedDishes);
  const groupedServed = groupDishesByNameAndSize(servedDishes);
  
  // Lấy tên món với size, nếu không có thì dùng "Món không tên"
  const getDishDisplayName = (group: { name: string; sizeName?: string; count: number }): string => {
    let display = group.name;
    if (group.sizeName) {
      display += ` (${group.sizeName})`;
    }
    if (group.count > 1) {
      display += ` x${group.count}`;
    }
    return display;
  };

  // Calculate card position to ensure it stays within map bounds
  // Card dimensions: ~280px width, dynamic height based on content
  const cardWidth = 280;
  const estimatedCardHeight = 220 + (groupedUnserved.length + groupedServed.length) * 24;
  const cardHeight = estimatedCardHeight;
  const mapPadding = 32; // Padding from RestaurantMap container (p-8 = 32px)
  const tableOffset = 60; // Offset from table center
  
  // Map dimensions: max-w-[960px] with aspect-[8/5]
  // Actual width depends on container, but max is 960px
  // Height = width * 5/8 = 960 * 5/8 = 600px
  const maxMapWidth = 960;
  const maxMapHeight = 600;
  const minLeft = mapPadding;
  const maxLeft = maxMapWidth - mapPadding - cardWidth;
  const minTop = mapPadding;
  const maxTop = maxMapHeight - mapPadding - cardHeight;
  
  // Try to position card to the right of table first
  let cardLeft = position.x + tableOffset;
  let cardTop = position.y - cardHeight / 2;
  
  // If card would overflow right, try left side
  if (cardLeft > maxLeft) {
    cardLeft = position.x - cardWidth - tableOffset;
  }
  
  // If card would overflow left, center it horizontally and adjust vertically
  if (cardLeft < minLeft) {
    cardLeft = Math.max(minLeft, Math.min(maxLeft, position.x - cardWidth / 2));
    // Try above first
    cardTop = position.y - cardHeight - tableOffset;
    // If overflows top, try below
    if (cardTop < minTop) {
      cardTop = position.y + tableOffset;
    }
  }
  
  // Clamp to bounds
  cardLeft = Math.max(minLeft, Math.min(maxLeft, cardLeft));
  cardTop = Math.max(minTop, Math.min(maxTop, cardTop));

  return (
    <div
      className="absolute z-50 cursor-pointer"
      style={{
        left: `${cardLeft}px`,
        top: `${cardTop}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-2xl shadow-2xl border-2 border-purple-200 overflow-hidden min-w-[260px] max-w-[280px]">
        {/* Header with table name */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-3 relative">
          <div className="text-lg font-bold text-center">Bàn {tableId}</div>
          {/* Close button - moved inside header */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors z-10 shadow-md"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {/* Last update time - moved to top */}
          <div className="bg-purple-100 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-700 flex-shrink-0" />
            <div className="flex-1 text-xs text-purple-800">
              {timeDisplay.timeAgo ? (
                <>
                  <span className="font-semibold">{timeDisplay.timeAgo}</span>
                  {timeDisplay.time !== "—" && (
                    <span className="ml-2 font-mono">{timeDisplay.time}</span>
                  )}
                </>
              ) : (
                <span className="text-purple-600">Chưa có cập nhật</span>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-2 mb-4">
            {/* Preparing count */}
            <div className="flex-1 bg-purple-100 rounded-lg px-2 py-2 flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-purple-700 flex-shrink-0" />
              <span className="text-xs font-bold text-purple-800">
                {preparingCount}/{totalDishes}
              </span>
            </div>

            {/* Served count */}
            <div className="flex-1 bg-purple-100 rounded-lg px-2 py-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-purple-700 flex-shrink-0" />
              <span className="text-xs font-bold text-purple-800">
                {servedCount}/{totalDishes}
              </span>
            </div>
          </div>

          {/* Món chưa xong - moved to top */}
          {groupedUnserved.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-bold text-purple-800 mb-2">Món chưa xong:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {groupedUnserved.map((group, index) => (
                  <div key={`${group.name}-${group.sizeName || 'no-size'}-${index}`} className="text-xs text-gray-700 pl-2 border-l-2 border-orange-400 flex items-center justify-between gap-2">
                    <span>-{getDishDisplayName(group)}</span>
                    {group.time && (
                      <span className="text-gray-500 font-mono text-[10px] flex-shrink-0">{group.time}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Món đã xong */}
          {groupedServed.length > 0 && (
            <div>
              <div className="text-sm font-bold text-purple-800 mb-2">Món đã xong:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {groupedServed.map((group, index) => (
                  <div key={`${group.name}-${group.sizeName || 'no-size'}-${index}`} className="text-xs text-gray-600 pl-2 border-l-2 border-green-400 flex items-center justify-between gap-2">
                    <span>-{getDishDisplayName(group)}</span>
                    {group.time && (
                      <span className="text-gray-500 font-mono text-[10px] flex-shrink-0">{group.time}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Empty state */}
        {groupedUnserved.length === 0 && groupedServed.length === 0 && (
          <div className="text-xs text-gray-500 text-center py-2">
            Không có thông tin món ăn
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

