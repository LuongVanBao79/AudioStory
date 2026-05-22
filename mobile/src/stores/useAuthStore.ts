import { create } from "zustand";
import { authService } from "../services/authService";
import {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "../types";

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  isGuest: boolean;

  // Actions
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  clearError: () => void;
  continueAsGuest: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isLoggedIn: false,
  isGuest: false,

  continueAsGuest: () => {
    set({ isGuest: true, isLoggedIn: false, user: null });
  },

  // ── Đăng nhập ───────────────────────────────────────────────
  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.login(payload);
      set({ user: res.user, isLoggedIn: true, isGuest: false }); // ← thêm isGuest: false
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Đăng nhập thất bại!";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Đăng ký ─────────────────────────────────────────────────
  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(payload);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Đăng ký thất bại!";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Đăng xuất ───────────────────────────────────────────────
  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      set({ user: null, isLoggedIn: false, isGuest: true, isLoading: false });
    }
  },

  // ── Khôi phục session khi app khởi động ─────────────────────
  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const { accessToken } = await authService.getStoredTokens();
      if (!accessToken) {
        set({ isLoggedIn: false });
        return;
      }
      // Token còn → lấy profile
      const user = await authService.getProfile();
      set({ user, isLoggedIn: true });
    } catch {
      // Token hết hạn hoặc lỗi → coi như chưa đăng nhập
      set({ user: null, isLoggedIn: false });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Cập nhật profile ────────────────────────────────────────
  updateProfile: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await authService.updateProfile(payload);
      set({ user: updated });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Cập nhật thất bại!";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Đổi mật khẩu ────────────────────────────────────────────
  changePassword: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await authService.changePassword(payload);
      // Đổi mật khẩu xong → logout luôn
      await authService.logout();
      set({ user: null, isLoggedIn: false });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Đổi mật khẩu thất bại!";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
