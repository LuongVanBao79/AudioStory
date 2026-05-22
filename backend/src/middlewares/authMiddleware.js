const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Ưu tiên 1: httpOnly Cookie (Web Admin)
  if (req.cookies?.token) {
    token = req.cookies.token;
  }
  // Ưu tiên 2: Authorization Header (Mobile App)
  else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select(
      "-password -refreshToken",
    );

    if (!req.user) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }
    if (req.user.status === "banned") {
      return res.status(403).json({ message: "Tài khoản đã bị khoá" });
    }

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

const admin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  res.status(403).json({ message: "Yêu cầu quyền Admin" });
};

module.exports = { protect, admin };
