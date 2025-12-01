// Có thể đặt ở constants/reasons.ts
export const ReasonTextVI: Record<string, string> = {
    // Auto release / session
    AUTO_RELEASE_NO_ORDER_TIMEOUT: "Tự động đóng phiên do quá thời gian không có đơn hàng.",
    AUTO_RELEASE_IDLE_TIMEOUT: "Tự động đóng phiên do bàn không hoạt động quá lâu.",
    AUTO_RELEASE_QR_LOCK_TIMEOUT: "Tự động mở khóa/đóng phiên do quá thời gian giữ QR.",
  
    // Checkout / invoice
    CHECKOUT_SUCCESS: "Đã thanh toán và đóng phiên thành công.",
    CHECKOUT_FAILED: "Thanh toán thất bại hoặc không thể đóng phiên.",
  
    // Moderator / system
    MODERATOR_FORCE_CLOSE: "Điều phối đóng phiên thủ công.",
    SYSTEM_CLEANUP: "Hệ thống đóng phiên để dọn dẹp trạng thái.",
  
    // Customer left / cancel
    CUSTOMER_LEFT: "Khách rời đi, phiên được đóng.",
    CANCELLED_BY_SYSTEM: "Hệ thống hủy theo quy tắc vận hành.",
  
    // Fallback (không cần khai báo ở đây)
  };

  