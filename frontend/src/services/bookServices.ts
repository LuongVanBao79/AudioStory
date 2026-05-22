// src/services/bookService.ts
import axiosInstance from "@/lib/axios";
import type { Book } from "@/types/book";

export const bookService = {
  // Lấy danh sách sách
  getAll: async (): Promise<Book[]> => {
    const res = await axiosInstance.get<any, { data: Book[]; total: number }>(
      "/books",
    );
    return res.data; // Unwrap đúng chỗ
  },

  getById: async (id: string): Promise<Book> => {
    // Ép kiểu về any để TypeScript không báo lỗi khi ta bóc vỏ JSON
    const response: any = await axiosInstance.get(`/books/${id}`);

    // Bóc tách cẩn thận:
    // - response.data.data (Nếu dùng axios mặc định)
    // - response.data (Nếu axiosInstance đã có sẵn interceptor)
    const bookData = response.data?.data || response.data || response;

    return bookData;
  },

  // Thêm sách mới (Dùng FormData vì có up ảnh)
  create: async (
    formData: FormData,
  ): Promise<{ message: string; book: Book }> => {
    const data = await axiosInstance.post<any, { message: string; book: Book }>(
      "/books",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  // Cập nhật sách
  update: async (
    id: string,
    formData: FormData,
  ): Promise<{ message: string; book: Book }> => {
    const data = await axiosInstance.put<any, { message: string; book: Book }>(
      `/books/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  // Xoá sách
  delete: async (id: string): Promise<{ message: string }> => {
    const data = await axiosInstance.delete<any, { message: string }>(
      `/books/${id}`,
    );
    return data;
  },
};
