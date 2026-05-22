const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { protect, admin } = require("../middlewares/authMiddleware");

// ── Public ─────────────────────────────────────────────────────
router.get("/chapter/:chapterId", commentController.getCommentsByChapter);

// ── User (cần login) ───────────────────────────────────────────
router.post("/", protect, commentController.createComment);
router.put("/:id", protect, commentController.updateComment);
router.delete("/:id", protect, commentController.deleteComment);
router.patch("/:id/report", protect, commentController.reportComment);

// ── Admin only ─────────────────────────────────────────────────
router.get(
  "/admin/all",
  protect,
  admin,
  commentController.getAllCommentsForAdmin,
);
router.patch(
  "/:id/toggle-hide",
  protect,
  admin,
  commentController.toggleHideComment,
);

module.exports = router;
