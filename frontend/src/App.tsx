import { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import { Toaster } from "sonner";
import { useAuthStore } from "./stores/useAuthStore";
import { Loader2 } from "lucide-react";

// Import các trang
import SignInPage from "./pages/SignInPage";
import SignUppage from "./pages/SignUppage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import BooksPage from "./pages/BooksPage";
import CategoriesPage from "./pages/CategoriesPage";
import BookDetailsPage from "./pages/BookDetailsPage";
import AuthorsPage from "./pages/AuthorsPage";
import ReviewsPage from "./pages/ReviewsPage";
import UsersPage from "./pages/UsersPage";
import CommentsPage from "./pages/CommentsPage";
import AuthorDetailPage from "./pages/AuthorDetailPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";

function App() {
  // Lấy các state và hàm từ bộ não Zustand
  const { checkAuth, isCheckingAuth, isAuthenticated } = useAuthStore();

  // Khi ứng dụng vừa chạy lên (người dùng mở web hoặc F5), tự động gọi hàm checkAuth
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Hiện màn hình chờ toàn cục nếu đang check cookie lần đầu để tránh nháy giao diện
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="bottom-right" />
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES: Đã đăng nhập rồi thì không cho vào trang Signin/Signup nữa */}
          <Route
            path="/signin"
            element={isAuthenticated ? <Navigate to="/" /> : <SignInPage />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/" /> : <SignUppage />}
          />

          {/* PROTECTED ROUTES: Phải qua ải ProtectedRoute mới được vào */}
          <Route element={<ProtectedRoute />}>
            {/* Tất cả các trang nội bộ của Admin sẽ đặt ở trong này */}
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Dashboard />} />

              {/* Quản lý Nội dung */}
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/authors" element={<AuthorsPage />} />
              <Route path="/books" element={<BooksPage />} />

              {/* TRANG ĐẶC BIỆT: Chi tiết sách (Dùng :id để lấy ID của sách trên URL) */}
              <Route path="/books/:id" element={<BookDetailsPage />} />
              <Route path="/authors/:id" element={<AuthorDetailPage />} />
              <Route path="/categories/:id" element={<CategoryDetailPage />} />

              {/* Quản lý Cộng đồng & Hệ thống */}
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/comments" element={<CommentsPage />} />
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
