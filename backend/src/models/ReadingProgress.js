const mongoose = require("mongoose");

const readingProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    // Vị trí audio đang nghe dở (giây)
    audioPosition: { type: Number, default: 0 },
    // Đã nghe xong chương này chưa
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Mỗi user chỉ có 1 bản ghi tiến độ cho mỗi cuốn sách
readingProgressSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model("ReadingProgress", readingProgressSchema);
