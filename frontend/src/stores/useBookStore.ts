// src/stores/useBookStore.ts
import { create } from "zustand";
import type { Book } from "@/types/book";
import { bookService } from "@/services/bookServices";

interface BookState {
  books: Book[];
  currentBook: Book | null;
  isLoading: boolean;
  error: string | null;
  fetchBooks: () => Promise<void>;
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

  fetchBooks: async () => {
    if (get().books.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const data = await bookService.getAll();
      set({ books: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || "Lỗi tải dữ liệu sách", isLoading: false });
    }
  },

  // THÊM HÀM NÀY:
  fetchBookById: async (id: string) => {
    set({ isLoading: true, error: null, currentBook: null }); // Reset book cũ trước khi load
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
      // 1. Tạo sách mới (kết quả trả về thiếu author)
      const result = await bookService.create(formData);

      // 2. Lấy lại chi tiết sách mới tạo để có đầy đủ object author
      const fullBook = await bookService.getById(result.book._id);

      // 3. Nối sách đầy đủ dữ liệu lên đầu bảng
      set((state) => ({ books: [fullBook, ...state.books] }));
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
      }));
    } catch (error) {
      throw error;
    }
  },
}));
