// src/types/user.ts

export interface User {
  _id: string;
  username: string; // Tùy backend của bạn dùng name hay username nhé
  email: string;
  role: "admin" | "user";
  status: "active" | "banned";
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  name: string;
  email: string;
  role: string;
  password?: string;
}
