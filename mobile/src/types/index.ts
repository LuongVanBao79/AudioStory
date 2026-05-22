// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar: string;
  points: number;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ─────────────────────────────────────────────────────────────
// AUTHOR
// ─────────────────────────────────────────────────────────────
export interface Author {
  _id: string;
  name: string;
  bio?: string;
  avatarUrl: string;
}

// ─────────────────────────────────────────────────────────────
// CATEGORY
// ─────────────────────────────────────────────────────────────
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

// ─────────────────────────────────────────────────────────────
// BOOK
// ─────────────────────────────────────────────────────────────
export interface Book {
  _id: string;
  title: string;
  description?: string;
  coverImage: string;
  author: Author | null;
  category: Category | null;
  totalChapters: number;
  viewCount: number;
  listenCount: number;
  rating: number;
  isFull: boolean;
  createdAt: string;
}

// Chi tiết sách kèm danh sách chương
export interface BookDetail extends Book {
  chapters: ChapterListItem[];
}

// ─────────────────────────────────────────────────────────────
// CHAPTER
// ─────────────────────────────────────────────────────────────

// Dùng trong danh sách chương (không có content — nhẹ)
export interface ChapterListItem {
  _id: string;
  chapterNumber: number;
  title: string;
  audioUrl: string;
  duration: number;
  isUnlocked: boolean;
  createdAt: string;
}

// Dùng khi đọc/nghe chi tiết 1 chương
export interface ChapterDetail {
  _id: string;
  book: string;
  chapterNumber: number;
  title: string;
  content: string;
  audioUrl: string;
  duration: number;
  isUnlocked: boolean;
  prevChapter: ChapterNavigation | null;
  nextChapter: ChapterNavigation | null;
  createdAt: string;
}

export interface ChapterNavigation {
  _id: string;
  chapterNumber: number;
  title: string;
}

// ─────────────────────────────────────────────────────────────
// READING PROGRESS
// ─────────────────────────────────────────────────────────────
export interface ReadingProgress {
  _id: string;
  user: string;
  book: Book;
  chapter: ChapterListItem;
  audioPosition: number;
  isCompleted: boolean;
  updatedAt: string;
}

export interface SaveProgressPayload {
  audioPosition: number;
  isCompleted: boolean;
}

// ─────────────────────────────────────────────────────────────
// FAVORITE
// ─────────────────────────────────────────────────────────────
export interface FavoriteToggleResponse {
  message: string;
  isFavorite: boolean;
}

// ─────────────────────────────────────────────────────────────
// REVIEW
// ─────────────────────────────────────────────────────────────
export interface Review {
  _id: string;
  user: ReviewUser;
  book: string;
  rating: number;
  content: string;
  isHidden: boolean;
  createdAt: string;
}

export interface ReviewUser {
  _id: string;
  username: string;
  avatar: string;
}

export interface CreateReviewPayload {
  book: string;
  rating: number;
  content: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  content?: string;
}

// ─────────────────────────────────────────────────────────────
// COMMENT
// ─────────────────────────────────────────────────────────────
export interface Comment {
  _id: string;
  user: CommentUser;
  book: string;
  chapter: string;
  content: string;
  isHidden: boolean;
  isReported: boolean;
  parentComment: string | null;
  replies: Comment[];
  createdAt: string;
}

export interface CommentUser {
  _id: string;
  username: string;
  avatar: string;
  role: "user" | "admin";
}

export interface CreateCommentPayload {
  book: string;
  chapter: string;
  content: string;
  parentComment?: string;
}

// ─────────────────────────────────────────────────────────────
// API RESPONSE (wrapper chung)
// ─────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

// Thêm vào cuối file
export interface ChapterProgressItem {
  audioPosition: number; // giây
  isCompleted: boolean;
}

export interface ChapterProgressMap {
  [chapterId: string]: ChapterProgressItem;
}
