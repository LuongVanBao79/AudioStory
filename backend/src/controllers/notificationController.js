const Notification = require("../models/Notification");
const { addClient, removeClient } = require("../sse/sseManager");

const notificationController = {
  // ─────────────────────────────────────────────────────────────
  // [Admin] GET /api/notifications/stream
  // Admin kết nối SSE để nhận thông báo realtime
  // Kết nối này giữ mở liên tục cho đến khi admin đóng tab
  // ─────────────────────────────────────────────────────────────
  streamNotifications: async (req, res) => {
    // Set header SSE bắt buộc
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Tắt buffer của nginx nếu có

    // Flush header ngay lập tức
    res.flushHeaders();

    // Gửi event đầu tiên để báo kết nối thành công
    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

    // Thêm client này vào danh sách đang theo dõi
    addClient(res);

    // Ping mỗi 30s để giữ kết nối không bị timeout
    const keepAlive = setInterval(() => {
      res.write(": ping\n\n");
    }, 30000);

    // Khi admin đóng tab → dọn dẹp
    req.on("close", () => {
      clearInterval(keepAlive);
      removeClient(res);
    });
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] GET /api/notifications
  // Lấy 20 thông báo gần nhất — dùng khi admin mới mở tab
  // ─────────────────────────────────────────────────────────────
  getNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      const unreadCount = await Notification.countDocuments({ isRead: false });

      res.status(200).json({ data: notifications, unreadCount });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy thông báo!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] PATCH /api/notifications/:id/read
  // Đánh dấu một thông báo đã đọc
  // ─────────────────────────────────────────────────────────────
  markAsRead: async (req, res) => {
    try {
      await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
      res.status(200).json({ message: "Đã đánh dấu đã đọc!" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] PATCH /api/notifications/read-all
  // Đánh dấu tất cả thông báo đã đọc
  // ─────────────────────────────────────────────────────────────
  markAllAsRead: async (req, res) => {
    try {
      await Notification.updateMany({ isRead: false }, { isRead: true });
      res.status(200).json({ message: "Đã đánh dấu tất cả đã đọc!" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },
};

module.exports = notificationController;
