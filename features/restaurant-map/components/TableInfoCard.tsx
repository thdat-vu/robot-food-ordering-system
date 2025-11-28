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
  quantity?: number;
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
  // Parse time string và trả về Date object
  const parseTime = (timeStr?: string | null): Date | null => {
    if (!timeStr) return null;
    
    try {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      // Thử parse format "dd/MM/yyyy HH:mm:ss"
      const parts = timeStr.split(" ");
      if (parts.length >= 2) {
        const [datePart, timePart] = parts;
        const [day, month, year] = datePart.split("/").map(Number);
        const [hour, minute, second] = timePart.split(":").map(Number);
        const parsedDate = new Date(year, month - 1, day, hour, minute, second);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
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
  
  // Lấy tên món, nếu không có thì dùng "Món không tên"
  const getDishDisplayName = (dish: Dish): string => {
    if (dish.name) return dish.name;
    return "Món không tên";
  };
  
  // Format quantity
  const formatQuantity = (dish: Dish): string => {
    const qty = dish.quantity || 1;
    return qty > 1 ? ` (${qty})` : "";
  };

  // Calculate card position to ensure it stays within map bounds
  // Card dimensions: ~280px width, dynamic height based on content
  const cardWidth = 280;
  const estimatedCardHeight = 220 + (unservedDishes.length + servedDishes.length) * 24;
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
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors z-10 shadow-lg"
        >
          ×
        </button>

        {/* Header with table name */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-3">
          <div className="text-lg font-bold text-center">Bàn {tableId}</div>
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
          {unservedDishes.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-bold text-purple-800 mb-2">Món chưa xong:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {unservedDishes.map((dish, index) => (
                  <div key={dish.id || index} className="text-xs text-gray-700 pl-2 border-l-2 border-orange-400">
                    -{getDishDisplayName(dish)}{formatQuantity(dish)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Món đã xong */}
          {servedDishes.length > 0 && (
            <div>
              <div className="text-sm font-bold text-purple-800 mb-2">Món đã xong:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {servedDishes.map((dish, index) => (
                  <div key={dish.id || index} className="text-xs text-gray-600 pl-2 border-l-2 border-green-400">
                    -{getDishDisplayName(dish)}{formatQuantity(dish)}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Empty state */}
        {unservedDishes.length === 0 && servedDishes.length === 0 && (
          <div className="text-xs text-gray-500 text-center py-2">
            Không có thông tin món ăn
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

