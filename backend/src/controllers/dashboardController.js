const Book = require("../models/Book");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Review = require("../models/Review");

const TIMEZONE = "Asia/Ho_Chi_Minh";

// Helper format ngày local
const toLocalDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// ── 7 ngày: group theo ngày ──────────────────────────────────────
const buildLast7Days = (commentCounts, reviewCounts) => {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = toLocalDateStr(date);
    const comments = commentCounts.find((c) => c._id === dateStr)?.count || 0;
    const reviews = reviewCounts.find((r) => r._id === dateStr)?.count || 0;
    return { day: days[date.getDay()], luotNghe: comments + reviews };
  });
};

// ── 4 tuần: group theo tuần ──────────────────────────────────────
const buildLast4Weeks = (commentCounts, reviewCounts) => {
  return Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (3 - i) * 7 - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startStr = toLocalDateStr(weekStart);
    const endStr = toLocalDateStr(weekEnd);

    // Cộng tất cả ngày trong tuần đó
    const comments = commentCounts
      .filter((c) => c._id >= startStr && c._id <= endStr)
      .reduce((sum, c) => sum + c.count, 0);
    const reviews = reviewCounts
      .filter((r) => r._id >= startStr && r._id <= endStr)
      .reduce((sum, r) => sum + r.count, 0);

    return { day: `Tuần ${i + 1}`, luotNghe: comments + reviews };
  });
};

// ── 12 tháng: group theo tháng ───────────────────────────────────
const buildLast12Months = (commentCounts, reviewCounts) => {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i), 1);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const comments = commentCounts.find((c) => c._id === monthStr)?.count || 0;
    const reviews = reviewCounts.find((r) => r._id === monthStr)?.count || 0;

    return { day: `Th${date.getMonth() + 1}`, luotNghe: comments + reviews };
  });
};

exports.getDashboardData = async (req, res) => {
  try {
    const range = req.query.range || "7d"; // "7d" | "4w" | "12m"

    // Tính mốc thời gian bắt đầu theo range
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    if (range === "7d") since.setDate(since.getDate() - 6);
    else if (range === "4w") since.setDate(since.getDate() - 27);
    else if (range === "12m") since.setMonth(since.getMonth() - 11);

    // Format group: ngày hoặc tháng
    const groupFormat = range === "12m" ? "%Y-%m" : "%Y-%m-%d";

    const [
      totalBooks,
      totalUsers,
      reportedCommentsCount,
      totalViewsObj,
      trendingBooksData,
      recentComments,
      recentReviews,
      dailyCommentCounts,
      dailyReviewCounts,
    ] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments(),
      Comment.countDocuments({ isReported: true }),
      Book.aggregate([
        { $group: { _id: null, total: { $sum: "$viewCount" } } },
      ]),
      Book.find()
        .sort({ viewCount: -1 })
        .limit(4)
        .select("title viewCount rating"),
      Comment.find()
        .sort({ createdAt: -1 })
        .limit(2)
        .populate("user", "username")
        .populate("book", "title"),
      Review.find()
        .sort({ createdAt: -1 })
        .limit(2)
        .populate("user", "username")
        .populate("book", "title"),

      Comment.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupFormat,
                date: "$createdAt",
                timezone: TIMEZONE,
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),

      Review.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupFormat,
                date: "$createdAt",
                timezone: TIMEZONE,
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalViews = totalViewsObj[0]?.total || 0;

    // Chọn builder theo range
    let dailyViews;
    if (range === "7d")
      dailyViews = buildLast7Days(dailyCommentCounts, dailyReviewCounts);
    else if (range === "4w")
      dailyViews = buildLast4Weeks(dailyCommentCounts, dailyReviewCounts);
    else dailyViews = buildLast12Months(dailyCommentCounts, dailyReviewCounts);

    const activities = [
      ...recentComments.map((c) => ({
        id: `cmt_${c._id}`,
        user: c.user.username,
        action: "vừa bình luận về",
        target: c.book.title,
        time: c.createdAt,
        type: "comment",
      })),
      ...recentReviews.map((r) => ({
        id: `rev_${r._id}`,
        user: r.user.username,
        action: `đã đánh giá ${r.rating} sao cho`,
        target: r.book.title,
        time: r.createdAt,
        type: "review",
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    res.status(200).json({
      stats: { totalBooks, totalUsers, totalViews, reportedCommentsCount },
      trendingBooks: trendingBooksData,
      recentActivities: activities,
      dailyViews,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
