// src/services/reviewService.ts
import axiosInstance from "@/lib/axios";
import type { Review } from "@/types/review";

export const reviewService = {
  // Lấy danh sách cho Admin
  // ─────────────────────────────────────────────────────────
  // CÁCH 1: Nếu UI của bạn HIỆN TẠI chỉ cần mỗi mảng danh sách
  // ─────────────────────────────────────────────────────────
  getAllForAdmin: async (): Promise<Review[]> => {
    // res lúc này chính là Object { data: [...], total, page, totalPages }
    const res: any = await axiosInstance.get("/reviews/admin/all");

    // Ta bóc lấy đúng thuộc tính 'data' (là cái mảng) để trả về cho UI dùng .map()
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // CÁCH 2: Nếu UI của bạn có làm NÚT BẤM CHUYỂN TRANG (Khuyên dùng sau này)
  // ─────────────────────────────────────────────────────────
  getAllForAdminWithPagination: async (page = 1, limit = 20) => {
    const res = await axiosInstance.get(
      `/reviews/admin/all?page=${page}&limit=${limit}`,
    );

    // Trả về nguyên cục để UI lấy được cả số lượng (total) để vẽ phân trang
    return res;
  },

  // Ẩn/Hiện đánh giá
  toggleHide: async (id: string) => {
    const data = await axiosInstance.patch(`/reviews/${id}/toggle-hide`);
    return data;
  },

  // Xoá đánh giá
  delete: async (id: string) => {
    const data = await axiosInstance.delete(`/reviews/${id}`);
    return data;
  },
};
