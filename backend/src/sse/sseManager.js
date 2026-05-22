/**
 * SSE Manager — Quản lý danh sách admin client đang kết nối
 * Singleton: dùng chung toàn bộ app, không khởi tạo lại mỗi request
 */

const clients = new Set();

/**
 * Thêm admin client vào danh sách khi họ kết nối SSE
 */
const addClient = (res) => {
  clients.add(res);
  console.log(`[SSE] Admin kết nối. Tổng: ${clients.size}`);
};

/**
 * Xóa admin client khỏi danh sách khi họ đóng tab/mất mạng
 */
const removeClient = (res) => {
  clients.delete(res);
  console.log(`[SSE] Admin ngắt kết nối. Còn lại: ${clients.size}`);
};

/**
 * Đẩy thông báo đến TẤT CẢ admin đang mở web
 * Gọi hàm này sau mỗi createComment / createReview / reportComment
 */
const pushToAllAdmins = (data) => {
  if (clients.size === 0) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => {
    try {
      client.write(payload);
    } catch (err) {
      // Client đã đóng kết nối nhưng chưa kịp remove → bỏ qua
      clients.delete(client);
    }
  });
};

module.exports = { addClient, removeClient, pushToAllAdmins };
