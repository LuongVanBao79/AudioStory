const Comment = require("../models/Comment");
const Notification = require("../models/Notification"); // ← THÊM MỚI
const { pushToAllAdmins } = require("../sse/sseManager"); // ← THÊM MỚI

const commentController = {
  // ─────────────────────────────────────────────────────────────
  // [Mobile] GET /api/comments/chapter/:chapterId
  // ─────────────────────────────────────────────────────────────
  getCommentsByChapter: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const total = await Comment.countDocuments({
        chapter: req.params.chapterId,
        isHidden: false,
        parentComment: null,
      });

      const comments = await Comment.find({
        chapter: req.params.chapterId,
        isHidden: false,
        parentComment: null,
      })
        .populate("user", "username avatar role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      const commentIds = comments.map((c) => c._id);
      const replies = await Comment.find({
        parentComment: { $in: commentIds },
        isHidden: false,
      })
        .populate("user", "username avatar role")
        .sort({ createdAt: 1 })
        .lean();

      const commentMap = comments.map((comment) => ({
        ...comment,
        replies: replies.filter(
          (r) => r.parentComment.toString() === comment._id.toString(),
        ),
      }));

      res.status(200).json({
        data: commentMap,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        hasMore: skip + comments.length < total,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy bình luận!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] POST /api/comments  (cần login)
  // ⚡ Đã thêm: push SSE notification đến admin sau khi tạo comment
  // ─────────────────────────────────────────────────────────────
  createComment: async (req, res) => {
    try {
      const { book, chapter, content, parentComment } = req.body;

      if (!book || !chapter || !content?.trim()) {
        return res
          .status(400)
          .json({ message: "Vui lòng điền đầy đủ thông tin!" });
      }

      if (parentComment) {
        const parent = await Comment.findById(parentComment);
        if (!parent) {
          return res
            .status(404)
            .json({ message: "Không tìm thấy bình luận gốc!" });
        }
        if (parent.parentComment) {
          return res
            .status(400)
            .json({ message: "Chỉ cho phép trả lời 1 cấp!" });
        }
      }

      const newComment = await Comment.create({
        user: req.user._id,
        book,
        chapter,
        content: content.trim(),
        parentComment: parentComment || null,
      });

      const populated = await Comment.findById(newComment._id)
        .populate("user", "username avatar role")
        .populate("book", "title")
        .lean();

      // ── ⚡ THÊM MỚI: Tạo notification + push SSE ──────────────
      const notifData = {
        type: "new_comment",
        bookTitle: populated.book?.title || "Không rõ",
        bookId: book,
        userName: populated.user?.username || "Người dùng",
        userId: req.user._id,
        preview: content.trim().slice(0, 80),
        targetId: newComment._id,
      };

      // Lưu vào DB (để hiển thị lại khi admin mở tab mới)
      const savedNotif = await Notification.create(notifData);

      // Đẩy realtime đến tất cả admin đang mở web
      pushToAllAdmins({
        ...notifData,
        _id: savedNotif._id,
        createdAt: savedNotif.createdAt,
      });
      // ────────────────────────────────────────────────────────────

      res.status(201).json({ message: "Đã gửi bình luận!", data: populated });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tạo bình luận!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] PUT /api/comments/:id  (cần login)
  // ─────────────────────────────────────────────────────────────
  updateComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment)
        return res.status(404).json({ message: "Không tìm thấy bình luận!" });

      if (comment.user.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền sửa bình luận này!" });
      }

      const { content } = req.body;
      if (!content?.trim()) {
        return res
          .status(400)
          .json({ message: "Nội dung không được để trống!" });
      }

      const updated = await Comment.findByIdAndUpdate(
        req.params.id,
        { content: content.trim() },
        { new: true },
      ).populate("user", "username avatar role");

      res
        .status(200)
        .json({ message: "Cập nhật bình luận thành công!", data: updated });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật bình luận!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile + Admin] DELETE /api/comments/:id
  // ─────────────────────────────────────────────────────────────
  deleteComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment)
        return res.status(404).json({ message: "Không tìm thấy bình luận!" });

      const isOwner = comment.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền xoá bình luận này!" });
      }

      await Comment.deleteMany({ parentComment: req.params.id });
      await Comment.findByIdAndDelete(req.params.id);

      res.status(200).json({ message: "Đã xoá bình luận thành công!" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] PATCH /api/comments/:id/report
  // ⚡ Đã thêm: push SSE notification khi comment bị báo cáo
  // ─────────────────────────────────────────────────────────────
  reportComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id)
        .populate("book", "title")
        .populate("user", "username");

      if (!comment)
        return res.status(404).json({ message: "Không tìm thấy bình luận!" });

      const alreadyReported = comment.reportedBy.some(
        (id) => id.toString() === req.user._id.toString(),
      );
      if (alreadyReported) {
        return res
          .status(400)
          .json({ message: "Bạn đã báo cáo bình luận này rồi!" });
      }

      if (comment.user._id.toString() === req.user._id.toString()) {
        return res
          .status(400)
          .json({ message: "Bạn không thể báo cáo bình luận của chính mình!" });
      }

      comment.reportedBy.push(req.user._id);
      comment.isReported = true;
      await comment.save();

      // ── ⚡ THÊM MỚI: Push SSE khi bị báo cáo ─────────────────
      const notifData = {
        type: "reported",
        bookTitle: comment.book?.title || "Không rõ",
        bookId: comment.book?._id,
        userName: comment.user?.username || "Người dùng",
        userId: comment.user?._id,
        preview: comment.content.slice(0, 80),
        targetId: comment._id,
        reportCount: comment.reportedBy.length,
      };

      const savedNotif = await Notification.create(notifData);
      pushToAllAdmins({
        ...notifData,
        _id: savedNotif._id,
        createdAt: savedNotif.createdAt,
      });
      // ────────────────────────────────────────────────────────────

      res.status(200).json({
        message: "Đã báo cáo vi phạm! Admin sẽ kiểm duyệt sớm.",
        reportCount: comment.reportedBy.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] GET /api/comments/admin/all
  // ─────────────────────────────────────────────────────────────
  getAllCommentsForAdmin: async (req, res) => {
    try {
      const { page = 1, limit = 20, isReported, isHidden } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const filter = {};

      if (isReported !== undefined) filter.isReported = isReported === "true";
      if (isHidden !== undefined) filter.isHidden = isHidden === "true";

      const total = await Comment.countDocuments(filter);
      const comments = await Comment.find(filter)
        .populate("user", "username email avatar")
        .populate("book", "title")
        .populate("chapter", "title chapterNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      res.status(200).json({
        data: comments,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] PATCH /api/comments/:id/toggle-hide
  // ─────────────────────────────────────────────────────────────
  toggleHideComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment)
        return res.status(404).json({ message: "Không tìm thấy bình luận!" });

      comment.isHidden = !comment.isHidden;
      if (comment.isHidden) {
        comment.isReported = false;
        comment.reportedBy = [];
      }

      await comment.save();

      res.status(200).json({
        message: comment.isHidden
          ? "Đã ẩn bình luận!"
          : "Đã khôi phục bình luận!",
        data: comment,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },
};

module.exports = commentController;
