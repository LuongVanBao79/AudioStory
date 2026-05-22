// src/constants/mockData.ts

export const CATEGORIES = [
  { id: "1", name: "Tiên Hiệp" },
  { id: "2", name: "Trinh Thám" },
  { id: "3", name: "Kỹ Năng Sống" },
  { id: "4", name: "Tình Cảm" },
];

export const BOOKS = [
  {
    id: "b1",
    title: "Sherlock Holmes Toàn Tập",
    author: "Arthur Conan Doyle",
    category: "Trinh Thám",
    coverImage: "https://picsum.photos/seed/sherlock/200/300", // Dùng ảnh placeholder tạm thời
    views: 15420,
    rating: 4.8,
    description: "Tuyển tập các vụ án của vị thám tử tài ba Sherlock Holmes...",
  },
  {
    id: "b2",
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    category: "Kỹ Năng Sống",
    coverImage: "https://picsum.photos/seed/dacnhantam/200/300",
    views: 28000,
    rating: 4.9,
    description: "Nghệ thuật thu phục lòng người...",
  },
  {
    id: "b3",
    title: "Phàm Nhân Tu Tiên",
    author: "Vong Ngữ",
    category: "Tiên Hiệp",
    coverImage: "https://picsum.photos/seed/phamnhan/200/300",
    views: 89000,
    rating: 4.7,
    description:
      "Câu chuyện về một sinh mệnh bình thường bước lên con đường tu tiên...",
  },
];
