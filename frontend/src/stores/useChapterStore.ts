// src/stores/useChapterStore.ts
import { create } from "zustand";
import type { Chapter, ChapterFormData } from "@/types/chapter";
import { chapterService } from "@/services/chapterServices";

interface ChapterState {
  chapters: Chapter[];
  isLoading: boolean;
  isGeneratingAudio: boolean; // Trạng thái đặc biệt khi chờ AI
  error: string | null;

  fetchChaptersByBook: (bookId: string) => Promise<void>;
  createChapter: (data: ChapterFormData) => Promise<void>;
  updateChapter: (id: string, data: Partial<ChapterFormData>) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
}

export const useChapterStore = create<ChapterState>((set, get) => ({
  chapters: [],
  isLoading: false,
  isGeneratingAudio: false,
  error: null,

  // Lấy danh sách chương của 1 cuốn sách
  fetchChaptersByBook: async (bookId: string) => {
    set({ isLoading: true, error: null, chapters: [] }); // 👈 clear chapters cũ
    try {
      const data = await chapterService.getByBook(bookId);
      set({ chapters: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Lỗi tải danh sách chương",
        isLoading: false,
      });
    }
  },

  // Thêm chương (Sẽ mất thời gian chờ AI)
  createChapter: async (data: ChapterFormData) => {
    set({ isGeneratingAudio: true }); // Bật trạng thái Loading chờ AI
    try {
      const result = await chapterService.create(data);
      // Trả về thành công -> Thêm chương mới vào mảng
      set((state) => ({
        chapters: [...state.chapters, result.chapter],
        isGeneratingAudio: false,
      }));
    } catch (error) {
      set({ isGeneratingAudio: false });
      throw error;
    }
  },

  // Sửa chương (Nếu sửa chữ, cũng sẽ mất thời gian chờ AI đọc lại)
  updateChapter: async (id: string, data: Partial<ChapterFormData>) => {
    set({ isGeneratingAudio: true });
    try {
      const result = await chapterService.update(id, data);
      set((state) => ({
        chapters: state.chapters.map((chap) =>
          chap._id === id ? result.chapter : chap,
        ),
        isGeneratingAudio: false,
      }));
    } catch (error) {
      set({ isGeneratingAudio: false });
      throw error;
    }
  },

  // Xoá chương (Xoá data và file audio)
  deleteChapter: async (id: string) => {
    try {
      await chapterService.delete(id);
      set((state) => ({
        chapters: state.chapters.filter((chap) => chap._id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },
}));
