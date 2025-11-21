// src/components/moderator/ClockCard.tsx
import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export const ClockCard = React.memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const dateStr = currentTime.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/25 backdrop-blur-xl border border-white/40 px-6 py-4 shadow-lg">
      <div className="p-3 bg-white/20 rounded-xl">
        <Clock className="w-8 h-8 text-white" />
      </div>
      <div className="text-left">
        <div className="text-2xl font-bold text-white font-mono tracking-wide">
          {timeStr}
        </div>
        <div className="text-white/75 text-xs uppercase tracking-wider">
          {dateStr}
        </div>
      </div>
    </div>
  );
});
