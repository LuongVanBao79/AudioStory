const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect, admin } = require("../middlewares/authMiddleware");

// SSE stream — admin kết nối vào đây để nhận thông báo realtime
router.get(
  "/stream",
  protect,
  admin,
  notificationController.streamNotifications,
);

// Lấy danh sách thông báo gần nhất (khi mới mở tab)
router.get("/", protect, admin, notificationController.getNotifications);

// Đánh dấu tất cả đã đọc
router.patch("/read-all", protect, admin, notificationController.markAllAsRead);

// Đánh dấu một thông báo đã đọc
router.patch("/:id/read", protect, admin, notificationController.markAsRead);

module.exports = router;
