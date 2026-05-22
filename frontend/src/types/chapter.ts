// src/types/chapter.ts

export interface Chapter {
  _id: string;
  book: string; // Chứa ID của cuốn sách
  chapterNumber: number;
  title: string;
  content: string;
  audioUrl?: string; // Link file mp3 trả về từ Cloudinary
  audioPublicId?: string;
  hasAudio: boolean;
  views: number;
  createdAt?: string;
  updatedAt?: string;
}

// Type dùng khi gửi form tạo/sửa chương
export interface ChapterFormData {
  book: string;
  title: string;
  content: string;
  voiceType?: string;
  refAudio?: string;
}
