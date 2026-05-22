const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Loại thông báo
    type: {
      type: String,
      enum: ["new_comment", "new_review", "reported"],
      required: true,
    },

    // Thông tin sách liên quan
    bookTitle: { type: String, required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },

    // Thông tin người dùng tạo ra sự kiện
    userName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Preview nội dung (80 ký tự đầu)
    preview: { type: String, default: "" },

    // ID của comment/review liên quan (để admin click vào xem chi tiết)
    targetId: { type: mongoose.Schema.Types.ObjectId },

    // Số lần bị báo cáo (chỉ dùng cho type = "reported")
    reportCount: { type: Number, default: 0 },

    // Trạng thái đã đọc chưa
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
