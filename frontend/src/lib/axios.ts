import axios from "axios";

// Khởi tạo một thực thể (instance) axios riêng biệt cho dự án
const axiosInstance = axios.create({
  // URL trỏ thẳng vào server Node.js của bạn
  baseURL: "http://localhost:3000/api",

  // QUAN TRỌNG NHẤT: Bật cờ này lên để trình duyệt tự động đính kèm Cookie
  // (Access Token / Refresh Token) vào mỗi request gửi đi
  withCredentials: true,
});

// ==========================================
// 1. TRẠM KIỂM SOÁT CHIỀU ĐI (Request Interceptor)
// ==========================================
axiosInstance.interceptors.request.use(
  (config) => {
    // Trước khi request rời khỏi Frontend, bạn có thể cấu hình thêm Header ở đây
    // Hiện tại dùng Cookie nên ta không cần nhét token vào dạng Bearer Header nữa
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ==========================================
// 2. TRẠM KIỂM SOÁT CHIỀU VỀ (Response Interceptor)
// ==========================================
axiosInstance.interceptors.response.use(
  (response) => {
    // Nếu API thành công (Status 2xx), trả thẳng data ra ngoài cho gọn
    return response.data;
  },
  async (error) => {
    // NƠI ĐÂY CHÍNH LÀ ĐẤT DIỄN CỦA REFRESH TOKEN SAU NÀY
    // const originalRequest = error.config;

    // Nếu lỗi 401 (Unauthorized - Hết hạn Token) và chưa từng retry
    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;
    //   try {
    //     // Gọi API refresh-token để Node.js cấp lại Cookie mới
    //     await axios.post('http://localhost:3000/api/refresh-token', {}, { withCredentials: true });
    //     // Lấy được Cookie mới rồi thì tự động chạy lại request cũ bị lỗi
    //     return axiosInstance(originalRequest);
    //   } catch (refreshError) {
    //     // Nếu Refresh Token cũng hết hạn -> Đá văng ra trang Login
    //     window.location.href = '/signin';
    //     return Promise.reject(refreshError);
    //   }
    // }

    // Trả về lỗi chuẩn để file giao diện (UI) bắt được và hiện toast thông báo đỏ
    return Promise.reject(error);
  },
);

export default axiosInstance;
