// src/hooks/useRequireAuth.ts
import { useRouter } from "expo-router";
import { useAuthStore } from "../stores/useAuthStore";

export const useRequireAuth = () => {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // Bọc action cần đăng nhập
  // Nếu chưa đăng nhập → hiện modal gợi ý, không làm gì cả
  const requireAuth = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      router.push("/(auth)/login-prompt"); // Màn hình gợi ý đăng nhập
    }
  };

  return { requireAuth, isLoggedIn };
};
