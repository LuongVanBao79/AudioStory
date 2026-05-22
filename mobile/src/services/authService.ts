import axiosClient from "../api/axiosClient";
import * as SecureStore from "expo-secure-store";
import {
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  AuthUser,
} from "../types";

export const authService = {
  register: async (payload: RegisterPayload): Promise<{ message: string }> => {
    const res = await axiosClient.post("/auth/register", {
      ...payload,
      clientType: "mobile",
    });
    return res.data;
  },

  login: async (
    payload: LoginPayload,
  ): Promise<{
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }> => {
    const res = await axiosClient.post("/auth/login", {
      ...payload,
      clientType: "mobile",
    });

    // Lưu token vào SecureStore ngay sau khi login
    await SecureStore.setItemAsync("accessToken", res.data.accessToken);
    await SecureStore.setItemAsync("refreshToken", res.data.refreshToken);

    return res.data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post("/auth/logout");
    // Xoá token khỏi máy
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
  },

  getProfile: async (): Promise<AuthUser> => {
    const res = await axiosClient.get("/auth/profile");
    return res.data.user;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<AuthUser> => {
    const res = await axiosClient.put("/auth/profile", payload);
    return res.data.user;
  },

  changePassword: async (
    payload: ChangePasswordPayload,
  ): Promise<{ message: string }> => {
    const res = await axiosClient.patch("/auth/change-password", payload);
    return res.data;
  },

  // Kiểm tra còn token không → dùng khi app khởi động
  getStoredTokens: async (): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> => {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync("accessToken"),
      SecureStore.getItemAsync("refreshToken"),
    ]);
    return { accessToken, refreshToken };
  },
};
