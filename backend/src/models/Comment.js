const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
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
    content: { type: String, required: true },
    isHidden: { type: Boolean, default: false },

    // Lưu danh sách user đã report — chống spam report nhiều lần
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isReported: { type: Boolean, default: false },

    // Bình luận đa cấp (reply)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Comment", commentSchema);
