// src/types/author.ts

export interface Author {
  _id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  bookCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Khi gửi lên, chúng ta dùng FormData của trình duyệt để chứa cả text và file ảnh
export interface AuthorFormData {
  name: string;
  bio?: string;
  avatar?: File | null; // Có thể chọn file ảnh từ máy tính
}
