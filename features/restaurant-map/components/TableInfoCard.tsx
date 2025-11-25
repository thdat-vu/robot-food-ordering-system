"use client";

import React from "react";
import { ChefHat, User, Clock } from "lucide-react";
import { Position } from "../types";

interface TableInfoCardProps {
  tableId: number;
  position: Position;
  totalDishes: number;
  preparingCount: number;
  servedCount: number;
  lastUpdateTime?: string | null;
  onClose: () => void;
}

export const TableInfoCard: React.FC<TableInfoCardProps> = ({
  tableId,
  position,
  totalDishes,
  preparingCount,
  servedCount,
  lastUpdateTime,
  onClose,
}) => {
  // Format thời gian update
  const formatLastUpdateTime = (timeStr?: string | null): string => {
    if (!timeStr) return "—";
    
    try {
      // Parse time string (có thể là ISO hoặc format khác)
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) {
        // Nếu không parse được, thử format "dd/MM/yyyy HH:mm:ss"
        const parts = timeStr.split(" ");
        if (parts.length >= 2) {
          const timePart = parts[1];
          return timePart || "—";
        }
        return timeStr;
      }
      
      // Format: HH:mm:ss
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return timeStr;
    }
  };

  // Tính thời gian "X phút trước"
  const getTimeAgo = (timeStr?: string | null): string => {
    if (!timeStr) return "";
    
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) {
        // Thử parse format "dd/MM/yyyy HH:mm:ss"
        const parts = timeStr.split(" ");
        if (parts.length >= 2) {
          const [datePart, timePart] = parts;
          const [day, month, year] = datePart.split("/").map(Number);
          const [hour, minute, second] = timePart.split(":").map(Number);
          const parsedDate = new Date(year, month - 1, day, hour, minute, second);
          if (!isNaN(parsedDate.getTime())) {
            const now = new Date();
            const diffMs = now.getTime() - parsedDate.getTime();
            const diffMinutes = Math.floor(diffMs / 60000);
            
            if (diffMinutes < 1) return "Vừa xong";
            if (diffMinutes < 60) return `${diffMinutes} phút trước`;
            const diffHours = Math.floor(diffMinutes / 60);
            if (diffHours < 24) return `${diffHours} giờ trước`;
            return `${Math.floor(diffHours / 24)} ngày trước`;
          }
        }
        return "";
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      
      if (diffMinutes < 1) return "Vừa xong";
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return `${Math.floor(diffHours / 24)} ngày trước`;
    } catch {
      return "";
    }
  };

  const timeAgo = getTimeAgo(lastUpdateTime);
  const formattedTime = formatLastUpdateTime(lastUpdateTime);
  const unservedCount = totalDishes - servedCount;

  // Calculate card position to ensure it stays within map bounds
  // Card dimensions: ~250px width, ~200px height
  const cardWidth = 250;
  const cardHeight = 200;
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
      <div className="relative bg-gradient-to-br from-purple-100 via-purple-50 to-orange-100 rounded-2xl shadow-2xl border-2 border-purple-200 p-4 min-w-[200px] max-w-[250px]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-10"
        >
          ×
        </button>

        {/* Table name */}
        <div className="text-lg font-bold text-purple-800 mb-2">
          Bàn {tableId}
        </div>

        {/* Total dishes */}
        <div className="text-center mb-3">
          <div className="text-4xl font-bold text-purple-700">{totalDishes}</div>
          <div className="text-sm text-purple-600 font-medium">Món ăn</div>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 mb-3">
          {/* Preparing count */}
          <div className="flex-1 bg-purple-200/50 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
            <ChefHat className="w-4 h-4 text-purple-700" />
            <span className="text-xs font-semibold text-purple-800">
              {preparingCount}/{totalDishes}
            </span>
          </div>

          {/* Served count */}
          <div className="flex-1 bg-purple-200/50 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-purple-700" />
            <span className="text-xs font-semibold text-purple-800">
              {servedCount}/{totalDishes}
            </span>
          </div>
        </div>

        {/* Last update time */}
        <div className="bg-purple-200/50 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-purple-700" />
          <div className="flex-1 text-xs text-purple-800">
            {timeAgo && (
              <span className="font-medium">{timeAgo}</span>
            )}
            {formattedTime !== "—" && (
              <span className={timeAgo ? " ml-1" : ""}>{formattedTime}</span>
            )}
            {!timeAgo && formattedTime === "—" && <span>Chưa có cập nhật</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

