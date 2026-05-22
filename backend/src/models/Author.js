// models/Author.js
const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bio: { type: String },
    avatarUrl: { type: String, default: "" }, // Link ảnh Cloudinary
    avatarPublicId: { type: String, default: "" }, // ID để xoá ảnh trên Cloudinary
  },
  { timestamps: true },
);

module.exports = mongoose.model("Author", authorSchema);
