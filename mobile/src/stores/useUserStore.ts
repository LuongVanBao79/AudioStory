import { create } from "zustand";
import { userService } from "../services/userService";
import { AuthUser, Book, ReadingProgress } from "../types";

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
}));
