const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController");
const { uploadCloud } = require("../config/cloudinary");
const { protect, admin } = require("../middlewares/authMiddleware");

// ── Public (Mobile + Web) ──────────────────────────────
// router.get("/", authorController.getAllAuthors); // Admin thấy bookCount, Mobile thấy list gọn
router.get("/:id", authorController.getAuthorById); // Chi tiết + sách của tác giả

// ── Admin only ─────────────────────────────────────────
router.get("/", protect, admin, authorController.getAllAuthors);
router.post(
  "/",
  protect,
  admin,
  uploadCloud.single("avatar"),
  authorController.createAuthor,
);
router.put(
  "/:id",
  protect,
  admin,
  uploadCloud.single("avatar"),
  authorController.updateAuthor,
);
router.delete("/:id", protect, admin, authorController.deleteAuthor);

module.exports = router;
