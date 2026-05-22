// src/services/commentService.ts
import axiosInstance from "@/lib/axios";
import type { CommentItem } from "@/types/comment";

export const commentService = {
  // Lấy danh sách cho Admin
  getAllForAdmin: async (): Promise<CommentItem[]> => {
    // Gọi API, kết quả trả về là Object { data: [...], total, page, totalPages }
    const res: any = await axiosInstance.get("/comments/admin/all");

    // Bóc lấy đúng thuộc tính 'data' (là cái mảng) để trả về
    return res.data;
  },

  // Ẩn/Hiện bình luận
  toggleHide: async (id: string) => {
    const data = await axiosInstance.patch(`/comments/${id}/toggle-hide`);
    return data;
  },

  // Xoá bình luận
  delete: async (id: string) => {
    const data = await axiosInstance.delete(`/comments/${id}`);
    return data;
  },

  // SỬA HÀM NÀY: Khai báo rõ kiểu trả về cho axiosInstance.post
  reply: async (payload: {
    user: string;
    book: string;
    chapter: string;
    content: string;
    parentComment: string;
  }) => {
    const data = await axiosInstance.post<
      any,
      { message: string; comment: CommentItem }
    >("/comments", payload);
    return data;
  },
};
