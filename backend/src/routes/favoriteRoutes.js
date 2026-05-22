const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const { protect } = require("../middlewares/authMiddleware");

// Tất cả routes đều cần đăng nhập
router.use(protect);

router.get("/", favoriteController.getMyFavorites); // Lấy ds yêu thích
router.get("/check/:bookId", favoriteController.checkFavorite); // Kiểm tra trạng thái
router.post("/:bookId", favoriteController.toggleFavorite); // Toggle thêm/bỏ

module.exports = router;
