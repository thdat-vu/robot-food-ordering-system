import { Position } from "./types";

/**
 * Fallback/Default table positions khi chưa load được từ API
 * Grid: 5 cột × 4 hàng
 * X: 160, 320, 480, 640, 800 (khoảng cách 160px)
 * Y: 120, 240, 360, 480 (khoảng cách 120px)
 */
export const DEFAULT_TABLE_POSITIONS: Record<number, Position> = {
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

/**
 * @deprecated Sử dụng useTablePositionsWithFallback() thay thế
 * Giữ lại để tương thích ngược với code cũ
 */
export const TABLE_POSITIONS = DEFAULT_TABLE_POSITIONS;

export const AISLE_CONFIG = {
  aisleX: 50,
  corridorMid: 300,
  corridorTop: 60,
  corridorBottom: 540,
};

export const WALKWAY_X_COORDS = [90, 240, 400, 560, 720, 880];
export const WALKWAY_Y_COORDS = [60, 180, 300, 420, 540];

export const ROW_ENTRY_Y: Record<number, number> = {
  0: 60,
  1: 180,
  2: 300,
  3: 420,
};

