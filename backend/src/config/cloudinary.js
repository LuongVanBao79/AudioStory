const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// 1. Cấu hình xác thực với Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cấu hình Kho chứa (Storage)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "audiostory/authors", // Ảnh sẽ được lưu vào thư mục này trên Cloudinary
    allowedFormats: ["jpg", "png", "jpeg", "webp"], // Chỉ cho phép up ảnh
  },
});

// 3. Tạo Middleware upload
const uploadCloud = multer({ storage });

module.exports = { cloudinary, uploadCloud };
