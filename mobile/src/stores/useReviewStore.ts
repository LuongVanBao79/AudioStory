import { create } from "zustand";
import { reviewService } from "../services/reviewService";
import { Review, CreateReviewPayload, UpdateReviewPayload } from "../types";

interface ReviewStore {
  reviews: Review[];
  myReview: Review | null;
  hasReviewed: boolean;
  total: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;

  fetchReviews: (bookId: string, page?: number) => Promise<void>;
  fetchMoreReviews: (bookId: string) => Promise<void>;
  fetchMyReview: (bookId: string) => Promise<void>;
  createReview: (payload: CreateReviewPayload) => Promise<void>;
  updateReview: (id: string, payload: UpdateReviewPayload) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  clearReviews: () => void;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviews: [],
  myReview: null,
  hasReviewed: false,
  total: 0,
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,

  fetchReviews: async (bookId, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const res = await reviewService.getReviewsByBook(bookId, page);
      set({
        reviews: res.data,
        total: res.total,
        page: 2,
        hasMore: res.hasMore,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi tải đánh giá!" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMoreReviews: async (bookId) => {
    const { hasMore, page, reviews, isLoading } = get();
    if (!hasMore || isLoading) return;

    set({ isLoading: true });
    try {
      const res = await reviewService.getReviewsByBook(bookId, page);
      set({
        reviews: [...reviews, ...res.data],
        page: page + 1,
        hasMore: res.hasMore,
      });
    } catch {
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyReview: async (bookId) => {
    try {
      const res = await reviewService.getMyReview(bookId);
      set({ myReview: res.data, hasReviewed: res.hasReviewed });
    } catch {}
  },

  createReview: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const newReview = await reviewService.createReview(payload);
      set((state) => ({
        reviews: [newReview, ...state.reviews],
        myReview: newReview,
        hasReviewed: true,
        total: state.total + 1,
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Lỗi gửi đánh giá!";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  updateReview: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await reviewService.updateReview(id, payload);
      set((state) => ({
        reviews: state.reviews.map((r) => (r._id === id ? updated : r)),
        myReview: updated,
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Lỗi cập nhật đánh giá!";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteReview: async (id) => {
    set({ isLoading: true });
    try {
      await reviewService.deleteReview(id);
      set((state) => ({
        reviews: state.reviews.filter((r) => r._id !== id),
        myReview: null,
        hasReviewed: false,
        total: state.total - 1,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Lỗi xoá đánh giá!" });
    } finally {
      set({ isLoading: false });
    }
  },

  clearReviews: () =>
    set({
      reviews: [],
      page: 1,
      hasMore: true,
      myReview: null,
      hasReviewed: false,
    }),
}));
