"use client";

import React from "react";
import { Position } from "../types";

interface TableProps {
  id: number;
  position: Position;
  isActive: boolean;
  isReady?: boolean;
  isServed?: boolean;
  onClick?: (id: number) => void;
}

export const Table: React.FC<TableProps> = ({
  id,
  position,
  isActive,
  isReady = false,
  isServed = false,
  onClick,
}) => {
  const getTableStyle = () => {
    if (isActive) {
      return "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-200 animate-pulse";
    }
    if (isReady) {
      return "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200";
    }
    if (isServed) {
      return "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-yellow-200";
    }
    return "bg-gradient-to-br from-slate-600 to-slate-700 text-white hover:from-slate-500 hover:to-slate-600";
  };

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-300 z-10 ${
        isActive ? "scale-110" : "hover:scale-105"
      }`}
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }}
      onClick={handleClick}
    >
      <div className="relative">
        <div
          className={`w-24 h-24 rounded-2xl shadow-xl border-4 border-white flex flex-col items-center justify-center transition-all duration-300 ${getTableStyle()}`}
        >
          <div className="text-2xl mb-1">🍽️</div>
          <span className="text-xs font-bold">Bàn {id}</span>
        </div>
        {(isReady || isServed || isActive) && (
          <div
            className={`absolute -top-2 -right-2 w-5 h-5 rounded-full ${
              isActive
                ? "bg-red-500 animate-ping"
                : isReady
                ? "bg-blue-500 animate-pulse"
                : "bg-yellow-500"
            }`}
          />
        )}
      </div>
    </div>
  );
};

