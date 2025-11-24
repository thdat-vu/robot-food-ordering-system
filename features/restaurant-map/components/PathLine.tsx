"use client";

import React from "react";
import { Position } from "../types";

interface PathLineProps {
  start?: Position;
  end?: Position;
  pathPoints?: Position[];
  color?: "primary" | "danger" | "success";
  aisleX?: number;
  corridorY?: number;
  mode?: "aisle" | "aisle-mid" | "aisle-top" | "aisle-bottom";
}

export const PathLine: React.FC<PathLineProps> = ({
  start,
  end,
  pathPoints,
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
  const colorHexMap: Record<string, string> = {
    primary: "#3b82f6",
    danger: "#ef4444",
    success: "#22c55e",
  };
  const lineColor = colorHexMap[color] ?? colorHexMap.primary;
  const arrowColor = "#b91c1c"; // Deep red for consistency with route color
  type Pt = { x: number; y: number };

  const waypoints: Pt[] = [];

  if (pathPoints && pathPoints.length >= 2) {
    pathPoints.forEach((pt) => waypoints.push({ x: pt.x, y: pt.y }));
  } else if (start && end) {
    waypoints.push({ x: start.x, y: start.y });
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
  }

  if (waypoints.length < 2) {
    return null;
  }

  const segments: Array<{ a: Pt; b: Pt }> = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    segments.push({ a: waypoints[i], b: waypoints[i + 1] });
  }

  const mergedSegments: Array<{ a: Pt; b: Pt }> = [];
  const isHorizontal = (segment: { a: Pt; b: Pt }) => segment.a.y === segment.b.y;

  segments.forEach((segment) => {
    const last = mergedSegments[mergedSegments.length - 1];
    if (
      last &&
      isHorizontal(last) === isHorizontal(segment) &&
      ((isHorizontal(segment) && last.b.y === segment.a.y && last.b.x === segment.a.x) ||
        (!isHorizontal(segment) && last.b.x === segment.a.x && last.b.y === segment.a.y))
    ) {
      last.b = segment.b;
    } else {
      mergedSegments.push({ ...segment });
    }
  });

  const renderSegments = mergedSegments.length > 0 ? mergedSegments : segments;

  const getSegmentLength = (segment: { a: Pt; b: Pt }) =>
    Math.hypot(segment.b.x - segment.a.x, segment.b.y - segment.a.y);

  const MIN_ARROW_LENGTH = 60;
  const MIN_ARROW_GAP = 110;
  let lastArrowPosition: Pt | null = null;

  return (
    <>
      {renderSegments.map((s, idx) => {
        const horizontal = s.a.y === s.b.y;
        if (horizontal) {
          const left = Math.min(s.a.x, s.b.x);
          const width = Math.abs(s.a.x - s.b.x);
          return (
            <div
              key={`h-${idx}`}
              className="absolute"
              style={{
                left: `${left}px`,
                top: `${s.a.y - 1}px`,
                width: `${width}px`,
                height: "4px",
                backgroundImage: `repeating-linear-gradient(90deg, ${lineColor}, ${lineColor} 18px, transparent 18px, transparent 32px)`,
                opacity: 0.85,
                zIndex: 5,
              }}
            />
          );
        }

        const top = Math.min(s.a.y, s.b.y);
        const height = Math.abs(s.a.y - s.b.y);
        return (
          <div
            key={`v-${idx}`}
            className="absolute"
            style={{
              left: `${s.a.x - 1}px`,
              top: `${top}px`,
              width: "4px",
              height: `${height}px`,
              backgroundImage: `repeating-linear-gradient(180deg, ${lineColor}, ${lineColor} 18px, transparent 18px, transparent 32px)`,
              opacity: 0.85,
              zIndex: 5,
            }}
          />
        );
      })}

      {renderSegments.map((s, idx) => {
        const horizontal = s.a.y === s.b.y;
        const arrowBaseStyles: React.CSSProperties = {
          position: "absolute",
          width: 0,
          height: 0,
          zIndex: 10,
        };

        const segmentLength = getSegmentLength(s);
        const distanceToLastArrow = lastArrowPosition
          ? Math.hypot(lastArrowPosition.x - s.b.x, lastArrowPosition.y - s.b.y)
          : Infinity;

        if (segmentLength < MIN_ARROW_LENGTH || distanceToLastArrow < MIN_ARROW_GAP) {
          return null;
        }

        if (horizontal) {
          const isRight = s.b.x > s.a.x;
          const arrowWidth = 18;
          const arrowHeight = 12;
          const left = isRight ? s.b.x - arrowWidth : s.b.x;
          const top = s.b.y - arrowHeight / 2;

          const style: React.CSSProperties = {
            ...arrowBaseStyles,
            left: `${left}px`,
            top: `${top}px`,
            borderTop: `${arrowHeight / 2}px solid transparent`,
            borderBottom: `${arrowHeight / 2}px solid transparent`,
            borderLeft: isRight ? `${arrowWidth}px solid ${arrowColor}` : undefined,
            borderRight: !isRight ? `${arrowWidth}px solid ${arrowColor}` : undefined,
          };

          lastArrowPosition = { ...s.b };
          return <div key={`arrow-${idx}`} style={style} />;
        } else {
          const isDown = s.b.y > s.a.y;
          const arrowWidth = 12;
          const arrowHeight = 18;
          const left = s.b.x - arrowWidth / 2;
          const top = isDown ? s.b.y - arrowHeight : s.b.y;

          const style: React.CSSProperties = {
            ...arrowBaseStyles,
            left: `${left}px`,
            top: `${top}px`,
            borderLeft: `${arrowWidth / 2}px solid transparent`,
            borderRight: `${arrowWidth / 2}px solid transparent`,
            borderTop: isDown ? `${arrowHeight}px solid ${arrowColor}` : undefined,
            borderBottom: !isDown ? `${arrowHeight}px solid ${arrowColor}` : undefined,
          };

          lastArrowPosition = { ...s.b };
          return <div key={`arrow-${idx}`} style={style} />;
        }
      })}

      {start && (
        <div
          className={`absolute w-3 h-3 ${colorClass} rounded-full animate-ping opacity-70 border border-white`}
          style={{ left: `${start.x - 1.5}px`, top: `${start.y - 1.5}px`, zIndex: 6 }}
        />
      )}
      {waypoints.slice(1, -1).map((p, i) => (
        <div
          key={`corner-${i}`}
          className={`absolute w-2 h-2 ${colorClass} rounded-full opacity-90`}
          style={{ left: `${p.x - 1}px`, top: `${p.y - 1}px`, zIndex: 6 }}
        />
      ))}
      {end && (
        <div
          className={`absolute w-3 h-3 ${colorClass} rounded-full animate-ping opacity-70 border border-white`}
          style={{ left: `${end.x - 1.5}px`, top: `${end.y - 1.5}px`, zIndex: 6 }}
        />
      )}
    </>
  );
};

