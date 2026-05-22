const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, admin } = require("../middlewares/authMiddleware");

// ── Mobile (user tự xem data của mình) ────────────────────────
// Đặt TRƯỚC /:id để không bị Express hiểu "me" là một ObjectId
router.get("/me", protect, userController.getMe);
router.get("/me/favorites", protect, userController.getMyFavorites);
router.get("/me/history", protect, userController.getMyHistory);
router.get("/me/stats", protect, userController.getMyStats);

// ── Admin only ─────────────────────────────────────────────────
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
