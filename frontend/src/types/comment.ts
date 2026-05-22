// src/types/comment.ts

export interface CommentUser {
  _id: string;
  username: string;
  avatar?: string;
  role?: string;
}

export interface CommentBook {
  _id: string;
  title: string;
}

export interface CommentChapter {
  _id: string;
  title: string;
  chapterNumber?: number;
}

export interface CommentItem {
  _id: string;
  user: CommentUser;
  book: CommentBook;
  chapter: CommentChapter;
  content: string;
  isReported: boolean;
  isHidden: boolean;
  parentComment: string | null;
  createdAt: string;
  updatedAt: string;
}
