import axiosClient from "../api/axiosClient";
import { AuthUser, Book, ReadingProgress } from "../types";

export const userService = {
  getMe: async (): Promise<AuthUser> => {
    const res = await axiosClient.get("/users/me");
    return res.data.data;
  },

  getMyFavorites: async (): Promise<Book[]> => {
    const res = await axiosClient.get("/users/me/favorites");
    return res.data.data;
  },

  getMyHistory: async (): Promise<ReadingProgress[]> => {
    const res = await axiosClient.get("/users/me/history");
    return res.data.data;
  },
  // src/services/userService.ts
  getMyStats: async () => {
    const res = await axiosClient.get("/users/me/stats");
    return res.data.data;
  },
};
