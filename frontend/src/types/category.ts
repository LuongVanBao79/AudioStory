import type { Book } from "@/types/book";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  bookCount?: number; // chỉ có khi gọi getAllCategories với role admin
  createdAt?: string;
  updatedAt?: string;
}

// Shape riêng cho getCategoryById — books + pagination lồng trong data
export interface CategoryDetail extends Category {
  books: Book[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
}
