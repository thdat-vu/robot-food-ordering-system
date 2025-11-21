// src/components/moderator/StatsCard.tsx
import React from "react";

type Props = {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  highlight?: boolean;
};

export const StatsCard = ({ icon, value, label, highlight }: Props) => {
  return (
    <div
      className={`rounded-2xl px-5 py-4 text-white backdrop-blur-md border transition-all duration-300 hover:scale-105 ${
        highlight
          ? "bg-red-500/30 border-red-400/60 shadow-lg shadow-red-500/20 animate-pulse"
          : "bg-white/20 border-white/30"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-left">
          <p className="text-white/75 text-xs font-medium leading-tight">
            {label}
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              highlight ? "text-red-200" : "text-white"
            }`}
          >
            {value}
          </p>
        </div>

        {/* Truyền className trực tiếp khi dùng icon */}
        <div className="p-2.5 bg-white/15 rounded-xl">{icon}</div>
      </div>
    </div>
  );
};
