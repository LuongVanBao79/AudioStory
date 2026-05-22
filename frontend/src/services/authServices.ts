import axiosInstance from "../lib/axios";
import type { IAuthResponse, IUser } from "@/types/auth";

export const authService = {
  // Hàm gọi API Đăng nhập
  login: async (credentials: any): Promise<IAuthResponse> => {
    // Lưu ý: Đổi '/users/login' thành đúng đường dẫn API Backend Node.js của bạn
    return await axiosInstance.post("/auth/login", credentials);
  },

  // Hàm gọi API Đăng ký
  register: async (data: any): Promise<IAuthResponse> => {
    return await axiosInstance.post("/auth/register", data);
  },

  // Hàm gọi API Đăng xuất (Báo Node.js xoá Cookie)
  logout: async (): Promise<{ message: string }> => {
    return await axiosInstance.post("/auth/logout");
  },

  // Hàm kiểm tra User hiện tại (Dùng khi F5 load lại trang xem Cookie còn hạn không)
  checkAuth: async (): Promise<{ user: IUser }> => {
    return await axiosInstance.get("/auth/profile");
  },
};
