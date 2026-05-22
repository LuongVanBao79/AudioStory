const Favorite = require("../models/Favorite");
const Book = require("../models/Book");

const favoriteController = {
  // ─────────────────────────────────────────────────────────────
  // [POST] /api/favorites/:bookId
  // Toggle — chưa có thì thêm, đã có thì xoá
  // ─────────────────────────────────────────────────────────────
  toggleFavorite: async (req, res) => {
    try {
      const userId = req.user._id;
      const { bookId } = req.params;

      // Kiểm tra sách có tồn tại không
      const book = await Book.findById(bookId).lean();
      if (!book) {
        return res.status(404).json({ message: "Không tìm thấy sách!" });
      }

      // Kiểm tra đã yêu thích chưa
      const existing = await Favorite.findOne({ user: userId, book: bookId });

      if (existing) {
        // Đã có → Bỏ yêu thích
        await Favorite.findByIdAndDelete(existing._id);
        return res.status(200).json({
          message: "Đã bỏ khỏi danh sách yêu thích",
          isFavorite: false,
        });
      }

      // Chưa có → Thêm vào yêu thích
      await Favorite.create({ user: userId, book: bookId });
      return res.status(201).json({
        message: "Đã thêm vào danh sách yêu thích",
        isFavorite: true,
      });
    } catch (error) {
      console.error("[toggleFavorite]", error);
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [GET] /api/favorites
  // Lấy toàn bộ sách yêu thích của user đang đăng nhập
  // ─────────────────────────────────────────────────────────────
  getMyFavorites: async (req, res) => {
    try {
      const favorites = await Favorite.find({ user: req.user._id })
        .populate({
          path: "book",
          select:
            "title coverImage rating viewCount listenCount isFull totalChapters",
          populate: [
            { path: "author", select: "name avatarUrl" },
            { path: "category", select: "name slug" },
          ],
        })
        .sort({ createdAt: -1 })
        .lean();

      // Lọc ra những sách đã bị xoá (book = null)
      const books = favorites.filter((f) => f.book !== null).map((f) => f.book);

      res.status(200).json({ data: books, total: books.length });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách yêu thích!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [GET] /api/favorites/check/:bookId
  // Kiểm tra user có đang yêu thích cuốn sách này không
  // Dùng khi mở màn hình chi tiết sách để hiển thị icon ❤️
  // ─────────────────────────────────────────────────────────────
  checkFavorite: async (req, res) => {
    try {
      const existing = await Favorite.findOne({
        user: req.user._id,
        book: req.params.bookId,
      }).lean();

      res.status(200).json({ isFavorite: !!existing });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },
};

module.exports = favoriteController;
