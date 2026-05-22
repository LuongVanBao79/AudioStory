// src/services/authorService.ts
import axiosInstance from "@/lib/axios";
import type { Author } from "@/types/author";

export const authorService = {
  // Lấy danh sách
  getAll: async (): Promise<Author[]> => {
    const res = await axiosInstance.get<any, { data: Author[] }>("/authors");
    return res.data;
  },

  // THÊM MỚI (Có kèm ảnh)
  create: async (
    formData: FormData,
  ): Promise<{ message: string; author: Author }> => {
    const data = await axiosInstance.post<
      any,
      { message: string; author: Author }
    >("/authors", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // CẬP NHẬT (Có thể kèm ảnh mới)
  update: async (
    id: string,
    formData: FormData,
  ): Promise<{ message: string; author: Author }> => {
    const data = await axiosInstance.put<
      any,
      { message: string; author: Author }
    >(`/authors/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // XOÁ
  delete: async (id: string): Promise<{ message: string }> => {
    const data = await axiosInstance.delete<any, { message: string }>(
      `/authors/${id}`,
    );
    return data;
  },
};
