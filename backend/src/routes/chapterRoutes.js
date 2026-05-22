const express = require("express");
const router = express.Router();
const chapterController = require("../controllers/chapterController");
const { protect, admin } = require("../middlewares/authMiddleware");

// ── Public ─────────────────────────────────────────────────────
router.get("/book/:bookId", chapterController.getChaptersByBook);
router.get("/progress/:bookId", protect, chapterController.getProgress);
router.get(
  "/chapter-progress/:bookId",
  protect,
  chapterController.getChapterProgressByBook,
);
router.get("/:id", chapterController.getChapterById);

// ── User (cần login) ───────────────────────────────────────────
router.post("/:id/progress", protect, chapterController.saveProgress);
router.get("/progress/:bookId", protect, chapterController.getProgress);

// ── Admin only ─────────────────────────────────────────────────
router.post("/", protect, admin, chapterController.createChapter);
router.put("/:id", protect, admin, chapterController.updateChapter);
router.delete("/:id", protect, admin, chapterController.deleteChapter);

module.exports = router;
