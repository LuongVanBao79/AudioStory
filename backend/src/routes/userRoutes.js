const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, admin } = require("../middlewares/authMiddleware");
const { uploadCloud } = require("../config/cloudinary");

// ── Mobile (user tự xem/cập nhật data của mình) ────────────────────────
// LUÔN đặt các route có chữ "me" lên trên cùng
router.get("/me", protect, userController.getMe);
router.get("/me/favorites", protect, userController.getMyFavorites);
router.get("/me/history", protect, userController.getMyHistory);
router.get("/me/stats", protect, userController.getMyStats);

// Route upload avatar (Đã đổi authMiddleware thành protect và đưa lên đây)
router.patch(
  "/me/avatar",
  protect, // Dùng đúng tên middleware đã import
  uploadCloud.single("avatar"),
  userController.updateAvatar,
);

// ── Admin only (Các route có chứa tham số động :id) ──────────────────────
router.get("/", protect, admin, userController.getAllUsers);
router.get("/:id", protect, admin, userController.getUserById);
router.put("/:id", protect, admin, userController.updateUser);
router.patch(
  "/:id/toggle-status",
  protect,
  admin,
  userController.toggleUserStatus,
);
router.delete("/:id", protect, admin, userController.deleteUser);

module.exports = router;
