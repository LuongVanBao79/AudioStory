// src/stores/useReviewStore.ts
import { create } from "zustand";
import type { Review } from "@/types/review";
import { reviewService } from "@/services/reviewServices";

interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  fetchAdminReviews: () => Promise<void>;
  toggleHideReview: (id: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reviews: [],
  isLoading: false,
  error: null,

  fetchAdminReviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await reviewService.getAllForAdmin();
      set({ reviews: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Lỗi tải dữ liệu đánh giá",
        isLoading: false,
      });
    }
  },

  toggleHideReview: async (id: string) => {
    try {
      await reviewService.toggleHide(id);
      // Cập nhật lại UI ngay lập tức (Optimistic Update)
      set((state) => ({
        reviews: state.reviews.map((review) =>
          review._id === id
            ? { ...review, isHidden: !review.isHidden }
            : review,
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteReview: async (id: string) => {
    try {
      await reviewService.delete(id);
      // Xoá khỏi danh sách trên UI
      set((state) => ({
        reviews: state.reviews.filter((review) => review._id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },
}));
