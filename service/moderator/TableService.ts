import { TableActivityLog } from "@/entites/moderator/TableActivityLog";
import { getApiUrl } from "@/env.config";

/**
 * Lấy tất cả hoạt động của một phiên (session) cụ thể có phân trang.
 * @param sessionId ID của phiên cần lấy hoạt động.
 * @param page Số trang cần lấy (bắt đầu từ 1).
 * @param limit Số lượng hoạt động mỗi trang.
 * @returns Object chứa danh sách hoạt động và tổng số lượng (totalCount).
 */

const API_BASE_URL = getApiUrl();
export const tableService = {
getActivitiesBySessionId: async (
  sessionId: string,
  page: number = 1, // 👈 Thêm page
  limit: number = 10 // 👈 Thêm limit
): Promise<{ data: TableActivityLog[], totalCount: number }> => { // 👈 Thay đổi kiểu trả về
  if (!sessionId) {
    return { data: [], totalCount: 0 };
  }

  // 🎯 Thêm Query Parameters cho phân trang
  const url = `${API_BASE_URL}/TableActivity/${sessionId}?PageNumber=${page}&PageSize=${limit}`;

  const res = await fetch(url); // 👈 Sử dụng URL mới

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const json = await res.json();
  console.log("🔍 RAW /TableActivity json:", json);

  const pageData = json.data && typeof json.data === "object" ? json.data : json;

  let items: any[] = [];
  let totalCount = 0; // Khởi tạo totalCount

  if (Array.isArray(pageData.items)) {
    // ✅ Lấy items và totalCount từ phản hồi API
    items = pageData.items;
    totalCount = pageData.totalCount ?? 0; // 👈 Lấy totalCount
  } else {
    console.warn("⚠️ /TableActivity không có items array:", pageData);
    items = [];
    totalCount = 0;
  }

  // Chuẩn hoá: luôn có data là object
  const normalizedItems: TableActivityLog[] = items.map((a) => ({
    ...a,
    data: a.data ?? {},
  }));

  // 🎯 TRẢ VỀ CẤU TRÚC PHÙ HỢP CHO COMPONENT REACT
  return { 
      data: normalizedItems, 
      totalCount: totalCount 
  };
}
// ...
};