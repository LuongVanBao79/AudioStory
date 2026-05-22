// src/stores/useUserStore.ts
import { create } from "zustand";
import type { User, UserFormData } from "@/types/user";
import { userService } from "@/services/userService";

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (data: UserFormData) => Promise<void>;
  updateUser: (id: string, data: UserFormData) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await userService.getAll();
      set({ users: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || "Lỗi tải dữ liệu", isLoading: false });
    }
  },

  createUser: async (data: UserFormData) => {
    try {
      const result = await userService.create(data);
      set((state) => ({ users: [result.user, ...state.users] }));
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (id: string, data: UserFormData) => {
    try {
      const result = await userService.update(id, data);
      set((state) => ({
        users: state.users.map((u) => (u._id === id ? result.user : u)),
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    try {
      await userService.delete(id);
      set((state) => ({
        users: state.users.filter((u) => u._id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },

  toggleUserStatus: async (id: string) => {
    try {
      const result = await userService.toggleStatus(id);
      set((state) => ({
        users: state.users.map((u) => (u._id === id ? result.user : u)),
      }));
    } catch (error) {
      throw error;
    }
  },
}));
