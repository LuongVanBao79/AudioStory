// src/services/userService.ts
import axiosInstance from "@/lib/axios";
import type { User, UserFormData } from "@/types/user";

export const userService = {
  // Lấy danh sách tất cả người dùng
  getAll: async (): Promise<User[]> => {
    // Gọi API lấy dữ liệu
    const res: any = await axiosInstance.get("/users");

    // Bóc đúng thuộc tính 'data' (chứa mảng người dùng) ra để trả về
    return res.data;
  },

  // Thêm người dùng mới
  create: async (
    data: UserFormData,
  ): Promise<{ message: string; user: User }> => {
    return await axiosInstance.post<any, { message: string; user: User }>(
      "/users",
      data,
    );
  },

  // Cập nhật người dùng
  update: async (
    id: string,
    data: UserFormData,
  ): Promise<{ message: string; user: User }> => {
    return await axiosInstance.put<any, { message: string; user: User }>(
      `/users/${id}`,
      data,
    );
  },

  // Xóa người dùng
  delete: async (id: string) => {
    return await axiosInstance.delete(`/users/${id}`);
  },

  // Khoá/Mở khoá tài khoản
  toggleStatus: async (
    id: string,
  ): Promise<{ message: string; user: User }> => {
    return await axiosInstance.patch<any, { message: string; user: User }>(
      `/users/${id}/toggle-status`,
    );
  },
};
