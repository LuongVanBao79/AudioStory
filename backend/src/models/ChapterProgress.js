const mongoose = require("mongoose");

const chapterProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    audioPosition: { type: Number, default: 0 }, // giây
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Unique theo user + chapter
chapterProgressSchema.index({ user: 1, chapter: 1 }, { unique: true });

module.exports = mongoose.model("ChapterProgress", chapterProgressSchema);
