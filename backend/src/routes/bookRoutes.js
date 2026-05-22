const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const { uploadCloud } = require("../config/cloudinary");
const { protect, admin } = require("../middlewares/authMiddleware");

// ── Public (Mobile + Web) ──────────────────────────────────────
router.get("/", bookController.getAllBooks); // ?search= ?category= ?sort= ?page= ?limit=
router.get("/new", bookController.getNewBooks); // ?limit=
router.get("/top", bookController.getTopBooks); // ?by=view|listen|rating &limit=
router.get("/:id", bookController.getBookById);

router.patch("/:id/view", bookController.incrementView);
router.patch("/:id/listen", bookController.incrementListen);

// ── Admin only ─────────────────────────────────────────────────
router.post(
  "/",
  protect,
  admin,
  uploadCloud.single("cover"),
  bookController.createBook,
);
router.put(
  "/:id",
  protect,
  admin,
  uploadCloud.single("cover"),
  bookController.updateBook,
);
router.delete("/:id", protect, admin, bookController.deleteBook);

module.exports = router;
