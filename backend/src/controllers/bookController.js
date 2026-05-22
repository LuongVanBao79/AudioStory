const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const { cloudinary } = require("../config/cloudinary");

const bookController = {
  // ─────────────────────────────────────────────────────────────
  // 1. LẤY DANH SÁCH SÁCH
  // Hỗ trợ: ?search=  ?category=  ?sort=newest|top-view|top-listen
  //         ?page=    ?limit=
  // ─────────────────────────────────────────────────────────────
  getAllBooks: async (req, res) => {
    try {
      const {
        search,
        category,
        sort = "newest",
        page = 1,
        limit = 20,
      } = req.query;

      // --- Bộ lọc ---
      const filter = {};

      if (search) {
        filter.title = { $regex: search, $options: "i" }; // Không phân biệt hoa thường
      }
      if (category) {
        filter.category = category; // Truyền ObjectId hoặc slug đều được
      }

      // --- Sắp xếp ---
      const sortMap = {
        newest: { createdAt: -1 },
        "top-view": { viewCount: -1 },
        "top-listen": { listenCount: -1 },
        rating: { rating: -1 },
      };
      const sortOption = sortMap[sort] || sortMap.newest;

      // --- Phân trang ---
      const skip = (Number(page) - 1) * Number(limit);
      const total = await Book.countDocuments(filter);

      const books = await Book.find(filter)
        .populate("author", "name avatarUrl")
        .populate("category", "name slug")
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .lean();

      res.status(200).json({
        data: books,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        hasMore: skip + books.length < total,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách sách!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 2. SÁCH MỚI NHẤT (dùng cho section "Mới cập nhật" trên Home)
  // GET /api/books/new?limit=10
  // ─────────────────────────────────────────────────────────────
  getNewBooks: async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 10;

      const books = await Book.find()
        .populate("author", "name avatarUrl")
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      res.status(200).json({ data: books });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 3. SÁCH NỔI BẬT (dùng cho section "Top" trên Home)
  // GET /api/books/top?by=view&limit=10
  // by: "view" | "listen" | "rating"
  // ─────────────────────────────────────────────────────────────
  getTopBooks: async (req, res) => {
    try {
      const { by = "view", limit = 10 } = req.query;

      const sortMap = {
        view: { viewCount: -1 },
        listen: { listenCount: -1 },
        rating: { rating: -1 },
      };
      const sortOption = sortMap[by] || sortMap.view;

      const books = await Book.find()
        .populate("author", "name avatarUrl")
        .populate("category", "name slug")
        .sort(sortOption)
        .limit(Number(limit))
        .lean();

      res.status(200).json({ data: books });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 4. CHI TIẾT SÁCH + DANH SÁCH CHƯƠNG
  // GET /api/books/:id
  // ─────────────────────────────────────────────────────────────
  getBookById: async (req, res) => {
    try {
      const book = await Book.findById(req.params.id)
        .populate("author", "name bio avatarUrl")
        .populate("category", "name slug")
        .lean();

      if (!book) {
        return res.status(404).json({ message: "Không tìm thấy sách!" });
      }

      const chapters = await Chapter.find({ book: req.params.id })
        .select("chapterNumber title audioUrl duration isUnlocked")
        .sort({ chapterNumber: 1 })
        .lean();

      book.chapters = chapters;

      res.status(200).json({
        message: "Lấy chi tiết sách thành công",
        data: book,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 5. TĂNG LƯỢT XEM
  // PATCH /api/books/:id/view
  // ─────────────────────────────────────────────────────────────
  incrementView: async (req, res) => {
    try {
      const book = await Book.findByIdAndUpdate(
        req.params.id,
        { $inc: { viewCount: 1 } },
        { new: true },
      ).select("viewCount");

      if (!book)
        return res.status(404).json({ message: "Không tìm thấy sách!" });

      res.status(200).json({
        message: "Cập nhật lượt xem thành công",
        viewCount: book.viewCount,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 6. TĂNG LƯỢT NGHE
  // PATCH /api/books/:id/listen
  // ─────────────────────────────────────────────────────────────
  incrementListen: async (req, res) => {
    try {
      const book = await Book.findByIdAndUpdate(
        req.params.id,
        { $inc: { listenCount: 1 } },
        { new: true },
      ).select("listenCount");

      if (!book)
        return res.status(404).json({ message: "Không tìm thấy sách!" });

      res.status(200).json({
        message: "Cập nhật lượt nghe thành công",
        listenCount: book.listenCount,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 7. THÊM SÁCH (Admin)
  // ─────────────────────────────────────────────────────────────
  createBook: async (req, res) => {
    try {
      const { title, author, description, category, isFull } = req.body;
      const fileData = req.file;

      const newBook = await Book.create({
        title,
        author,
        category,
        description,
        coverImage: fileData?.path || "",
        coverImagePublicId: fileData?.filename || "",
        isFull: isFull === "true" || isFull === true,
      });

      res.status(201).json({ message: "Thêm sách thành công!", book: newBook });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi thêm sách!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 8. CẬP NHẬT SÁCH (Admin)
  // ─────────────────────────────────────────────────────────────
  updateBook: async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book)
        return res.status(404).json({ message: "Không tìm thấy sách!" });

      const { title, author, description, category, isFull } = req.body;
      const fileData = req.file;

      let coverImage = book.coverImage;
      let coverImagePublicId = book.coverImagePublicId;

      if (fileData) {
        if (book.coverImagePublicId) {
          await cloudinary.uploader.destroy(book.coverImagePublicId);
        }
        coverImage = fileData.path;
        coverImagePublicId = fileData.filename;
      }

      const updated = await Book.findByIdAndUpdate(
        req.params.id,
        {
          title,
          author,
          category,
          description,
          coverImage,
          coverImagePublicId,
          isFull: isFull === "true" || isFull === true,
        },
        { new: true },
      )
        .populate("author", "name")
        .populate("category", "name");

      res
        .status(200)
        .json({ message: "Cập nhật sách thành công!", book: updated });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật sách!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 9. XOÁ SÁCH (Admin)
  // ─────────────────────────────────────────────────────────────
  deleteBook: async (req, res) => {
    try {
      const chapterCount = await Chapter.countDocuments({
        book: req.params.id,
      });
      if (chapterCount > 0) {
        return res.status(400).json({
          message: `Không thể xoá! Sách đang có ${chapterCount} chương. Vui lòng xoá hết chương trước.`,
        });
      }

      const book = await Book.findById(req.params.id);
      if (!book)
        return res.status(404).json({ message: "Không tìm thấy sách!" });

      if (book.coverImagePublicId) {
        await cloudinary.uploader.destroy(book.coverImagePublicId);
      }

      await Book.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Đã xoá sách thành công!" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },
};

module.exports = bookController;
