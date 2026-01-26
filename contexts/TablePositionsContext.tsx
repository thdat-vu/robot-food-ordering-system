"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import api from "@/api/api";
import { API_TABLE_V2 } from "@/api-endpoint-env";
import { Position } from "@/features/restaurant-map/types";

interface TableWithPosition {
  id: string;
  name: string;
  status: string;
  positionX: number;
  positionY: number;
}

interface TablePositionsContextType {
  /** Map từ số bàn (1, 2, 3...) đến tọa độ { x, y } */
  tablePositions: Record<number, Position>;
  /** Map từ tableId (GUID) đến số bàn */
  tableIdToNumber: Record<string, number>;
  /** Map từ số bàn đến tableId (GUID) */
  tableNumberToId: Record<number, string>;
  /** Danh sách tất cả các bàn */
  tables: TableWithPosition[];
  /** Đang loading */
  loading: boolean;
  /** Lỗi nếu có */
  error: string | null;
  /** Refresh lại dữ liệu */
  refresh: () => Promise<void>;
}

const TablePositionsContext = createContext<TablePositionsContextType | undefined>(undefined);

/**
 * Provider để cung cấp tọa độ bàn cho toàn bộ app
 */
export function TablePositionsProvider({ children }: { children: React.ReactNode }) {
  const [tables, setTables] = useState<TableWithPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`${API_TABLE_V2}?PageSize=100`);
      // API trả về { items: [...], pageNumber, totalCount, ... }
      const data = response.data?.items || response.data?.data || [];
      
      // Map response to our interface
      const tablesWithPosition: TableWithPosition[] = data.map((table: any) => ({
        id: table.id,
        name: table.name,
        status: table.status,
        positionX: table.positionX || 0,
        positionY: table.positionY || 0,
      }));
      
      console.log("[TablePositionsContext] Fetched tables:", tablesWithPosition.length);
      setTables(tablesWithPosition);
    } catch (err: any) {
      console.error("[TablePositionsContext] Error fetching tables:", err);
      setError(err?.message || "Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tables on mount
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Parse table number from table name (e.g., "Bàn 1" -> 1)
  const parseTableNumber = (name: string): number => {
    const match = name.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Default positions cho các bàn chưa có tọa độ trong DB
  const getDefaultPosition = (tableNumber: number): Position => {
    // Grid: 5 cột x 4 hàng, X: 160-800 (step 160), Y: 120-480 (step 120)
    const col = ((tableNumber - 1) % 5);
    const row = Math.floor((tableNumber - 1) / 5);
    return {
      x: 160 + col * 160,
      y: 120 + row * 120,
    };
  };

  // Computed values - CHỈ bao gồm các bàn thực sự tồn tại trong database
  const { tablePositions, tableIdToNumber, tableNumberToId } = useMemo(() => {
    const positions: Record<number, Position> = {};
    const idToNumber: Record<string, number> = {};
    const numberToId: Record<number, string> = {};

    tables.forEach((table) => {
      const tableNumber = parseTableNumber(table.name);
      if (tableNumber > 0) {
        // Nếu bàn chưa có tọa độ trong DB (x=0, y=0), dùng default position
        const hasValidPosition = table.positionX > 0 || table.positionY > 0;
        positions[tableNumber] = hasValidPosition
          ? { x: table.positionX, y: table.positionY }
          : getDefaultPosition(tableNumber);
        
        idToNumber[table.id] = tableNumber;
        numberToId[tableNumber] = table.id;
      }
    });

    return {
      tablePositions: positions,
      tableIdToNumber: idToNumber,
      tableNumberToId: numberToId,
    };
  }, [tables]);

  const value: TablePositionsContextType = {
    tablePositions,
    tableIdToNumber,
    tableNumberToId,
    tables,
    loading,
    error,
    refresh: fetchTables,
  };

  return (
    <TablePositionsContext.Provider value={value}>
      {children}
    </TablePositionsContext.Provider>
  );
}

/**
 * Hook để sử dụng table positions
 * 
 * @example
 * ```tsx
 * const { tablePositions, loading } = useTablePositions();
 * 
 * // Lấy tọa độ của bàn 1
 * const position = tablePositions[1]; // { x: 160, y: 120 }
 * ```
 */
export function useTablePositions(): TablePositionsContextType {
  const context = useContext(TablePositionsContext);
  
  if (!context) {
    throw new Error("useTablePositions must be used within a TablePositionsProvider");
  }
  
  return context;
}

/**
 * Hook để lấy tọa độ bàn với fallback về constants nếu chưa load xong
 * SAU KHI LOAD XONG, chỉ trả về các bàn thực sự tồn tại trong database
 */
export function useTablePositionsWithFallback(): Record<number, Position> {
  const context = useContext(TablePositionsContext);
  
  // Fallback positions (giống với constants.ts cũ) - CHỈ dùng khi đang loading
  const fallbackPositions: Record<number, Position> = {
    1: { x: 160, y: 120 },
    2: { x: 320, y: 120 },
    3: { x: 480, y: 120 },
    4: { x: 640, y: 120 },
    5: { x: 800, y: 120 },
    6: { x: 160, y: 240 },
    7: { x: 320, y: 240 },
    8: { x: 480, y: 240 },
    9: { x: 640, y: 240 },
    10: { x: 800, y: 240 },
    11: { x: 160, y: 360 },
    12: { x: 320, y: 360 },
    13: { x: 480, y: 360 },
    14: { x: 640, y: 360 },
    15: { x: 800, y: 360 },
    16: { x: 160, y: 480 },
    17: { x: 320, y: 480 },
    18: { x: 480, y: 480 },
    19: { x: 640, y: 480 },
    20: { x: 800, y: 480 },
  };
  
  // Nếu không có context hoặc đang loading, dùng fallback (hiện tất cả 20 bàn)
  if (!context || context.loading) {
    return fallbackPositions;
  }
  
  // SAU KHI LOAD XONG: chỉ trả về các bàn thực sự tồn tại trong database
  // Nếu API trả về 0 bàn (lỗi hoặc rỗng), vẫn dùng fallback
  if (Object.keys(context.tablePositions).length === 0) {
    return fallbackPositions;
  }
  
  return context.tablePositions;
}
