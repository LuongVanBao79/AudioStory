import axiosInstance from "@/lib/axios";
import type {
  Category,
  CategoryDetail,
  CategoryFormData,
} from "@/types/category";

export const categoryService = {
  // GET /api/categories — admin nhận thêm bookCount
  getAll: async (): Promise<Category[]> => {
    const res = await axiosInstance.get<any, { data: Category[] }>(
      "/categories",
    );
    return res.data;
  },

  // GET /api/categories/:id — trả về category + books + pagination
  getById: async (id: string): Promise<CategoryDetail> => {
    const res = await axiosInstance.get<any, { data: CategoryDetail }>(
      `/categories/${id}`,
    );
    return res.data;
  },

  // POST /api/categories
  create: async (
    data: CategoryFormData,
  ): Promise<{ message: string; category: Category }> => {
    return axiosInstance.post("/categories", data);
  },

  // PUT /api/categories/:id
  update: async (
    id: string,
    data: CategoryFormData,
  ): Promise<{ message: string; category: Category }> => {
    return axiosInstance.put(`/categories/${id}`, data);
  },

  // DELETE /api/categories/:id
  delete: async (id: string): Promise<{ message: string }> => {
    return axiosInstance.delete(`/categories/${id}`);
  },
};
