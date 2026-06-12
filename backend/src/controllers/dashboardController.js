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

// ── 7 ngày: group theo ngày trong tuần ───────────────────────────
const buildLast7Days = (activityCounts) => {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = toLocalDateStr(date);
    const count = activityCounts.find((c) => c._id === dateStr)?.count || 0;
    return { label: days[date.getDay()], date: dateStr, hoatDong: count };
  });
};

// ── 4 tuần: group theo tuần trong tháng ───────────────────────────
const buildLast4Weeks = (activityCounts) => {
  return Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (3 - i) * 7 - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startStr = toLocalDateStr(weekStart);
    const endStr = toLocalDateStr(weekEnd);

    const count = activityCounts
      .filter((c) => c._id >= startStr && c._id <= endStr)
      .reduce((sum, c) => sum + c.count, 0);

    return { label: `Tuần ${i + 1}`, hoatDong: count };
  });
};

// ── 12 tháng: group theo tháng trong năm ──────────────────────────
const buildLast12Months = (activityCounts) => {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i), 1);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const count = activityCounts.find((c) => c._id === monthStr)?.count || 0;

    return { label: `Th${date.getMonth() + 1}`, hoatDong: count };
  });
};

exports.getDashboardData = async (req, res) => {
  try {
    // Nhận params từ Frontend
    const range = req.query.range || "7d"; // "7d" | "4w" | "12m"
    const trendingFilter = req.query.trendingFilter || "read"; // "read" | "listen" | "rating"

    // 1. Xử lý Logic thời gian cho biểu đồ hoạt động
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    if (range === "7d") since.setDate(since.getDate() - 6);
    else if (range === "4w") since.setDate(since.getDate() - 27);
    else if (range === "12m") since.setMonth(since.getMonth() - 11);

    const groupFormat = range === "12m" ? "%Y-%m" : "%Y-%m-%d";

    // 2. Xử lý Logic sắp xếp cho Top thịnh hành
    let trendingSort = { viewCount: -1 }; // Mặc định: Đọc nhiều
    if (trendingFilter === "listen") {
      trendingSort = { listenCount: -1 }; // Nghe nhiều (Lưu ý: Model Book cần có field listenCount)
    } else if (trendingFilter === "rating") {
      trendingSort = { rating: -1, viewCount: -1 }; // Đánh giá cao (nếu rating bằng nhau thì ưu tiên view)
    }

    // 3. Chạy Promise.all để tối ưu hiệu năng
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

      // Top 10 thịnh hành với điều kiện sort động
      Book.find()
        .sort(trendingSort)
        .limit(10) // Thay đổi từ 4 lên 10
        .select("title viewCount listenCount rating"), // Lấy thêm listenCount trả về UI

      Comment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "username")
        .populate("book", "title"),
      Review.find()
        .sort({ createdAt: -1 })
        .limit(5)
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

    // 4. Gộp data hoạt động (Comments + Reviews)
    // Để code helper gọn hơn, ta gộp tổng hoạt động theo ngày/tháng trước khi đưa vào helper
    const mergedActivities = [...dailyCommentCounts];
    dailyReviewCounts.forEach((review) => {
      const existing = mergedActivities.find((a) => a._id === review._id);
      if (existing) existing.count += review.count;
      else mergedActivities.push(review);
    });

    // Chọn builder theo range
    let chartData;
    if (range === "7d") chartData = buildLast7Days(mergedActivities);
    else if (range === "4w") chartData = buildLast4Weeks(mergedActivities);
    else chartData = buildLast12Months(mergedActivities);

    // 5. Chuẩn bị danh sách hoạt động gần đây
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
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10); // Lấy 10 hoạt động mới nhất

    // 6. Trả về kết quả
    res.status(200).json({
      stats: { totalBooks, totalUsers, totalViews, reportedCommentsCount },
      trendingBooks: trendingBooksData,
      recentActivities: activities,
      chartData, // Đã đổi tên từ dailyViews thành chartData cho đúng nghĩa
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
