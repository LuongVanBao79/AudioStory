const Author = require("../models/Author");
const Book = require("../models/Book");
const { cloudinary } = require("../config/cloudinary");

const authorController = {
  // ─────────────────────────────────────────────────────
  // [Mobile + Admin] GET /api/authors
  // Mobile chỉ cần name + avatarUrl để hiển thị danh sách
  // Admin cần thêm bookCount
  // ─────────────────────────────────────────────────────
  getAllAuthors: async (req, res) => {
    try {
      const isAdmin = req.user?.role === "admin";

      // Admin → aggregate đếm số sách
      if (isAdmin) {
        const authors = await Author.aggregate([
          {
            $lookup: {
              from: "books",
              localField: "_id",
              foreignField: "author",
              as: "booksByAuthor",
            },
          },
          { $addFields: { bookCount: { $size: "$booksByAuthor" } } },
          { $project: { booksByAuthor: 0 } },
          { $sort: { createdAt: -1 } },
        ]);
        return res.status(200).json({ data: authors });
      }

      // Mobile → query nhẹ, chỉ lấy field cần thiết
      const authors = await Author.find()
        .select("name avatarUrl bio")
        .sort({ name: 1 })
        .lean();

      res.status(200).json({ data: authors });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────
  // [Mobile] GET /api/authors/:id
  // Chi tiết tác giả + danh sách sách của họ
  // ─────────────────────────────────────────────────────
  getAuthorById: async (req, res) => {
    try {
      const author = await Author.findById(req.params.id)
        .select("name bio avatarUrl")
        .lean();

      if (!author) {
        return res.status(404).json({ message: "Không tìm thấy tác giả!" });
      }

      // Lấy sách của tác giả này
      const books = await Book.find({ author: req.params.id })
        .select("title coverImage rating viewCount listenCount isFull")
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({
        data: { ...author, books, bookCount: books.length },
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────
  // [Admin] POST /api/authors
  // ─────────────────────────────────────────────────────
  createAuthor: async (req, res) => {
    try {
      const { name, bio } = req.body;
      const fileData = req.file;

      if (!name) {
        return res
          .status(400)
          .json({ message: "Tên tác giả không được để trống!" });
      }

      const newAuthor = await Author.create({
        name,
        bio,
        avatarUrl: fileData?.path || "",
        avatarPublicId: fileData?.filename || "",
      });

      res
        .status(201)
        .json({ message: "Thêm tác giả thành công!", author: newAuthor });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────
  // [Admin] PUT /api/authors/:id
  // ─────────────────────────────────────────────────────
  updateAuthor: async (req, res) => {
    try {
      const author = await Author.findById(req.params.id);
      if (!author)
        return res.status(404).json({ message: "Không tìm thấy tác giả!" });

      const { name, bio } = req.body;
      const fileData = req.file;

      let avatarUrl = author.avatarUrl;
      let avatarPublicId = author.avatarPublicId;

      if (fileData) {
        if (author.avatarPublicId) {
          await cloudinary.uploader.destroy(author.avatarPublicId);
        }
        avatarUrl = fileData.path;
        avatarPublicId = fileData.filename;
      }

      const updated = await Author.findByIdAndUpdate(
        req.params.id,
        { name, bio, avatarUrl, avatarPublicId },
        { new: true },
      );

      res
        .status(200)
        .json({ message: "Cập nhật thành công!", author: updated });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────
  // [Admin] DELETE /api/authors/:id
  // ─────────────────────────────────────────────────────
  deleteAuthor: async (req, res) => {
    try {
      const booksCount = await Book.countDocuments({ author: req.params.id });
      if (booksCount > 0) {
        return res.status(400).json({
          message: `Không thể xoá! Tác giả này đang có ${booksCount} cuốn sách.`,
        });
      }

      const author = await Author.findById(req.params.id);
      if (!author)
        return res.status(404).json({ message: "Không tìm thấy tác giả!" });

      if (author.avatarPublicId) {
        await cloudinary.uploader.destroy(author.avatarPublicId);
      }

      await Author.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Đã xoá tác giả thành công!" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },
};

module.exports = authorController;
