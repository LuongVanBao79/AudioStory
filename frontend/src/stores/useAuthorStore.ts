// src/stores/useAuthorStore.ts
import { create } from "zustand";
import type { Author } from "@/types/author";
import { authorService } from "@/services/authorServices";

interface AuthorState {
  authors: Author[];
  isLoading: boolean;
  error: string | null;
  fetchAuthors: () => Promise<void>;
  createAuthor: (formData: FormData) => Promise<void>;
  updateAuthor: (id: string, formData: FormData) => Promise<void>;
  deleteAuthor: (id: string) => Promise<void>;
}

export const useAuthorStore = create<AuthorState>((set, get) => ({
  authors: [],
  isLoading: false,
  error: null,

  fetchAuthors: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const data = await authorService.getAll();
      set({ authors: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || "Lỗi tải tác giả", isLoading: false });
    }
  },

  createAuthor: async (formData: FormData) => {
    try {
      const result = await authorService.create(formData);
      set((state) => ({ authors: [result.author, ...state.authors] }));
    } catch (error) {
      throw error;
    }
  },

  updateAuthor: async (id: string, formData: FormData) => {
    const result = await authorService.update(id, formData);
    set((state) => ({
      authors: state.authors.map((author) =>
        author._id === id
          ? { ...author, ...result.author } // ← giữ bookCount từ author cũ
          : author,
      ),
    }));
  },

  deleteAuthor: async (id: string) => {
    try {
      await authorService.delete(id);
      set((state) => ({
        authors: state.authors.filter((author) => author._id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },
}));
