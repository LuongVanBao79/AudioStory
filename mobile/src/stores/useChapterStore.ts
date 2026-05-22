import { create } from "zustand";
import { chapterService } from "../services/chapterService";
import {
  ChapterListItem,
  ChapterDetail,
  ReadingProgress,
  ChapterProgressMap, // ← thêm
} from "../types";

interface ChapterStore {
  chapters: ChapterListItem[];
  selectedChapter: ChapterDetail | null;
  progress: ReadingProgress | null;
  chapterProgressMap: ChapterProgressMap; // ← thêm
  isLoading: boolean;
  error: string | null;
  lastSavedAt: number;

  fetchChaptersByBook: (bookId: string) => Promise<void>;
  fetchChapterById: (id: string) => Promise<void>;
  saveProgress: (
    chapterId: string,
    position: number,
    isDone: boolean,
  ) => Promise<void>;
  fetchProgress: (bookId: string) => Promise<void>;
  fetchChapterProgressByBook: (bookId: string) => Promise<void>; // ← thêm
  clearChapter: () => void;
  clearError: () => void;
}

export const useChapterStore = create<ChapterStore>((set) => ({
  chapters: [],
  selectedChapter: null,
  progress: null,
  chapterProgressMap: {}, // ← thêm
  isLoading: false,
  error: null,
  lastSavedAt: 0,

  fetchChaptersByBook: async (bookId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await chapterService.getChaptersByBook(bookId);
      set({ chapters: data });
    } catch (err: any) {
      set({
        error: err.response?.data?.message ?? "Lỗi tải danh sách chương!",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchChapterById: async (id) => {
    set({ isLoading: true, error: null, selectedChapter: null });
    try {
      const data = await chapterService.getChapterById(id);
      set({ selectedChapter: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải nội dung chương!" });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Sửa — service giờ trả void, không set progress từ response
  saveProgress: async (chapterId, position, isDone) => {
    try {
      await chapterService.saveProgress(chapterId, {
        audioPosition: position,
        isCompleted: isDone,
      });
      set({ lastSavedAt: Date.now() });
    } catch {}
  },

  fetchProgress: async (bookId) => {
    try {
      const data = await chapterService.getProgress(bookId);
      set({ progress: data });
    } catch {}
  },

  // ← thêm mới
  fetchChapterProgressByBook: async (bookId) => {
    try {
      const data = await chapterService.getChapterProgressByBook(bookId);
      set({ chapterProgressMap: data });
    } catch {}
  },

  clearChapter: () =>
    set({
      selectedChapter: null,
      chapters: [],
      chapterProgressMap: {}, // ← reset luôn
    }),
  clearError: () => set({ error: null }),
}));
