"use client";

import React, { useMemo, useState } from "react";
import { Staff } from "./components/Staff";
import { Table } from "./components/Table";
import { PathLine } from "./components/PathLine";
import { HighlightArea } from "./components/HighlightArea";
import { TableInfoCard } from "./components/TableInfoCard";
import { ROW_ENTRY_Y, TABLE_POSITIONS } from "./constants";
import { ClusterBoundingBox, Position } from "./types";
import { computeOptimizedPath } from "./pathfinding";

interface Dish {
  id?: string;
  name?: string;
  tableNumber: number;
  status: string;
  orderTime?: string;
  createdTime?: string;
  quantity?: number;
}

interface RestaurantMapProps {
  readyTables: number[];
  servedTables: number[];
  selectedTables: number[];
  tableSequence?: number[];
  isRobotMode?: boolean;
  onTableClick?: (tableId: number) => void;
  dishes?: Dish[]; // Add dishes prop for table stats
  tableLastUpdateTimes?: Record<number, string | null>; // Map tableNumber -> lastOrderUpdatedTime from API
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

const ROBOT_WALKWAY_X = 90;
const ROBOT_ROW_ENTRIES = [ROW_ENTRY_Y[0], ROW_ENTRY_Y[1], ROW_ENTRY_Y[2], ROW_ENTRY_Y[3]];
const TABLE_ROW_Y = [TABLE_POSITIONS[1].y, TABLE_POSITIONS[6].y, TABLE_POSITIONS[11].y, TABLE_POSITIONS[16].y];

const dedupePoints = (points: Position[]): Position[] => {
  return points.filter((point, index, arr) => {
    if (index === 0) return true;
    const prev = arr[index - 1];
    return prev.x !== point.x || prev.y !== point.y;
  });
};

const buildHumanPathSegments = (sequence: number[], start: Position) => {
  const segments: Array<{ tableId: number; path: Position[]; start: Position; end: Position }> = [];
  let currentStart: Position = start;

  sequence.forEach((tableId) => {
    const tablePosition = TABLE_POSITIONS[tableId];
    if (!tablePosition) return;
    const path = computeOptimizedPath(currentStart, tableId);
    if (path.length >= 2) {
      segments.push({
        tableId,
        path,
        start: currentStart,
        end: tablePosition,
      });
      currentStart = tablePosition;
    }
  });

  return segments;
};

const getRowEntryY = (tableId: number) => {
  const rowIndex = Math.max(0, Math.min(3, Math.floor((tableId - 1) / 5)));
  return ROBOT_ROW_ENTRIES[rowIndex] ?? ROBOT_ROW_ENTRIES[ROBOT_ROW_ENTRIES.length - 1];
};

const getNearestRowEntryForY = (y: number) => {
  let closest = ROBOT_ROW_ENTRIES[0];
  let minDiff = Math.abs(y - closest);

  ROBOT_ROW_ENTRIES.forEach((entry) => {
    const diff = Math.abs(y - entry);
    if (diff < minDiff) {
      minDiff = diff;
      closest = entry;
    }
  });

  const fallback = ROBOT_ROW_ENTRIES[ROBOT_ROW_ENTRIES.length - 1];
  return closest ?? fallback;
};

const getRowEntryFromTableY = (y: number) => {
  let closestIdx = 0;
  let minDiff = Math.abs(y - TABLE_ROW_Y[0]);

  TABLE_ROW_Y.forEach((rowY, idx) => {
    const diff = Math.abs(y - rowY);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = idx;
    }
  });

  return ROBOT_ROW_ENTRIES[closestIdx] ?? ROBOT_ROW_ENTRIES[ROBOT_ROW_ENTRIES.length - 1];
};

const buildRobotPathSegments = (sequence: number[], start: Position) => {
  const segments: Array<{ tableId: number; path: Position[]; start: Position; end: Position }> = [];
  let current = { ...start };

  sequence.forEach((tableId) => {
    const tablePosition = TABLE_POSITIONS[tableId];
    if (!tablePosition) return;

    const rowEntryY = getRowEntryY(tableId);
    const pathPoints: Position[] = [{ ...current }];

    const pushPoint = (point: Position) => {
      const last = pathPoints[pathPoints.length - 1];
      if (!last || last.x !== point.x || last.y !== point.y) {
        pathPoints.push(point);
      }
    };

    const currentRowEntry = current.x === ROBOT_WALKWAY_X ? getNearestRowEntryForY(current.y) : getRowEntryFromTableY(current.y);

    if (current.x !== ROBOT_WALKWAY_X) {
      pushPoint({ x: current.x, y: currentRowEntry });
      pushPoint({ x: ROBOT_WALKWAY_X, y: currentRowEntry });
    } else if (pathPoints[pathPoints.length - 1].y !== currentRowEntry) {
      pushPoint({ x: ROBOT_WALKWAY_X, y: currentRowEntry });
    }

    if (pathPoints[pathPoints.length - 1].y !== rowEntryY) {
      pushPoint({ x: ROBOT_WALKWAY_X, y: rowEntryY });
    }

    pushPoint({ x: tablePosition.x, y: rowEntryY });
    pushPoint({ x: tablePosition.x, y: tablePosition.y });

    const cleanedPath = dedupePoints(pathPoints);
    segments.push({
      tableId,
      path: cleanedPath,
      start: cleanedPath[0],
      end: tablePosition,
    });

    current = { ...tablePosition };
  });

  return segments;
};

