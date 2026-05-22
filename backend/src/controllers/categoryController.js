const Category = require("../models/Category");
const Book = require("../models/Book");

const categoryController = {
  // ─────────────────────────────────────────────────────────────
  // [Mobile + Admin] GET /api/categories
  // Admin → có bookCount (aggregate)
  // Mobile → list gọn name + slug (query nhẹ)
  // ─────────────────────────────────────────────────────────────
  getAllCategories: async (req, res) => {
    try {
      const isAdmin = req.user?.role === "admin";

      if (isAdmin) {
        const categories = await Category.aggregate([
          {
            $lookup: {
              from: "books",
              localField: "_id",
              foreignField: "category",
              as: "booksInCategory",
            },
          },
          { $addFields: { bookCount: { $size: "$booksInCategory" } } },
          { $project: { booksInCategory: 0 } },
          { $sort: { createdAt: -1 } },
        ]);
        return res.status(200).json({ data: categories });
      }

      // Mobile — nhẹ, đủ dùng
      const categories = await Category.find()
        .select("name slug description")
        .sort({ name: 1 })
        .lean();

      res.status(200).json({ data: categories });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] GET /api/categories/:idOrSlug
  // Chi tiết danh mục + danh sách sách thuộc danh mục
  // Hỗ trợ cả ObjectId lẫn slug
  // ─────────────────────────────────────────────────────────────
  getCategoryById: async (req, res) => {
    try {
      const { idOrSlug } = req.params;

      // Thử tìm theo slug trước, nếu không thì tìm theo _id
      const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
      const category = await Category.findOne(
        isObjectId ? { _id: idOrSlug } : { slug: idOrSlug },
      ).lean();

      if (!category) {
        return res.status(404).json({ message: "Không tìm thấy danh mục!" });
      }

      // Lấy sách thuộc danh mục — hỗ trợ phân trang
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const total = await Book.countDocuments({ category: category._id });

      const books = await Book.find({ category: category._id })
        .select(
          "title coverImage rating viewCount listenCount isFull totalChapters",
        )
        .populate("author", "name avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      res.status(200).json({
        data: {
          ...category,
          books,
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          hasMore: skip + books.length < total,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] POST /api/categories
  // ─────────────────────────────────────────────────────────────
  createCategory: async (req, res) => {
    try {
      const { name, slug, description } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ message: "Tên danh mục không được để trống!" });
      }

      const existing = await Category.findOne({ $or: [{ name }, { slug }] });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Tên hoặc slug danh mục đã tồn tại!" });
      }

      // Slug: dùng slug admin nhập, hoặc pre-save hook tự generate từ name
      const newCategory = new Category({ name, slug, description });
      await newCategory.save();

      res
        .status(201)
        .json({ message: "Tạo danh mục thành công!", category: newCategory });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] PUT /api/categories/:id
  // ─────────────────────────────────────────────────────────────
  updateCategory: async (req, res) => {
    try {
      const { name, slug, description } = req.body;

      // Kiểm tra trùng name/slug với category khác
      if (name || slug) {
        const conflict = await Category.findOne({
          _id: { $ne: req.params.id },
          $or: [...(name ? [{ name }] : []), ...(slug ? [{ slug }] : [])],
        });
        if (conflict) {
          return res
            .status(400)
            .json({ message: "Tên hoặc slug đã được dùng bởi danh mục khác!" });
        }
      }

      const updated = await Category.findByIdAndUpdate(
        req.params.id,
        { name, slug, description },
        { new: true, runValidators: true },
      );

      if (!updated)
        return res.status(404).json({ message: "Không tìm thấy danh mục!" });

      res
        .status(200)
        .json({ message: "Cập nhật thành công!", category: updated });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] DELETE /api/categories/:id
  // ─────────────────────────────────────────────────────────────
  deleteCategory: async (req, res) => {
    try {
      const bookCount = await Book.countDocuments({ category: req.params.id });
      if (bookCount > 0) {
        return res.status(400).json({
          message: `Không thể xoá! Đang có ${bookCount} cuốn sách thuộc danh mục này.`,
        });
      }

      const deleted = await Category.findByIdAndDelete(req.params.id);
      if (!deleted)
        return res.status(404).json({ message: "Không tìm thấy danh mục!" });

      res.status(200).json({ message: "Đã xoá danh mục thành công!" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },
};

module.exports = categoryController;
