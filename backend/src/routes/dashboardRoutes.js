// routes/adminRoutes.js
const express = require("express");
const router = express.Router();

// Import Controller (Hãy đảm bảo đường dẫn và tên hàm là chính xác)
const dashboardController = require("../controllers/dashboardController");

// Import Middleware
const { protect, admin } = require("../middlewares/authMiddleware");

router.get("/dashboard", protect, admin, dashboardController.getDashboardData);

// 💡 Gợi ý cho bạn: Sau này bạn có thể gom toàn bộ API của Admin vào đây cho gọn
// Ví dụ:
// router.get("/users", protect, admin, userController.getAllUsers);
// router.post("/books", protect, admin, bookController.createBook);

module.exports = router;
