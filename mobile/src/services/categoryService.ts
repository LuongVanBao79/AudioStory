import axiosClient from "../api/axiosClient";
import { Category, Book, PaginatedResponse } from "../types";

export interface CategoryDetail extends Category {
  books: Book[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const res = await axiosClient.get("/categories");
    return res.data.data;
  },

  getCategoryByIdOrSlug: async (
    idOrSlug: string,
    page = 1,
    limit = 20,
  ): Promise<CategoryDetail> => {
    const res = await axiosClient.get(`/categories/${idOrSlug}`, {
      params: { page, limit },
    });
    return res.data.data;
  },
};
