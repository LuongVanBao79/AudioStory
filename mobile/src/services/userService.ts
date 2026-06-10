import { Platform } from "react-native";
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

  // Thêm hàm update avatar
  updateAvatar: async (uri: string): Promise<AuthUser> => {
    const formData = new FormData();

    // Lấy tên file từ uri
    const filename = uri.split("/").pop() || "avatar.jpg";

    // Ép kiểu cho FormData tương thích với React Native
    formData.append("avatar", {
      uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
      name: filename,
      type: "image/jpeg", // Có thể linh động lấy theo đuôi file, nhưng jpeg/jpg là an toàn nhất
    } as any);

    const res = await axiosClient.patch("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.data;
  },
};
