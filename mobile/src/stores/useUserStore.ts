import { create } from "zustand";
import { userService } from "../services/userService";
import { AuthUser, Book, ReadingProgress } from "../types";
import { useAuthStore } from "./useAuthStore";

interface UserStore {
  profile: AuthUser | null;
  favorites: Book[];
  history: ReadingProgress[];
  isLoading: boolean;
  error: string | null;

  fetchMe: () => Promise<void>;
  fetchMyFavorites: () => Promise<void>;
  fetchMyHistory: () => Promise<void>;
  clearError: () => void;
  updateAvatar: (uri: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  favorites: [],
  history: [],
  isLoading: false,
  error: null,

  fetchMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await userService.getMe();
      set({ profile: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải profile!" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyFavorites: async () => {
    set({ isLoading: true });
    try {
      const data = await userService.getMyFavorites();
      set({ favorites: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải yêu thích!" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyHistory: async () => {
    set({ isLoading: true });
    try {
      const data = await userService.getMyHistory();
      set({ history: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải lịch sử!" });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  updateAvatar: async (uri: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.updateAvatar(uri);

      // 1. Lấy cục dữ liệu user hiện tại đang chạy ở Frontend (đang có trường 'name' chuẩn)
      const currentUser = useAuthStore.getState().user;

      // 2. TRỘN DỮ LIỆU: Giữ lại dữ liệu cũ và chỉ đè dữ liệu mới từ backend lên
      const formattedUser = {
        ...currentUser, // Giữ lại toàn bộ các trường ở frontend (bao gồm cả trường 'name')
        ...updatedUser, // Cập nhật các trường mới từ backend trả về (như link 'avatar' mới)
      };

      // 3. Cập nhật dữ liệu đã trộn này vào các store
      set({ profile: formattedUser as any });
      useAuthStore.setState({ user: formattedUser });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi cập nhật ảnh!" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
