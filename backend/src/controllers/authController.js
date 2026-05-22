const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Hàm tạo token dùng chung
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET, // ← thêm vào .env
    { expiresIn: "30d" },
  );
  return { accessToken, refreshToken };
};

// Hàm set Cookie dùng chung
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // ← sửa chỗ này
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ─────────────────────────────────────────
// [POST] /api/auth/register
// ─────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email này đã được sử dụng" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username: name, email, password: hashed });

    res.status(201).json({ message: "Đăng ký thành công", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────
// [POST] /api/auth/login
// ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email chưa được đăng ký" });
    }
    if (user.status === "banned") {
      return res.status(403).json({ message: "Tài khoản đã bị khoá" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Lưu refreshToken vào DB
    user.refreshToken = refreshToken;
    await user.save();

    // Gửi Cookie cho Web
    setTokenCookie(res, accessToken);

    // Gửi token trong body cho Mobile
    res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken, // ← Mobile lưu vào SecureStore
      refreshToken, // ← Mobile lưu để tự refresh
      user: {
        _id: user._id,
        name: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        points: user.points,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────
// [POST] /api/auth/refresh  ← MỚI cho Mobile
// ─────────────────────────────────────────
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Thiếu refreshToken" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "RefreshToken không hợp lệ" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id,
      user.role,
    );

    // Xoay vòng refreshToken (bảo mật hơn)
    user.refreshToken = newRefreshToken;
    await user.save();

    setTokenCookie(res, accessToken);

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res
      .status(401)
      .json({ message: "RefreshToken hết hạn, vui lòng đăng nhập lại" });
  }
};

// ─────────────────────────────────────────
// [POST] /api/auth/logout
// ─────────────────────────────────────────
const logout = async (req, res) => {
  try {
    // Xoá refreshToken trong DB
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────
// [GET] /api/auth/profile
// ─────────────────────────────────────────
const getProfile = async (req, res) => {
  const u = req.user;
  res.status(200).json({
    user: {
      _id: u._id,
      name: u.username,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      points: u.points,
      favorites: u.favorites,
      createdAt: u.createdAt,
    },
  });
};

// ─────────────────────────────────────────
// [PUT] /api/auth/profile  ← MỚI
// ─────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (name) updates.username = name;
    if (avatar) updates.avatar = avatar;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true },
    ).select("-password -refreshToken");

    res.status(200).json({
      message: "Cập nhật thành công",
      user: {
        _id: updated._id,
        name: updated.username,
        email: updated.email,
        avatar: updated.avatar,
        points: updated.points,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────
// [PATCH] /api/auth/change-password  ← MỚI
// ─────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đủ mật khẩu cũ và mới" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải từ 6 ký tự" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    // Huỷ tất cả session khác
    user.refreshToken = null;
    await user.save();

    res.clearCookie("token");
    res
      .status(200)
      .json({ message: "Đổi mật khẩu thành công, vui lòng đăng nhập lại" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
};
