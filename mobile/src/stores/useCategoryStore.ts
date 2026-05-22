import { create } from "zustand";
import { categoryService, CategoryDetail } from "../services/categoryService";
import { Category } from "../types";

interface CategoryStore {
  categories: Category[];
  selectedCategory: CategoryDetail | null;
  isLoading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  fetchCategoryByIdOrSlug: (idOrSlug: string, page?: number) => Promise<void>;
  fetchMoreInCategory: (idOrSlug: string, page: number) => Promise<void>;
  clearSelected: () => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await categoryService.getCategories();
      set({ categories: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải thể loại!" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCategoryByIdOrSlug: async (idOrSlug, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const data = await categoryService.getCategoryByIdOrSlug(idOrSlug, page);
      set({ selectedCategory: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải thể loại!" });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Load thêm sách trong thể loại khi scroll ─────────────────
  fetchMoreInCategory: async (idOrSlug, page) => {
    const { selectedCategory } = get();
    if (!selectedCategory?.hasMore) return;

    try {
      const data = await categoryService.getCategoryByIdOrSlug(idOrSlug, page);
      set({
        selectedCategory: {
          ...data,
          books: [...(selectedCategory?.books ?? []), ...data.books],
        },
      });
    } catch {}
  },

  clearSelected: () => set({ selectedCategory: null }),
}));
