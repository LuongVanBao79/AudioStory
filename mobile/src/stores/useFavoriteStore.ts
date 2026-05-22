import { create } from "zustand";
import { favoriteService } from "../services/favoriteService";
import { Book } from "../types";

interface FavoriteStore {
  favorites: Book[];
  favoriteIds: Set<string>; // Dùng để check O(1) thay vì .find()
  isLoading: boolean;
  error: string | null;

  fetchFavorites: () => Promise<void>;
  checkFavorite: (bookId: string) => Promise<void>;
  toggleFavorite: (
    bookId: string,
    onSuccess?: (isFav: boolean) => void,
  ) => Promise<void>;
  isFavorite: (bookId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  favoriteIds: new Set(),
  isLoading: false,
  error: null,

  // ── Lấy danh sách yêu thích ──────────────────────────────────
  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await favoriteService.getMyFavorites();
      set({
        favorites: data,
        favoriteIds: new Set(data.map((b) => b._id)),
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message ?? "Lỗi tải danh sách yêu thích!",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Kiểm tra 1 cuốn sách (dùng khi mở màn hình chi tiết) ─────
  checkFavorite: async (bookId) => {
    try {
      const isFav = await favoriteService.checkFavorite(bookId);
      set((state) => {
        const ids = new Set(state.favoriteIds);
        isFav ? ids.add(bookId) : ids.delete(bookId);
        return { favoriteIds: ids };
      });
    } catch {}
  },

  // ── Toggle thêm/bỏ yêu thích ─────────────────────────────────
  toggleFavorite: async (
    bookId: string,
    onSuccess?: (isFav: boolean) => void,
  ) => {
    const wasFavorite = get().favoriteIds.has(bookId);

    // Optimistic update ids
    set((state) => {
      const ids = new Set(state.favoriteIds);
      wasFavorite ? ids.delete(bookId) : ids.add(bookId);
      return { favoriteIds: ids };
    });

    try {
      await favoriteService.toggleFavorite(bookId);

      if (wasFavorite) {
        // Bỏ yêu thích → xoá khỏi list
        set((state) => ({
          favorites: state.favorites.filter((b) => b._id !== bookId),
        }));
      } else {
        // Thêm yêu thích → fetch lại để có đủ thông tin book
        const data = await favoriteService.getMyFavorites();
        set({
          favorites: data,
          favoriteIds: new Set(data.map((b) => b._id)),
        });
      }

      onSuccess?.(!wasFavorite);
    } catch {
      // Rollback
      set((state) => {
        const ids = new Set(state.favoriteIds);
        wasFavorite ? ids.add(bookId) : ids.delete(bookId);
        return { favoriteIds: ids };
      });
    }
  },

  // ── Kiểm tra nhanh không cần async ───────────────────────────
  isFavorite: (bookId) => get().favoriteIds.has(bookId),
}));
