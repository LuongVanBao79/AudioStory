const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true, // Bat buoc phai thuoc ve mot cuon sach nao do
    },
    chapterNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    audioUrl: {
      type: String,
      default: "",
    },
    audioPublicId: { type: String, default: "" },
    duration: {
      type: Number,
      default: 0,
    },
    isUnlocked: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Chapter", chapterSchema);
