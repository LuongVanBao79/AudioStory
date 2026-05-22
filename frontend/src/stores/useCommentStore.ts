// src/stores/useCommentStore.ts
import { create } from "zustand";
import type { CommentItem } from "@/types/comment";
import { commentService } from "@/services/commentServices";

interface CommentState {
  comments: CommentItem[];
  isLoading: boolean;
  error: string | null;
  fetchAdminComments: () => Promise<void>;
  toggleHideComment: (id: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  replyComment: (payload: any) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  isLoading: false,
  error: null,

  fetchAdminComments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await commentService.getAllForAdmin();
      set({ comments: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || "Lỗi tải dữ liệu", isLoading: false });
    }
  },

  toggleHideComment: async (id: string) => {
    try {
      await commentService.toggleHide(id);
      set((state: CommentState) => ({
        comments: state.comments.map((comment: CommentItem) =>
          comment._id === id
            ? { ...comment, isHidden: !comment.isHidden }
            : comment,
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteComment: async (id: string) => {
    try {
      await commentService.delete(id);
      set((state: CommentState) => ({
        comments: state.comments.filter(
          (comment: CommentItem) => comment._id !== id,
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  replyComment: async (payload: any) => {
    try {
      const result = await commentService.reply(payload);
      // Nối câu trả lời mới vào đầu danh sách (để Admin thấy ngay kết quả)
      set((state: CommentState) => ({
        comments: [result.comment, ...state.comments],
      }));
    } catch (error) {
      throw error;
    }
  },
}));
