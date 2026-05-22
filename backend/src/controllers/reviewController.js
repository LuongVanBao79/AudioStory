const Review = require("../models/Review");
const Book = require("../models/Book");
const Notification = require("../models/Notification"); // ← THÊM MỚI
const { pushToAllAdmins } = require("../sse/sseManager"); // ← THÊM MỚI

const updateBookAverageRating = async (bookId) => {
  try {
    const reviews = await Review.find({ book: bookId, isHidden: false });
    const avgRating =
      reviews.length === 0
        ? 0
        : Number(
            (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            ).toFixed(1),
          );
    await Book.findByIdAndUpdate(bookId, { rating: avgRating });
  } catch (error) {
    console.error("[updateBookAverageRating]", error);
  }
};

const reviewController = {
  // ─────────────────────────────────────────────────────────────
  // [Mobile] GET /api/reviews/book/:bookId
  // ─────────────────────────────────────────────────────────────
  getReviewsByBook: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const total = await Review.countDocuments({
        book: req.params.bookId,
        isHidden: false,
      });

      const reviews = await Review.find({
        book: req.params.bookId,
        isHidden: false,
      })
        .populate("user", "username avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      res.status(200).json({
        data: reviews,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        hasMore: skip + reviews.length < total,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy đánh giá!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] GET /api/reviews/my-review/:bookId
  // ─────────────────────────────────────────────────────────────
  getMyReview: async (req, res) => {
    try {
      const review = await Review.findOne({
        user: req.user._id,
        book: req.params.bookId,
      }).lean();

      res.status(200).json({ hasReviewed: !!review, data: review || null });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] POST /api/reviews  (cần login)
  // ⚡ Đã thêm: push SSE notification đến admin sau khi tạo review
  // ─────────────────────────────────────────────────────────────
  createReview: async (req, res) => {
    try {
      const { book, rating, content } = req.body;

      if (!book || !rating || !content) {
        return res
          .status(400)
          .json({ message: "Vui lòng điền đầy đủ thông tin!" });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Số sao phải từ 1 đến 5!" });
      }

      const existingBook = await Book.findById(book).lean();
      if (!existingBook) {
        return res.status(404).json({ message: "Không tìm thấy sách!" });
      }

      const existing = await Review.findOne({ user: req.user._id, book });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Bạn đã đánh giá cuốn sách này rồi!" });
      }

      const newReview = await Review.create({
        user: req.user._id,
        book,
        rating,
        content,
      });

      await updateBookAverageRating(book);

      const populated = await newReview.populate("user", "username avatar");

      // ── ⚡ THÊM MỚI: Tạo notification + push SSE ──────────────
      const notifData = {
        type: "new_review",
        bookTitle: existingBook.title,
        bookId: book,
        userName: populated.user?.username || "Người dùng",
        userId: req.user._id,
        preview: `${rating} sao — ${content.slice(0, 60)}`,
        targetId: newReview._id,
      };

      const savedNotif = await Notification.create(notifData);
      pushToAllAdmins({
        ...notifData,
        _id: savedNotif._id,
        createdAt: savedNotif.createdAt,
      });
      // ────────────────────────────────────────────────────────────

      res.status(201).json({
        message: "Cảm ơn bạn đã đánh giá!",
        data: populated,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tạo đánh giá!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] PUT /api/reviews/:id
  // ─────────────────────────────────────────────────────────────
  updateReview: async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review)
        return res.status(404).json({ message: "Không tìm thấy đánh giá!" });

      if (review.user.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền sửa đánh giá này!" });
      }

      const { rating, content } = req.body;
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: "Số sao phải từ 1 đến 5!" });
      }

      const updated = await Review.findByIdAndUpdate(
        req.params.id,
        { rating, content },
        { new: true },
      ).populate("user", "username avatar");

      await updateBookAverageRating(review.book);

      res
        .status(200)
        .json({ message: "Cập nhật đánh giá thành công!", data: updated });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật đánh giá!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile + Admin] DELETE /api/reviews/:id
  // ─────────────────────────────────────────────────────────────
  deleteReview: async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review)
        return res.status(404).json({ message: "Không tìm thấy đánh giá!" });

      const isOwner = review.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền xoá đánh giá này!" });
      }

      const bookId = review.book;
      await Review.findByIdAndDelete(req.params.id);
      await updateBookAverageRating(bookId);

      res.status(200).json({ message: "Đã xoá đánh giá thành công!" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] GET /api/reviews/admin/all
  // ─────────────────────────────────────────────────────────────
  getAllReviewsForAdmin: async (req, res) => {
    try {
      const { page = 1, limit = 20, isHidden } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const filter = {};

      if (isHidden !== undefined) filter.isHidden = isHidden === "true";

      const total = await Review.countDocuments(filter);
      const reviews = await Review.find(filter)
        .populate("user", "username email avatar")
        .populate("book", "title coverImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      res.status(200).json({
        data: reviews,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] PATCH /api/reviews/:id/toggle-hide
  // ─────────────────────────────────────────────────────────────
  toggleHideReview: async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review)
        return res.status(404).json({ message: "Không tìm thấy đánh giá!" });

      review.isHidden = !review.isHidden;
      await review.save();
      await updateBookAverageRating(review.book);

      res.status(200).json({
        message: review.isHidden ? "Đã ẩn đánh giá!" : "Đã khôi phục đánh giá!",
        data: review,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },
};

module.exports = reviewController;
