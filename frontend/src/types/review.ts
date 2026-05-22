// src/types/review.ts

export interface ReviewUser {
  _id: string;
  username: string;
  email?: string;
  avatar?: string;
}

export interface ReviewBook {
  _id: string;
  title: string;
}

export interface Review {
  _id: string;
  user: ReviewUser;
  book: ReviewBook;
  rating: number;
  content: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}
