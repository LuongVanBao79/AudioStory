import axiosClient from "../api/axiosClient";
import { Book, FavoriteToggleResponse } from "../types";

export const favoriteService = {
  getMyFavorites: async (): Promise<Book[]> => {
    const res = await axiosClient.get("/favorites");
    return res.data.data;
  },

  checkFavorite: async (bookId: string): Promise<boolean> => {
    const res = await axiosClient.get(`/favorites/check/${bookId}`);
    return res.data.isFavorite;
  },

  toggleFavorite: async (bookId: string): Promise<FavoriteToggleResponse> => {
    const res = await axiosClient.post(`/favorites/${bookId}`);
    return res.data;
  },
};
