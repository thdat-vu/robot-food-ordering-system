"use client";

import React from "react";
import { Position } from "../types";

interface StaffProps {
  position: Position;
  isRobotMode?: boolean;
}

export const Staff: React.FC<StaffProps> = ({ position, isRobotMode = false }) => {
  return (
    <div
      className="absolute flex items-center justify-center z-30"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative">
        <div className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center border-4 border-white ${
          isRobotMode 
            ? "bg-gradient-to-br from-purple-500 to-purple-600" 
            : "bg-gradient-to-br from-blue-500 to-blue-600"
        }`}>
          <span className="text-white text-xl">{isRobotMode ? "🤖" : "👨‍🍳"}</span>
        </div>
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs font-medium text-slate-700 bg-white/90 px-3 py-1 rounded-lg shadow-sm border">
            {isRobotMode ? "Robot" : "Nhân viên"}
          </span>
        </div>
      </div>
    </div>
  );
};

