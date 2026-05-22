// src/services/chapterService.ts
import axiosInstance from "@/lib/axios";
import type { Chapter, ChapterFormData } from "@/types/chapter";

export const chapterService = {
  // Lấy toàn bộ chương của 1 cuốn sách (Sắp xếp theo thứ tự)
  getByBook: async (bookId: string): Promise<Chapter[]> => {
    // Đổi tên biến thành res cho dễ phân biệt
    const res: any = await axiosInstance.get(`/chapters/book/${bookId}`);

    // Bóc lấy mảng 'data' bên trong object response
    return res.data;
  },

  // Thêm chương mới (Backend sẽ tự động gọi AI tạo Audio)
  create: async (
    formData: ChapterFormData,
  ): Promise<{ message: string; chapter: Chapter }> => {
    const data = await axiosInstance.post<
      any,
      { message: string; chapter: Chapter }
    >("/chapters", formData);
    return data;
  },

  // Cập nhật chương (Nếu nội dung đổi, Backend sẽ tự gọi AI đọc lại và xoá file cũ)
  update: async (
    id: string,
    formData: Partial<ChapterFormData>,
  ): Promise<{ message: string; chapter: Chapter }> => {
    const data = await axiosInstance.put<
      any,
      { message: string; chapter: Chapter }
    >(`/chapters/${id}`, formData);
    return data;
  },

  // Xoá chương (Kéo theo việc xoá file Audio trên Cloudinary)
  delete: async (id: string): Promise<{ message: string }> => {
    const data = await axiosInstance.delete<any, { message: string }>(
      `/chapters/${id}`,
    );
    return data;
  },
};
