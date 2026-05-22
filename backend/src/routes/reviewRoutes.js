const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect, admin } = require("../middlewares/authMiddleware");

// ── Public ─────────────────────────────────────────────────────
router.get("/book/:bookId", reviewController.getReviewsByBook); // Danh sách review của sách

// ── User (cần login) ───────────────────────────────────────────
router.get("/my-review/:bookId", protect, reviewController.getMyReview); // Đã review chưa?
router.post("/", protect, reviewController.createReview); // Tạo review
router.put("/:id", protect, reviewController.updateReview); // Sửa review của mình
router.delete("/:id", protect, reviewController.deleteReview); // Xoá (user hoặc admin)

// ── Admin only ─────────────────────────────────────────────────
router.get(
  "/admin/all",
  protect,
  admin,
  reviewController.getAllReviewsForAdmin,
);
router.patch(
  "/:id/toggle-hide",
  protect,
  admin,
  reviewController.toggleHideReview,
);

module.exports = router;
