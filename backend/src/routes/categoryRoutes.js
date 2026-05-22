const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { protect, admin } = require("../middlewares/authMiddleware");

// ── Public (Mobile + Admin) ────────────────────────────────────
// router.get("/categories", categoryController.getAllCategories);// Admin thấy bookCount, Mobile thấy list gọn
router.get("/:idOrSlug", categoryController.getCategoryById); // Hỗ trợ cả ID lẫn slug

// ── Admin only ─────────────────────────────────────────────────
router.get("/", protect, admin, categoryController.getAllCategories);
router.post("/", protect, admin, categoryController.createCategory);
router.put("/:id", protect, admin, categoryController.updateCategory);
router.delete("/:id", protect, admin, categoryController.deleteCategory);

module.exports = router;
