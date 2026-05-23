import axiosInstance from "../lib/axios"; // đường dẫn tới file axios.ts của bạn
import type { Notification, NotificationResponse } from "../types/notification";

const BASE_URL = import.meta.env.VITE_API_URL;

// ─────────────────────────────────────────────────────────────
// Kết nối SSE — gọi một lần khi admin đăng nhập
// onMessage: callback nhận thông báo mới realtime
// Trả về hàm cleanup để đóng kết nối khi cần
// ─────────────────────────────────────────────────────────────
export const connectSSE = (
  onMessage: (notification: Notification) => void,
): (() => void) => {
  // withCredentials để gửi cookie auth lên server
  const eventSource = new EventSource(`${BASE_URL}/notifications/stream`, {
    withCredentials: true,
  });

  eventSource.onopen = () => {
    console.log("[SSE] Kết nối thông báo admin thành công");
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Bỏ qua event "connected" ban đầu
      if (data.type === "connected") return;
      onMessage(data as Notification);
    } catch (err) {
      console.error("[SSE] Lỗi parse message:", err);
    }
  };

  eventSource.onerror = () => {
    // Browser tự reconnect sau 3s — không cần xử lý thêm
    console.warn("[SSE] Mất kết nối, đang thử lại...");
  };

  // Trả về hàm cleanup
  return () => {
    eventSource.close();
    console.log("[SSE] Đã đóng kết nối");
  };
};

// ─────────────────────────────────────────────────────────────
// Lấy danh sách thông báo gần nhất (khi admin mới mở tab)
// ─────────────────────────────────────────────────────────────
export const getNotifications = (): Promise<NotificationResponse> => {
  return axiosInstance.get("/notifications");
};

// ─────────────────────────────────────────────────────────────
// Đánh dấu một thông báo đã đọc
// ─────────────────────────────────────────────────────────────
export const markAsRead = (id: string): Promise<void> => {
  return axiosInstance.patch(`/notifications/${id}/read`);
};

// ─────────────────────────────────────────────────────────────
// Đánh dấu tất cả thông báo đã đọc
// ─────────────────────────────────────────────────────────────
export const markAllAsRead = (): Promise<void> => {
  return axiosInstance.patch("/notifications/read-all");
};
