import { create } from "zustand";
import { authService } from "../services/authServices";
import type { IUser } from "@/types/auth";

// Định nghĩa khuôn mẫu cho "Bộ não" Zustand
interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean; // Dùng để hiện loading khi vừa vào web (đang check cookie)
  isLoading: boolean; // Dùng để hiện loading lúc bấm nút Đăng nhập
  error: string | null;

  // Các hành động (Actions)
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Dữ liệu mặc định ban đầu
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  isLoading: false,
  error: null,

  // Hành động: Đăng nhập
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // Sai bảo authService đi gọi API
      const response = await authService.login(credentials);

      // Thành công -> Lưu user vào store
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      // Thất bại -> Báo lỗi
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      set({ error: message, isLoading: false });
      throw error; // Ném lỗi ra để bên file Giao diện (SignInPage) bắt được và hiện Toast
    }
  },

  // Hành động: Đăng ký
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(data);
      set({ isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng ký thất bại";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Hành động: Đăng xuất
  logout: async () => {
    try {
      await authService.logout();
      // Xoá sạch dữ liệu trên giao diện
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  },

  // Hành động: Kiểm tra Cookie khi mới vào web
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await authService.checkAuth();
      set({
        user: response.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      // Cookie hết hạn hoặc chưa đăng nhập -> Đưa về trạng thái rỗng
      set({
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
    }
  },
}));
