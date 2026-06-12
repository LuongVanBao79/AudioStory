const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Favorite = require("../models/Favorite");
const ReadingProgress = require("../models/ReadingProgress");
const ChapterProgress = require("../models/ChapterProgress");

const userController = {
  // ─────────────────────────────────────────────────────────────
  // [Admin] GET /api/users
  // Danh sách tất cả user — có phân trang + tìm kiếm
  // ─────────────────────────────────────────────────────────────
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 20, search, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      // const filter = { role: "user" }; // Admin không liệt kê chính mình
      const filter = {};

      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      if (status) filter.status = status; // ?status=active | banned

      const total = await User.countDocuments(filter);
      const users = await User.find(filter)
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      res.status(200).json({
        data: users,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        hasMore: skip + users.length < total,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] GET /api/users/:id
  // Chi tiết 1 user đầy đủ (chỉ admin dùng)
  // ─────────────────────────────────────────────────────────────
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select("-password -refreshToken")
        .lean();

      if (!user)
        return res.status(404).json({ message: "Không tìm thấy người dùng!" });

      res.status(200).json({ data: user });
    } catch (error) {
      res.status(500).json({ message: "Lỗi hệ thống!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] GET /api/users/me
  // User xem thông tin của chính mình
  // ─────────────────────────────────────────────────────────────
  getMe: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .select("-password -refreshToken")
        .lean();

      if (!user)
        return res.status(404).json({ message: "Không tìm thấy người dùng!" });

      res.status(200).json({ data: user });
    } catch (error) {
      res.status(500).json({ message: "Lỗi hệ thống!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] GET /api/users/me/favorites
  // User xem danh sách sách yêu thích của chính mình
  // ─────────────────────────────────────────────────────────────
  getMyFavorites: async (req, res) => {
    try {
      const favorites = await Favorite.find({ user: req.user._id })
        .populate({
          path: "book",
          select:
            "title coverImage rating viewCount listenCount totalChapters isFull",
          populate: [
            { path: "author", select: "name avatarUrl" },
            { path: "category", select: "name slug" },
          ],
        })
        .sort({ createdAt: -1 })
        .lean();

      const books = favorites.filter((f) => f.book !== null).map((f) => f.book);

      res.status(200).json({ data: books, total: books.length });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách yêu thích!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] GET /api/users/me/history
  // Lịch sử nghe của user — sách đang nghe dở
  // ─────────────────────────────────────────────────────────────
  getMyHistory: async (req, res) => {
    try {
      const history = await ReadingProgress.find({ user: req.user._id })
        .populate({
          path: "book",
          select: "title coverImage totalChapters",
          populate: { path: "author", select: "name" },
        })
        .populate("chapter", "chapterNumber title duration audioUrl")
        .sort({ updatedAt: -1 }) // Sắp xếp theo nghe gần nhất
        .lean();

      // Lọc bỏ sách đã bị xoá
      const valid = history.filter((h) => h.book !== null);

      res.status(200).json({ data: valid, total: valid.length });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy lịch sử nghe!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] PUT /api/users/:id
  // Admin cập nhật thông tin user (username, email, status)
  // KHÔNG cho đổi role qua đây — dùng route riêng
  // ─────────────────────────────────────────────────────────────
  updateUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user)
        return res.status(404).json({ message: "Không tìm thấy người dùng!" });

      const { username, email, password } = req.body;

      // Kiểm tra email trùng với user khác
      if (email && email !== user.email) {
        const conflict = await User.findOne({ email });
        if (conflict)
          return res
            .status(400)
            .json({ message: "Email này đã được sử dụng!" });
      }

      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;

      // Admin đặt lại mật khẩu cho user
      if (password?.trim()) {
        if (password.length < 6) {
          return res.status(400).json({ message: "Mật khẩu phải từ 6 ký tự!" });
        }
        updateData.password = await bcrypt.hash(password, 10);
        updateData.refreshToken = null; // Buộc user đăng nhập lại
      }

      const updated = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true },
      ).select("-password -refreshToken");

      res
        .status(200)
        .json({ message: "Cập nhật tài khoản thành công!", data: updated });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật người dùng!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] PATCH /api/users/:id/toggle-status
  // Khoá / Mở khoá tài khoản user
  // ─────────────────────────────────────────────────────────────
  toggleUserStatus: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user)
        return res.status(404).json({ message: "Không tìm thấy người dùng!" });

      if (user.role === "admin") {
        return res
          .status(403)
          .json({ message: "Không thể khoá tài khoản Admin!" });
      }

      user.status = user.status === "active" ? "banned" : "active";

      // Khoá luôn session nếu bị ban
      if (user.status === "banned") user.refreshToken = null;

      await user.save();

      res.status(200).json({
        message:
          user.status === "banned"
            ? `Đã khoá tài khoản ${user.username}!`
            : `Đã mở khoá ${user.username}!`,
        data: { _id: user._id, status: user.status },
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi hệ thống!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] DELETE /api/users/:id
  // Xoá tài khoản vĩnh viễn
  // ─────────────────────────────────────────────────────────────
  deleteUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user)
        return res.status(404).json({ message: "Không tìm thấy người dùng!" });

      if (user.role === "admin") {
        return res
          .status(403)
          .json({ message: "Không thể xoá tài khoản Admin!" });
      }

      // Xoá luôn data liên quan
      await Promise.all([
        Favorite.deleteMany({ user: req.params.id }),
        ReadingProgress.deleteMany({ user: req.params.id }),
        User.findByIdAndDelete(req.params.id),
      ]);

      res
        .status(200)
        .json({ message: "Đã xoá người dùng và dữ liệu liên quan!" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] GET /api/users/me/stats
  // Thống kê cá nhân của user
  // ─────────────────────────────────────────────────────────────
  getMyStats: async (req, res) => {
    try {
      const userId = req.user._id;

      const [progressList, chapterProgressList, favoriteCount] =
        await Promise.all([
          // Tổng sách đã có tiến độ + số sách hoàn thành
          ReadingProgress.find({ user: userId }).lean(),
          // Tổng giờ nghe từ từng chương
          ChapterProgress.find({ user: userId }).lean(),
          // Tổng yêu thích
          Favorite.countDocuments({ user: userId }),
        ]);

      const totalBooks = progressList.length;
      const completedBooks = progressList.filter((p) => p.isCompleted).length;
      const totalSeconds = chapterProgressList.reduce(
        (sum, p) => sum + (p.audioPosition ?? 0),
        0,
      );
      const totalMinutes = Math.floor(totalSeconds / 60);

      res.status(200).json({
        data: {
          totalBooks, // Số sách đang/đã nghe
          completedBooks, // Số sách đã hoàn thành
          totalMinutes, // Tổng thời gian nghe (phút)
          totalFavorites: favoriteCount,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy thống kê!" });
    }
  },

  updateAvatar: async (req, res) => {
    try {
      // Middleware uploadCloud đã tự động đẩy ảnh lên Cloudinary
      // và gán thông tin URL trả về vào req.file.path
      if (!req.file) {
        return res.status(400).json({ message: "Vui lòng đính kèm ảnh!" });
      }

      const avatarUrl = req.file.path;

      // Cập nhật URL ảnh mới vào Database
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: avatarUrl } },
        { new: true },
      ).select("-password -refreshToken");

      if (!updatedUser) {
        return res.status(404).json({ message: "Không tìm thấy người dùng!" });
      }

      res.status(200).json({
        message: "Cập nhật ảnh đại diện thành công!",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Lỗi cập nhật avatar:", error);
      res.status(500).json({ message: "Lỗi hệ thống khi cập nhật ảnh!" });
    }
  },
};

module.exports = userController;
