"use client";

import React from "react";
import { Position } from "../types";

interface PathLineProps {
  start: Position;
  end: Position;
  color?: "primary" | "danger" | "success";
  aisleX?: number;
  corridorY?: number;
  mode?: "aisle" | "aisle-mid" | "aisle-top" | "aisle-bottom";
}

export const PathLine: React.FC<PathLineProps> = ({
  start,
  end,
  color = "primary",
  aisleX,
  corridorY,
  mode = "aisle",
}) => {
  const getColorClasses = (c: string) => {
    switch (c) {
      case "danger":
        return "bg-red-500";
      case "success":
        return "bg-green-500";
      case "primary":
      default:
        return "bg-blue-500";
    }
  };

  const colorClass = getColorClasses(color);
  type Pt = { x: number; y: number };

  const waypoints: Pt[] = [{ x: start.x, y: start.y }];
  const useAisle = typeof aisleX === "number";

  if (useAisle) {
    waypoints.push({ x: aisleX as number, y: start.y });

    if (
      (mode === "aisle-mid" || mode === "aisle-top" || mode === "aisle-bottom") &&
      typeof corridorY === "number"
    ) {
      waypoints.push({ x: aisleX as number, y: corridorY as number });
      waypoints.push({ x: end.x, y: corridorY as number });
    } else {
      waypoints.push({ x: aisleX as number, y: end.y });
    }
  } else {
    waypoints.push({ x: end.x, y: start.y });
  }

  waypoints.push({ x: end.x, y: end.y });

  const segments: Array<{ a: Pt; b: Pt }> = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    segments.push({ a: waypoints[i], b: waypoints[i + 1] });
  }

  return (
    <>
      {segments.map((s, idx) => {
        const isHorizontal = s.a.y === s.b.y;
        if (isHorizontal) {
          const left = Math.min(s.a.x, s.b.x);
          const width = Math.abs(s.a.x - s.b.x);
          return (
            <div
              key={`h-${idx}`}
              className={`absolute h-2 ${colorClass} opacity-80 animate-pulse shadow-lg rounded-full`}
              style={{ left: `${left}px`, top: `${s.a.y - 1}px`, width: `${width}px`, zIndex: 5 }}
            />
          );
        }

        const top = Math.min(s.a.y, s.b.y);
        const height = Math.abs(s.a.y - s.b.y);
        return (
          <div
            key={`v-${idx}`}
            className={`absolute w-2 ${colorClass} opacity-80 animate-pulse shadow-lg rounded-full`}
            style={{ left: `${s.a.x - 1}px`, top: `${top}px`, height: `${height}px`, zIndex: 5 }}
          />
        );
      })}

      <div
        className={`absolute w-3 h-3 ${colorClass} rounded-full animate-ping opacity-70 border border-white`}
        style={{ left: `${start.x - 1.5}px`, top: `${start.y - 1.5}px`, zIndex: 6 }}
      />
      {waypoints.slice(1, -1).map((p, i) => (
        <div
          key={`corner-${i}`}
          className={`absolute w-2 h-2 ${colorClass} rounded-full opacity-90`}
          style={{ left: `${p.x - 1}px`, top: `${p.y - 1}px`, zIndex: 6 }}
        />
      ))}
      <div
        className={`absolute w-3 h-3 ${colorClass} rounded-full animate-ping opacity-70 border border-white`}
        style={{ left: `${end.x - 1.5}px`, top: `${end.y - 1.5}px`, zIndex: 6 }}
      />
    </>
  );
};

