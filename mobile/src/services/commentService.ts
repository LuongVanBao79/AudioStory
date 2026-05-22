import axiosClient from "../api/axiosClient";
import { Comment, CreateCommentPayload, PaginatedResponse } from "../types";

export const commentService = {
  getCommentsByChapter: async (
    chapterId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Comment>> => {
    const res = await axiosClient.get(`/comments/chapter/${chapterId}`, {
      params: { page, limit },
    });
    return res.data;
  },

  createComment: async (payload: CreateCommentPayload): Promise<Comment> => {
    const res = await axiosClient.post("/comments", payload);
    return res.data.data;
  },

  updateComment: async (id: string, content: string): Promise<Comment> => {
    const res = await axiosClient.put(`/comments/${id}`, { content });
    return res.data.data;
  },

  deleteComment: async (id: string): Promise<void> => {
    await axiosClient.delete(`/comments/${id}`);
  },

  reportComment: async (id: string): Promise<{ reportCount: number }> => {
    const res = await axiosClient.patch(`/comments/${id}/report`);
    return res.data;
  },
};
