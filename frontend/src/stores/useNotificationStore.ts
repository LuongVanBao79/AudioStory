import { create } from "zustand";
import type { Notification } from "../types/notification";
import {
  connectSSE,
  getNotifications,
  markAsRead as markAsReadAPI,
  markAllAsRead as markAllAsReadAPI,
} from "../services/notificationServices";

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;

  // Khởi tạo: load từ DB + kết nối SSE
  init: () => () => void;

  // Thêm thông báo mới (từ SSE đẩy về)
  addNotification: (notif: Notification) => void;

  // Đánh dấu một thông báo đã đọc
  markAsRead: (id: string) => Promise<void>;

  // Đánh dấu tất cả đã đọc
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,

  // ─────────────────────────────────────────────────────────────
  // init — gọi một lần trong layout/component cha của admin
  // Trả về cleanup function để đóng SSE khi unmount
  // ─────────────────────────────────────────────────────────────
  init: () => {
    // 1. Load thông báo cũ từ DB khi admin mới mở tab
    getNotifications()
      .then((res) => {
        set({
          notifications: res.data,
          unreadCount: res.unreadCount,
        });
      })
      .catch((err) => console.error("[Notification] Lỗi load:", err));

    // 2. Kết nối SSE để nhận thông báo realtime
    const cleanup = connectSSE((newNotif) => {
      get().addNotification(newNotif);
    });

    set({ isConnected: true });

    // Trả về cleanup để component gọi khi unmount
    return () => {
      cleanup();
      set({ isConnected: false });
    };
  },

  // ─────────────────────────────────────────────────────────────
  // Thêm thông báo mới vào đầu danh sách, tăng badge
  // ─────────────────────────────────────────────────────────────
  addNotification: (notif) => {
    set((state) => ({
      notifications: [notif, ...state.notifications].slice(0, 20), // Giữ tối đa 20
      unreadCount: state.unreadCount + 1,
    }));
  },

  // ─────────────────────────────────────────────────────────────
  // Đánh dấu 1 thông báo đã đọc
  // ─────────────────────────────────────────────────────────────
  markAsRead: async (id) => {
    const notif = get().notifications.find((n) => n._id === id);
    if (!notif || notif.isRead) return;

    await markAsReadAPI(id);

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  // ─────────────────────────────────────────────────────────────
  // Đánh dấu tất cả đã đọc
  // ─────────────────────────────────────────────────────────────
  markAllAsRead: async () => {
    await markAllAsReadAPI();

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
