// src/services/bookService.ts
import axiosInstance from "@/lib/axios";
import type { Book } from "@/types/book";

export interface BookParams {
  search?: string;
  category?: string;
  sort?: "newest" | "top-view" | "top-listen" | "rating";
  page?: number;
  limit?: number;
}

export interface BookResponse {
  data: Book[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export const bookService = {
  // interceptor đã unwrap → res chính là { data, total, page, totalPages, hasMore }
  getAll: async (params?: BookParams): Promise<BookResponse> => {
    const res = await axiosInstance.get("/books", { params });
    return res as unknown as BookResponse;
  },

  // interceptor đã unwrap → res chính là Book object
  getById: async (id: string): Promise<Book> => {
    const res: any = await axiosInstance.get(`/books/${id}`);
    return res.data; // ✅ res = { message, data: book } → lấy res.data
  },

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

  delete: async (id: string): Promise<{ message: string }> => {
    const data = await axiosInstance.delete<any, { message: string }>(
      `/books/${id}`,
    );
    return data;
  },
};
