// Định nghĩa cấu trúc dữ liệu của một Admin/User trả về từ Node.js
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role?: string; // Ví dụ: 'admin' hoặc 'user'
  createdAt?: string;
  updatedAt?: string;
}

// Định nghĩa cấu trúc cục data trả về khi gọi API Login thành công
export interface IAuthResponse {
  message: string;
  user: IUser;
  // Lưu ý: Chúng ta không cần khai báo 'token: string' ở đây
  // vì token sẽ được Node.js nhét ngầm qua Cookie HTTPOnly.
}
