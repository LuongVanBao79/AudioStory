import { create } from "zustand";
import { commentService } from "../services/commentService";
import { Comment, CreateCommentPayload } from "../types";

interface CommentStore {
  comments: Comment[];
  total: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;

  fetchComments: (chapterId: string, page?: number) => Promise<void>;
  fetchMoreComments: (chapterId: string) => Promise<void>;
  createComment: (payload: CreateCommentPayload) => Promise<void>;
  updateComment: (id: string, content: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  reportComment: (id: string) => Promise<void>;

  clearComments: () => void;
}

export const useCommentStore = create<CommentStore>((set, get) => ({
  comments: [],
  total: 0,
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,

  fetchComments: async (chapterId, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const res = await commentService.getCommentsByChapter(chapterId, page);
      set({
        comments: res.data,
        total: res.total,
        page: 2,
        hasMore: res.hasMore,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải bình luận!" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMoreComments: async (chapterId) => {
    const { hasMore, page, comments, isLoading } = get();
    if (!hasMore || isLoading) return;

    set({ isLoading: true });
    try {
      const res = await commentService.getCommentsByChapter(chapterId, page);
      set({
        comments: [...comments, ...res.data],
        page: page + 1,
        hasMore: res.hasMore,
      });
    } catch {
    } finally {
      set({ isLoading: false });
    }
  },

  createComment: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const newComment = await commentService.createComment(payload);

      set((state) => {
        // Nếu là reply → thêm vào replies của comment cha
        if (payload.parentComment) {
          return {
            comments: state.comments.map((c) =>
              c._id === payload.parentComment
                ? { ...c, replies: [...c.replies, newComment] }
                : c,
            ),
          };
        }
        // Là comment gốc → thêm lên đầu
        return {
          comments: [newComment, ...state.comments],
          total: state.total + 1,
        };
      });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Lỗi gửi bình luận!";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  updateComment: async (id, content) => {
    try {
      const updated = await commentService.updateComment(id, content);
      set((state) => ({
        comments: state.comments.map((c) => {
          if (c._id === id) return updated;
          // Kiểm tra trong replies
          return {
            ...c,
            replies: c.replies.map((r) => (r._id === id ? updated : r)),
          };
        }),
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Lỗi sửa bình luận!";
      set({ error: msg });
      throw new Error(msg);
    }
  },

  deleteComment: async (id) => {
    try {
      await commentService.deleteComment(id);
      set((state) => ({
        // Xoá comment gốc lẫn reply
        comments: state.comments
          .filter((c) => c._id !== id)
          .map((c) => ({
            ...c,
            replies: c.replies.filter((r) => r._id !== id),
          })),
        total: state.total - 1,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi xoá bình luận!" });
    }
  },

  reportComment: async (id) => {
    try {
      await commentService.reportComment(id);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Lỗi báo cáo!";
      throw new Error(msg);
    }
  },

  clearComments: () => set({ comments: [], page: 1, hasMore: true, total: 0 }),
}));
