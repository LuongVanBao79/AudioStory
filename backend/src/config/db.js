const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("Ket noi CSDL thanh cong");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Thoat chuong trinh neu loi
  }
};

module.exports = connectDB;
