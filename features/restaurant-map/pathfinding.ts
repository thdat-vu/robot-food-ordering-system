"use client";

import { WALKWAY_X_COORDS, WALKWAY_Y_COORDS, ROW_ENTRY_Y, TABLE_POSITIONS } from "./constants";
import { Position } from "./types";

interface NeighborEdge {
  id: string;
  cost: number;
}

interface GraphNode {
  id: string;
  position: Position;
  neighbors: NeighborEdge[];
}

interface GraphData {
  nodes: Map<string, GraphNode>;
  positionIndex: Map<string, string>;
  walkwayNodeIds: string[];
}

const distanceBetween = (a: Position, b: Position) => Math.hypot(a.x - b.x, a.y - b.y);

const buildGraph = (): GraphData => {
  const nodes = new Map<string, GraphNode>();
  const positionIndex = new Map<string, string>();
  const walkwayNodeIds: string[] = [];

  const registerNode = (id: string, position: Position) => {
    if (!nodes.has(id)) {
      nodes.set(id, { id, position, neighbors: [] });
      positionIndex.set(`${position.x}-${position.y}`, id);
    }
  };

  const connectNodes = (idA: string, idB: string) => {
    const nodeA = nodes.get(idA);
    const nodeB = nodes.get(idB);
    if (!nodeA || !nodeB) return;
    const cost = distanceBetween(nodeA.position, nodeB.position);
    nodeA.neighbors.push({ id: idB, cost });
    nodeB.neighbors.push({ id: idA, cost });
  };

  // Walkway grid nodes
  WALKWAY_X_COORDS.forEach((x) => {
    WALKWAY_Y_COORDS.forEach((y) => {
      const nodeId = `walk-${x}-${y}`;
      registerNode(nodeId, { x, y });
      walkwayNodeIds.push(nodeId);
    });
  });

  // Connect walkway horizontally
  WALKWAY_Y_COORDS.forEach((y) => {
    for (let i = 0; i < WALKWAY_X_COORDS.length - 1; i++) {
      const nodeA = `walk-${WALKWAY_X_COORDS[i]}-${y}`;
      const nodeB = `walk-${WALKWAY_X_COORDS[i + 1]}-${y}`;
      connectNodes(nodeA, nodeB);
    }
  });

  // Connect walkway vertically
  WALKWAY_X_COORDS.forEach((x) => {
    for (let i = 0; i < WALKWAY_Y_COORDS.length - 1; i++) {
      const nodeA = `walk-${x}-${WALKWAY_Y_COORDS[i]}`;
      const nodeB = `walk-${x}-${WALKWAY_Y_COORDS[i + 1]}`;
      connectNodes(nodeA, nodeB);
    }
  });

  const getAdjacentWalkwayXs = (x: number) => {
    let lower: number | undefined;
    let upper: number | undefined;

    for (const coord of WALKWAY_X_COORDS) {
      if (coord <= x) {
        lower = coord;
      }
      if (coord >= x) {
        upper = coord;
        break;
      }
    }

    return { lower, upper };
  };

  const getRowEntryY = (tableId: number) => {
    const rowIndex = Math.floor((tableId - 1) / 5);
    return ROW_ENTRY_Y[rowIndex] ?? ROW_ENTRY_Y[3];
  };

  // Table entry nodes
  Object.entries(TABLE_POSITIONS).forEach(([tableKey, position]) => {
    const tableId = Number(tableKey);
    const entryY = getRowEntryY(tableId);
    const entryId = `table-${tableId}-entry`;
    registerNode(entryId, { x: position.x, y: entryY });

    const { lower, upper } = getAdjacentWalkwayXs(position.x);
    if (typeof lower === "number") {
      const neighborId = `walk-${lower}-${entryY}`;
      connectNodes(entryId, neighborId);
    }
    if (typeof upper === "number" && upper !== lower) {
      const neighborId = `walk-${upper}-${entryY}`;
      connectNodes(entryId, neighborId);
    }

    const centerId = `table-${tableId}-center`;
    registerNode(centerId, position);
    connectNodes(entryId, centerId);
  });

  return { nodes, positionIndex, walkwayNodeIds };
};

