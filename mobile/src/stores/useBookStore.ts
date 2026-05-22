import { create } from "zustand";
import { bookService, GetBooksParams } from "../services/bookService";
import { Book, BookDetail } from "../types";

interface BookStore {
  // Danh sách
  books: Book[];
  newBooks: Book[];
  topBooks: Book[];
  total: number;
  page: number;
  hasMore: boolean;

  // Chi tiết
  selectedBook: BookDetail | null;

  // Trạng thái
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;

  // Actions
  fetchBooks: (params?: GetBooksParams) => Promise<void>;
  fetchMoreBooks: (params?: GetBooksParams) => Promise<void>;
  fetchNewBooks: (limit?: number) => Promise<void>;
  fetchTopBooks: (
    by?: "view" | "listen" | "rating",
    limit?: number,
  ) => Promise<void>;
  fetchBookById: (id: string) => Promise<void>;
  incrementView: (id: string) => Promise<void>;
  incrementListen: (id: string) => Promise<void>;
  clearSelected: () => void;
  clearError: () => void;
}

export const useBookStore = create<BookStore>((set, get) => ({
  books: [],
  newBooks: [],
  topBooks: [],
  total: 0,
  page: 1,
  hasMore: true,
  selectedBook: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,

  // ── Fetch danh sách (reset về trang 1) ──────────────────────
  fetchBooks: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await bookService.getBooks({ ...params, page: 1 });
      set({
        books: res.data,
        total: res.total,
        page: 2,
        hasMore: res.hasMore,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải danh sách sách!" });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Fetch thêm khi scroll (load more) ───────────────────────
  fetchMoreBooks: async (params = {}) => {
    const { isLoadingMore, hasMore, page, books } = get();
    if (isLoadingMore || !hasMore) return;

    set({ isLoadingMore: true });
    try {
      const res = await bookService.getBooks({ ...params, page });
      set({
        books: [...books, ...res.data],
        page: page + 1,
        hasMore: res.hasMore,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải thêm sách!" });
    } finally {
      set({ isLoadingMore: false });
    }
  },

  // ── Sách mới nhất ────────────────────────────────────────────
  fetchNewBooks: async (limit = 10) => {
    set({ isLoading: true });
    try {
      const data = await bookService.getNewBooks(limit);
      set({ newBooks: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải sách mới!" });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Sách nổi bật ─────────────────────────────────────────────
  fetchTopBooks: async (by = "view", limit = 10) => {
    set({ isLoading: true });
    try {
      const data = await bookService.getTopBooks(by, limit);
      set({ topBooks: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải sách nổi bật!" });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Chi tiết sách ────────────────────────────────────────────
  fetchBookById: async (id) => {
    set({ isLoading: true, error: null, selectedBook: null });
    try {
      const data = await bookService.getBookById(id);
      set({ selectedBook: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải chi tiết sách!" });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Tăng lượt xem/nghe (gọi fire-and-forget, không block UI) ─
  incrementView: async (id) => {
    try {
      await bookService.incrementView(id);
    } catch {}
  },

  incrementListen: async (id) => {
    try {
      await bookService.incrementListen(id);
    } catch {}
  },

  clearSelected: () => set({ selectedBook: null }),
  clearError: () => set({ error: null }),
}));
