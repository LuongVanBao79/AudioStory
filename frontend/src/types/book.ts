// src/types/book.ts

export interface Book {
  _id: string;
  title: string;
  author: { _id: string; name: string; avatarUrl?: string };
  category: { _id: string; name: string; slug?: string };
  description?: string;
  coverImage?: string;
  coverImagePublicId?: string;
  isFull: boolean;
  totalChapters: number;
  viewCount?: number; // ← thêm
  listenCount?: number; // ← thêm
  rating?: number; // ← thêm
  createdAt?: string;
  updatedAt?: string;
}

// Type dùng để kiểm tra Form trên Frontend
export interface BookFormData {
  title: string;
  author: string; // Gửi lên là ID
  category: string; // Gửi lên là ID
  description?: string;
  isFull: boolean;
}
