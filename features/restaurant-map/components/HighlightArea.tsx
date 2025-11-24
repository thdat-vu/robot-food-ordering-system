"use client";

import React from "react";

interface HighlightAreaProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const HighlightArea: React.FC<HighlightAreaProps> = ({ x, y, width, height }) => {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width,
        height,
        transform: "translate(-50%, -50%)",
        zIndex: 1,
        boxSizing: "border-box",
      }}
    >
      <div
        className="w-full h-full rounded-2xl border-2 border-blue-400 bg-blue-400/20 shadow-lg animate-pulse"
        style={{ backdropFilter: "blur(1px)" }}
      />
    </div>
  );
};

