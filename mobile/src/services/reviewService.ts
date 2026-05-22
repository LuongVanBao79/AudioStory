import axiosClient from "../api/axiosClient";
import {
  Review,
  CreateReviewPayload,
  UpdateReviewPayload,
  PaginatedResponse,
} from "../types";

export const reviewService = {
  getReviewsByBook: async (
    bookId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Review>> => {
    const res = await axiosClient.get(`/reviews/book/${bookId}`, {
      params: { page, limit },
    });
    return res.data;
  },

  getMyReview: async (
    bookId: string,
  ): Promise<{
    hasReviewed: boolean;
    data: Review | null;
  }> => {
    const res = await axiosClient.get(`/reviews/my-review/${bookId}`);
    return res.data;
  },

  createReview: async (payload: CreateReviewPayload): Promise<Review> => {
    const res = await axiosClient.post("/reviews", payload);
    return res.data.data;
  },

  updateReview: async (
    id: string,
    payload: UpdateReviewPayload,
  ): Promise<Review> => {
    const res = await axiosClient.put(`/reviews/${id}`, payload);
    return res.data.data;
  },

  deleteReview: async (id: string): Promise<void> => {
    await axiosClient.delete(`/reviews/${id}`);
  },
};