const BASE_GRAPH = buildGraph();

const findExistingNodeId = (position: Position): string | undefined => {
  return BASE_GRAPH.positionIndex.get(`${position.x}-${position.y}`);
};

const getNearestWalkwayNodes = (position: Position, count = 2): { id: string; cost: number }[] => {
  const entries = BASE_GRAPH.walkwayNodeIds
    .map((id) => {
      const node = BASE_GRAPH.nodes.get(id);
      if (!node) return null;
      return { id, cost: distanceBetween(position, node.position) };
    })
    .filter(Boolean) as { id: string; cost: number }[];

  return entries.sort((a, b) => a.cost - b.cost).slice(0, count);
};

const runDijkstra = (
  startId: string,
  targetId: string,
  extraNodes: GraphNode[] = []
): string[] => {
  const nodeMap = new Map(BASE_GRAPH.nodes);
  extraNodes.forEach((node) => nodeMap.set(node.id, node));

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const queue: Array<{ id: string; dist: number }> = [];

  distances.set(startId, 0);
  queue.push({ id: startId, dist: 0 });

  const getNeighbors = (nodeId: string) => nodeMap.get(nodeId)?.neighbors ?? [];

  while (queue.length > 0) {
    queue.sort((a, b) => a.dist - b.dist);
    const current = queue.shift();
    if (!current || visited.has(current.id)) continue;
    visited.add(current.id);

    if (current.id === targetId) {
      break;
    }

    const neighbors = getNeighbors(current.id);
    for (const neighbor of neighbors) {
      const currentDist = distances.get(current.id) ?? Infinity;
      const tentative = currentDist + neighbor.cost;
      const neighborDist = distances.get(neighbor.id) ?? Infinity;
      if (tentative < neighborDist) {
        distances.set(neighbor.id, tentative);
        previous.set(neighbor.id, current.id);
        queue.push({ id: neighbor.id, dist: tentative });
      }
    }
  }

  if (!nodeMap.has(targetId)) {
    return [];
  }

  if (startId !== targetId && !previous.has(targetId)) {
    return [];
  }

  const path: string[] = [];
  let currentId: string | undefined = targetId;

  while (currentId) {
    path.unshift(currentId);
    if (currentId === startId) break;
    currentId = previous.get(currentId) ?? undefined;
  }

  if (path[0] !== startId) {
    path.unshift(startId);
  }

  return path;
};

const buildDynamicStartNode = (position: Position): { nodeId: string; nodes: GraphNode[] } => {
  const existingId = findExistingNodeId(position);
  if (existingId) {
    return { nodeId: existingId, nodes: [] };
  }

  const neighbors = getNearestWalkwayNodes(position, 3);
  const nodeId = `dynamic-${position.x}-${position.y}`;
  const dynamicNode: GraphNode = {
    id: nodeId,
    position,
    neighbors: neighbors.map((neighbor) => ({
      id: neighbor.id,
      cost: neighbor.cost,
    })),
  };

  return { nodeId, nodes: [dynamicNode] };
};

const getPositionById = (id: string, dynamicNodes: GraphNode[]): Position | undefined => {
  return BASE_GRAPH.nodes.get(id)?.position ?? dynamicNodes.find((node) => node.id === id)?.position;
};

export const computeOptimizedPath = (start: Position, tableId: number): Position[] => {
  const targetId = `table-${tableId}-center`;
  if (!BASE_GRAPH.nodes.has(targetId)) {
    return [];
  }

  const { nodeId, nodes } = buildDynamicStartNode(start);
  const pathIds = runDijkstra(nodeId, targetId, nodes);
  if (pathIds.length === 0) {
    return [];
  }

  const points: Position[] = [];
  pathIds.forEach((id) => {
    const position = getPositionById(id, nodes);
    if (position) {
      points.push(position);
    }
  });

  return points;
};

