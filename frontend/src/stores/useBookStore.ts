// src/stores/useBookStore.ts
import { create } from "zustand";
import type { Book } from "@/types/book";
import { bookService } from "@/services/bookServices";
import type { BookParams } from "@/services/bookServices";

interface BookState {
  books: Book[];
  currentBook: Book | null;
  isLoading: boolean;
  error: string | null;

  // ✅ Thêm pagination state
  total: number;
  totalPages: number;
  currentPage: number;

  // ✅ fetchBooks nhận params để search/filter/phân trang
  fetchBooks: (params?: BookParams) => Promise<void>;
  fetchBookById: (id: string) => Promise<void>;
  addBook: (formData: FormData) => Promise<void>;
  updateBook: (id: string, formData: FormData) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  currentBook: null,
  isLoading: false,
  error: null,

  // ✅ Pagination init
  total: 0,
  totalPages: 1,
  currentPage: 1,

  fetchBooks: async (params?: BookParams) => {
    set({ isLoading: true, error: null });
    try {
      const res = await bookService.getAll(params);
      set({
        books: res.data ?? [], // ✅ chỉ lấy mảng sách
        total: res.total,
        totalPages: res.totalPages,
        currentPage: res.page,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message || "Lỗi tải dữ liệu sách", isLoading: false });
    }
  },

  fetchBookById: async (id: string) => {
    set({ isLoading: true, error: null, currentBook: null });
    try {
      const data = await bookService.getById(id);
      set({ currentBook: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Lỗi tải chi tiết sách",
        isLoading: false,
      });
    }
  },

  addBook: async (formData: FormData) => {
    try {
      const result = await bookService.create(formData);
      const fullBook = await bookService.getById(result.book._id);
      set((state) => ({
        books: [fullBook, ...state.books],
        total: state.total + 1,
      }));
    } catch (error) {
      throw error;
    }
  },

  updateBook: async (id: string, formData: FormData) => {
    try {
      const result = await bookService.update(id, formData);
      set((state) => ({
        books: state.books.map((book) =>
          book._id === id ? result.book : book,
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteBook: async (id: string) => {
    try {
      await bookService.delete(id);
      set((state) => ({
        books: state.books.filter((book) => book._id !== id),
        total: state.total - 1,
      }));
    } catch (error) {
      throw error;
    }
  },
}));
