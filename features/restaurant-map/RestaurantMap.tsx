"use client";

import React, { useMemo } from "react";
import { Staff } from "./components/Staff";
import { Table } from "./components/Table";
import { PathLine } from "./components/PathLine";
import { HighlightArea } from "./components/HighlightArea";
import { AISLE_CONFIG, TABLE_POSITIONS } from "./constants";
import { ClusterBoundingBox, Position } from "./types";

interface RestaurantMapProps {
  readyTables: number[];
  servedTables: number[];
  selectedTables: number[];
  isRobotMode?: boolean;
  onTableClick?: (tableId: number) => void;
}

interface Cluster {
  tables: number[];
  boundingBox: ClusterBoundingBox;
}

const detectClusters = (tableIds: number[]): Cluster[] => {
  if (tableIds.length === 0) return [];

  const visited = new Set<number>();
  const clusters: Cluster[] = [];

  const areAdjacent = (id1: number, id2: number) => {
    const pos1 = TABLE_POSITIONS[id1];
    const pos2 = TABLE_POSITIONS[id2];

    if (!pos1 || !pos2) return false;

    if (pos1.y === pos2.y && Math.abs(pos1.x - pos2.x) === 160) {
      return true;
    }

    if (pos1.x === pos2.x && Math.abs(pos1.y - pos2.y) === 120) {
      return true;
    }

    return false;
  };

  const findCluster = (startId: number) => {
    const cluster: number[] = [];
    const queue: number[] = [startId];
    visited.add(startId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      cluster.push(currentId);

      for (const otherId of tableIds) {
        if (!visited.has(otherId) && areAdjacent(currentId, otherId)) {
          visited.add(otherId);
          queue.push(otherId);
        }
      }
    }

    return cluster;
  };

  for (const tableId of tableIds) {
    if (!visited.has(tableId)) {
      const cluster = findCluster(tableId);
      const positions = cluster.map((id) => TABLE_POSITIONS[id]);
      const minX = Math.min(...positions.map((p) => p.x));
      const maxX = Math.max(...positions.map((p) => p.x));
      const minY = Math.min(...positions.map((p) => p.y));
      const maxY = Math.max(...positions.map((p) => p.y));
      const padding = 20;
      const tableWidth = 80;

      clusters.push({
        tables: cluster,
        boundingBox: {
          x: (minX + maxX) / 2,
          y: (minY + maxY) / 2,
          width: maxX - minX + tableWidth + padding * 2,
          height: maxY - minY + tableWidth + padding * 2,
        },
      });
    }
  }

  return clusters;
};

const getPathPropsForTable = (tableId: number) => {
  const { aisleX, corridorMid, corridorTop, corridorBottom } = AISLE_CONFIG;
  if (tableId >= 6 && tableId <= 15) {
    return { aisleX, corridorY: corridorMid, mode: "aisle-mid" as const };
  }
  if (tableId >= 1 && tableId <= 5) {
    return { aisleX, corridorY: corridorTop, mode: "aisle-top" as const };
  }
  if (tableId >= 16 && tableId <= 20) {
    return { aisleX, corridorY: corridorBottom, mode: "aisle-bottom" as const };
  }
  return { aisleX, mode: "aisle" as const };
};

export const RestaurantMap: React.FC<RestaurantMapProps> = ({
  readyTables,
  servedTables,
  selectedTables,
  isRobotMode = false,
  onTableClick,
}) => {
  const staffPosition: Position = isRobotMode ? { x: 90, y: 120 } : { x: 90, y: 300 };
  const readyClusters = useMemo(() => detectClusters(readyTables), [readyTables]);

  return (
    <div className="relative h-full w-full flex justify-center items-start">
      <div className="relative w-full max-w-[960px] aspect-[8/5] bg-white/30 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: `radial-gradient(circle at 25px 25px, #000 2px, transparent 0)`, backgroundSize: "50px 50px" }}
          />
        </div>

        {readyClusters.map((cluster, index) => (
          <HighlightArea
            key={`cluster-${index}`}
            x={cluster.boundingBox.x}
            y={cluster.boundingBox.y}
            width={cluster.boundingBox.width}
            height={cluster.boundingBox.height}
          />
        ))}

        <Staff position={staffPosition} />

        {Object.entries(TABLE_POSITIONS).map(([id, position]) => {
          const tableId = Number(id);
          const isActive = selectedTables.includes(tableId);
          const isReady = readyTables.includes(tableId) && !isActive;
          const isServed = servedTables.includes(tableId) && !isActive;

          return (
            <Table
              key={id}
              id={tableId}
              position={position}
              isActive={isActive}
              isReady={isReady}
              isServed={isServed}
              onClick={onTableClick}
            />
          );
        })}

        {selectedTables.map((tableId) => (
          <PathLine
            key={`selected-${tableId}`}
            start={staffPosition}
            end={TABLE_POSITIONS[tableId]}
            color="danger"
            {...getPathPropsForTable(tableId)}
          />
        ))}
      </div>
    </div>
  );
};