export const RestaurantMap: React.FC<RestaurantMapProps> = ({
  readyTables,
  servedTables,
  selectedTables,
  tableSequence,
  isRobotMode = false,
  onTableClick,
  dishes = [],
  tableLastUpdateTimes = {},
}) => {
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  // Move robot start point to top-left when robot mode is enabled
  const staffPosition: Position = isRobotMode ? { x: 90, y: 40 } : { x: 90, y: 300 };
  const readyClusters = useMemo(() => detectClusters(readyTables), [readyTables]);

  // Calculate table stats
  const tableStats = useMemo(() => {
    const stats: Record<number, {
      total: number;
      preparing: number;
      served: number;
      lastUpdateTime: string | null;
    }> = {};

    dishes.forEach((dish) => {
      const tableId = dish.tableNumber;
      if (!stats[tableId]) {
        stats[tableId] = {
          total: 0,
          preparing: 0,
          served: 0,
          lastUpdateTime: null,
        };
      }

      stats[tableId].total++;
      
      if (dish.status === "đang thực hiện" || dish.status === "bắt đầu phục vụ") {
        stats[tableId].preparing++;
      }
      
      if (dish.status === "đã phục vụ") {
        stats[tableId].served++;
      }
    });

    // Use lastOrderUpdatedTime from API if available, otherwise fallback to dish times
    Object.keys(stats).forEach((tableIdStr) => {
      const tableId = Number(tableIdStr);
      // Priority: API lastOrderUpdatedTime > dish times
      if (tableLastUpdateTimes[tableId]) {
        stats[tableId].lastUpdateTime = tableLastUpdateTimes[tableId];
      } else {
        // Fallback: Get latest update time from dishes
        const tableDishes = dishes.filter(d => d.tableNumber === tableId);
        const updateTimes = tableDishes
          .map(d => d.createdTime || d.orderTime)
          .filter((t): t is string => !!t);
        if (updateTimes.length > 0) {
          stats[tableId].lastUpdateTime = updateTimes.sort().reverse()[0];
        }
      }
    });

    return stats;
  }, [dishes, tableLastUpdateTimes]);

  const handleTableClick = (tableId: number) => {
    if (onTableClick) {
      onTableClick(tableId);
    }
    // Toggle table info card
    setSelectedTableId(selectedTableId === tableId ? null : tableId);
  };
  const pathSegments = useMemo(() => {
    const sequence = (tableSequence && tableSequence.length > 0 ? tableSequence : selectedTables).filter((tableId) =>
      selectedTables.includes(tableId)
    );

    if (sequence.length === 0) {
      return [];
    }

    if (isRobotMode) {
      return buildRobotPathSegments(sequence, staffPosition);
    }

    return buildHumanPathSegments(sequence, staffPosition);
  }, [tableSequence, selectedTables, staffPosition, isRobotMode]);

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

        <Staff position={staffPosition} isRobotMode={isRobotMode} />

        {Object.entries(TABLE_POSITIONS).map(([id, position]) => {
          const tableId = Number(id);
          const isActive = selectedTables.includes(tableId);
          const isReady = readyTables.includes(tableId) && !isActive;
          const isServed = servedTables.includes(tableId) && !isActive;

          return (
            <React.Fragment key={id}>
              <Table
                id={tableId}
                position={position}
                isActive={isActive}
                isReady={isReady}
                isServed={isServed}
                onClick={handleTableClick}
              />
              {selectedTableId === tableId && tableStats[tableId] && (
                <TableInfoCard
                  tableId={tableId}
                  position={position}
                  totalDishes={tableStats[tableId].total}
                  preparingCount={tableStats[tableId].preparing}
                  servedCount={tableStats[tableId].served}
                  lastUpdateTime={tableStats[tableId].lastUpdateTime}
                  dishes={dishes.filter(d => d.tableNumber === tableId)}
                  onClose={() => setSelectedTableId(null)}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Legacy straight-line routing kept for reference
        {selectedTables.map((tableId) => (
          <PathLine
            key={`selected-${tableId}`}
            start={staffPosition}
            end={TABLE_POSITIONS[tableId]}
            color="danger"
            {...getPathPropsForTable(tableId)}
          />
        ))}
        */}

        {pathSegments.map((segment) => (
          <PathLine
            key={`selected-${segment.tableId}`}
            start={segment.start}
            end={segment.end}
            pathPoints={segment.path}
            color="danger"
          />
        ))}
      </div>
    </div>
  );
};

