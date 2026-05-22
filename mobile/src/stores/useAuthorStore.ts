import { create } from "zustand";
import { authorService, AuthorDetail } from "../services/authorService";
import { Author } from "../types";

interface AuthorStore {
  authors: Author[];
  selectedAuthor: AuthorDetail | null;
  isLoading: boolean;
  error: string | null;

  fetchAuthors: () => Promise<void>;
  fetchAuthorById: (id: string) => Promise<void>;
  clearSelected: () => void;
}

export const useAuthorStore = create<AuthorStore>((set) => ({
  authors: [],
  selectedAuthor: null,
  isLoading: false,
  error: null,

  fetchAuthors: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await authorService.getAuthors();
      set({ authors: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải tác giả!" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAuthorById: async (id) => {
    set({ isLoading: true, error: null, selectedAuthor: null });
    try {
      const data = await authorService.getAuthorById(id);
      set({ selectedAuthor: data });
    } catch (err: any) {
      set({
        error: err.response?.data?.message ?? "Lỗi tải chi tiết tác giả!",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  clearSelected: () => set({ selectedAuthor: null }),
}));
