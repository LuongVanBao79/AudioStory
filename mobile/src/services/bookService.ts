import axiosClient from "../api/axiosClient";
import { Book, BookDetail, PaginatedResponse } from "../types";

export interface GetBooksParams {
  search?: string;
  category?: string;
  sort?: "newest" | "top-view" | "top-listen" | "rating";
  page?: number;
  limit?: number;
}

export const bookService = {
  getBooks: async (
    params?: GetBooksParams,
  ): Promise<PaginatedResponse<Book>> => {
    const res = await axiosClient.get("/books", { params });
    return res.data;
  },

  getNewBooks: async (limit = 10): Promise<Book[]> => {
    const res = await axiosClient.get("/books/new", { params: { limit } });
    return res.data.data;
  },

  getTopBooks: async (
    by: "view" | "listen" | "rating" = "view",
    limit = 10,
  ): Promise<Book[]> => {
    const res = await axiosClient.get("/books/top", { params: { by, limit } });
    return res.data.data;
  },

  getBookById: async (id: string): Promise<BookDetail> => {
    const res = await axiosClient.get(`/books/${id}`);
    return res.data.data;
  },

  incrementView: async (id: string): Promise<void> => {
    await axiosClient.patch(`/books/${id}/view`);
  },

  incrementListen: async (id: string): Promise<void> => {
    await axiosClient.patch(`/books/${id}/listen`);
  },
};
