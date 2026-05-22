import { create } from "zustand";
import type {
  Category,
  CategoryDetail,
  CategoryFormData,
} from "@/types/category";
import { categoryService } from "@/services/categoryServices";

interface CategoryState {
  categories: Category[];
  currentCategory: CategoryDetail | null;
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: string) => Promise<void>;
  createCategory: (data: CategoryFormData) => Promise<void>;
  updateCategory: (id: string, data: CategoryFormData) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const data = await categoryService.getAll();
      set({ categories: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Lỗi tải danh mục",
        isLoading: false,
      });
    }
  },

  // Dùng cho CategoryDetailPage
  fetchCategoryById: async (id: string) => {
    set({ isLoading: true, error: null, currentCategory: null });
    try {
      const data = await categoryService.getById(id);
      set({ currentCategory: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Lỗi tải chi tiết danh mục",
        isLoading: false,
      });
    }
  },

  createCategory: async (data: CategoryFormData) => {
    try {
      const result = await categoryService.create(data);
      set((state) => ({
        categories: [result.category, ...state.categories],
      }));
    } catch (error) {
      throw error;
    }
  },

  updateCategory: async (id: string, data: CategoryFormData) => {
    try {
      const result = await categoryService.update(id, data);
      set((state) => ({
        categories: state.categories.map((cat) =>
          cat._id === id
            ? { ...cat, ...result.category } // giữ bookCount từ aggregate
            : cat,
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    try {
      await categoryService.delete(id);
      set((state) => ({
        categories: state.categories.filter((cat) => cat._id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },
}));
