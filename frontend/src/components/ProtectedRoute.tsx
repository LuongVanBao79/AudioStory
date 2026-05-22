import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  // 1. Nếu đang gọi API kiểm tra Cookie, hiện cái icon xoay xoay mượt mà
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
      </div>
    );
  }

  // 2. Nếu check xong mà không có quyền (chưa đăng nhập) -> Đá văng ra trang Login
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // 3. Nếu có quyền -> Cho phép đi tiếp vào các trang con (Dashboard, Books...) bên trong
  return <Outlet />;
};

export default ProtectedRoute;
