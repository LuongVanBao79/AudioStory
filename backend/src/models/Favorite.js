const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
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
  },
  { timestamps: true },
);

// Mỗi user chỉ có thể thêm 1 cuốn sách vào favorites 1 lần
favoriteSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
