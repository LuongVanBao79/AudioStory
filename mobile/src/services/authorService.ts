import axiosClient from "../api/axiosClient";
import { Author, Book } from "../types";

export interface AuthorDetail extends Author {
  books: Book[];
  bookCount: number;
}

export const authorService = {
  getAuthors: async (): Promise<Author[]> => {
    const res = await axiosClient.get("/authors");
    return res.data.data;
  },

  getAuthorById: async (id: string): Promise<AuthorDetail> => {
    const res = await axiosClient.get(`/authors/${id}`);
    return res.data.data;
  },
};
