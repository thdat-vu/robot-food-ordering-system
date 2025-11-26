import { TableActivityLog } from "@/entites/moderator/TableActivityLog";
import { getApiUrl } from "@/env.config";

// ✅ Nếu project bạn đã có type này ở chỗ khác thì import vào thay vì khai báo lại
export type PaginationParams = {
  pageNumber?: number;
  pageSize?: number;
};

// ✅ Nếu project bạn đã có type này ở chỗ khác thì import vào thay vì khai báo lại
export type PaginatedResponse<T> = {
  data?: {
    items?: T[];
    totalCount?: number;
    pageNumber?: number;
    pageSize?: number;
    totalPages?: number;
  };
  items?: T[]; // fallback nếu API trả thẳng
  totalCount?: number; // fallback nếu API trả thẳng
  message?: string;
  statusCode?: number;
};

// ✅ Import/replace đúng type Session của bạn
export type Session = any;

const API_BASE_URL = getApiUrl();

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    });
  }
  return `${API_BASE_URL}${path}${qs.toString() ? `?${qs.toString()}` : ""}`;
}

function normalizePaginated<T>(json: any): { items: T[]; totalCount: number } {
  const payload = json?.data ?? json;

  const items: T[] = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
    ? payload
    : [];

  const totalCount =
    typeof payload?.totalCount === "number"
      ? payload.totalCount
      : typeof json?.totalCount === "number"
      ? json.totalCount
      : items.length;

  return { items, totalCount };
}

export const tableService = {
  async getActivitiesBySessionId(
    sessionId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: TableActivityLog[]; totalCount: number }> {
    if (!sessionId) return { data: [], totalCount: 0 };

    const url = buildUrl(`/TableActivity/${encodeURIComponent(sessionId)}`, {
      PageNumber: page,
      PageSize: limit,
    });

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    console.log("🔍 RAW /TableActivity json:", json);

    const { items, totalCount } = normalizePaginated<any>(json);

    const normalizedItems: TableActivityLog[] = items.map((a) => ({
      ...a,
      data: a?.data ?? {},
    }));

    return { data: normalizedItems, totalCount };
  },

  async getSessionsByTableId(
    tableId: string,
    params: PaginationParams = { pageNumber: 1, pageSize: 10 }
  ): Promise<PaginatedResponse<Session>> {
    if (!tableId) {
      return { data: { items: [], totalCount: 0, pageNumber: 1, pageSize: params.pageSize ?? 10 } };
    }

    const { pageNumber = 1, pageSize = 10 } = params;

    const url = buildUrl(`/TableSession/TableId/${encodeURIComponent(tableId)}`, {
      PageNumber: pageNumber,
      PageSize: pageSize,
    });

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as PaginatedResponse<Session>;
  },

  // ✅ Endpoint của bạn đang là /Invoice/Order/{orderId}/invoice => param phải là orderId
  async getInvoiceByOrderId(orderId: string): Promise<any> {
    if (!orderId) return null;

    const url = `${API_BASE_URL}/Invoice/Order/${encodeURIComponent(orderId)}/invoice`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },
};
