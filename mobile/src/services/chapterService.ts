import axiosClient from "../api/axiosClient";
import {
  ChapterListItem,
  ChapterDetail,
  ReadingProgress,
  SaveProgressPayload,
  ChapterProgressMap,
} from "../types";

export const chapterService = {
  getChaptersByBook: async (bookId: string): Promise<ChapterListItem[]> => {
    const res = await axiosClient.get(`/chapters/book/${bookId}`);
    return res.data.data;
  },

  getChapterById: async (id: string): Promise<ChapterDetail> => {
    const res = await axiosClient.get(`/chapters/${id}`);
    return res.data.data;
  },

  saveProgress: async (
    chapterId: string,
    payload: SaveProgressPayload,
  ): Promise<ReadingProgress> => {
    const res = await axiosClient.post(
      `/chapters/${chapterId}/progress`,
      payload,
    );
    return res.data.data;
  },

  getProgress: async (bookId: string): Promise<ReadingProgress | null> => {
    const res = await axiosClient.get(`/chapters/progress/${bookId}`);
    return res.data.data; // null nếu chưa nghe lần nào
  },

  // Thêm vào chapterService
  getChapterProgressByBook: async (
    bookId: string,
  ): Promise<ChapterProgressMap> => {
    const res = await axiosClient.get(`/chapters/chapter-progress/${bookId}`);
    return res.data.data;
  },
};
