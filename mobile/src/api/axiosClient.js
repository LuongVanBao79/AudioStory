import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// ── Hàm hỗ trợ lưu trữ đa nền tảng (Fix lỗi Web) ─────────────
const getToken = async (key) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

const setToken = async (key, value) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const removeToken = async (key) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

// ── Cấu hình Base URL ────────────────────────────────────────
const getBaseUrl = () => {
  // Ưu tiên dùng IP LAN (192.168.1.7) cho cả Web và Mobile khi Dev
  // để tránh lỗi CORS do khác localhost:8081 và localhost:3000
  const url = __DEV__
    ? "http://192.168.1.8:3000/api"
    : "https://audiostory-backend.onrender.com/api";

  console.log("🔗 Base URL:", url);
  return url;
};

const axiosClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ── Request Interceptor ──────────────────────────────────────
axiosClient.interceptors.request.use(async (config) => {
  try {
    const token = await getToken("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    console.error("Lỗi khi lấy token:", error);
  }
  return config;
});

// ── Response Interceptor ─────────────────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getToken("refreshToken");
        if (!refreshToken) throw new Error("Không có refreshToken");

        const res = await axios.post(`${getBaseUrl()}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data;

        // Lưu token mới
        await setToken("accessToken", accessToken);
        await setToken("refreshToken", newRefreshToken);

        // Retry request cũ với token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch {
        // Refresh thất bại → xoá token → về màn hình login
        await removeToken("accessToken");
        await removeToken("refreshToken");
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
