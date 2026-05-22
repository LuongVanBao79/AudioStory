const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true }, // BỔ SUNG: Đường dẫn chuẩn SEO
  description: { type: String },
});

module.exports = mongoose.model("Category", categorySchema);
