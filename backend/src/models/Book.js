const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    }, // SỬA: Liên kết với bảng Tác giả
    description: { type: String },
    coverImage: { type: String },
    coverImagePublicId: { type: String, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    totalChapters: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    listenCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    isFull: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Book", bookSchema);
