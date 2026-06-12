import { useEffect } from "react";
import {
  Headphones,
  BookOpen,
  Users,
  AlertCircle,
  PlayCircle,
  MessageSquare,
  Star,
  Clock,
} from "lucide-react";
import moment from "moment";
import { useDashboardStore } from "../stores/useDashboardStore"; // Đảm bảo đường dẫn đúng
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Custom Tooltip cho biểu đồ ────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-sm">
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="text-indigo-600 font-bold mt-0.5">
          {payload[0].value} hoạt động
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const {
    data,
    isLoading,
    error,
    range,
    setRange,
    trendingFilter,
    setTrendingFilter,
    fetchDashboardData,
  } = useDashboardStore();

  // Chỉ cần fetch lần đầu
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Các nút filter
  const RANGE_OPTIONS = [
    { value: "7d", label: "7 ngày" },
    { value: "4w", label: "4 tuần" },
    { value: "12m", label: "12 tháng" },
  ] as const;

  const TRENDING_OPTIONS = [
    { value: "read", label: "Đọc nhiều" },
    { value: "listen", label: "Nghe nhiều" },
    { value: "rating", label: "Đánh giá cao" },
  ] as const;

  if (isLoading && !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-indigo-600 font-medium animate-pulse">
          Đang tải dữ liệu hệ thống...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-rose-500">
        {error}
      </div>
    );
  }

  const stats = [
    {
      title: "Tổng số Sách",
      value: data?.stats.totalBooks || 0,
      increase: "Cập nhật liên tục",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Tổng lượt nghe/xem",
      value: data?.stats.totalViews || 0,
      increase: "Toàn hệ thống",
      icon: Headphones,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      title: "Tổng người dùng",
      value: data?.stats.totalUsers || 0,
      increase: "Hội viên đã đăng ký",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Cần kiểm duyệt",
      value: data?.stats.reportedCommentsCount || 0,
      increase: "Bình luận bị báo cáo",
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
  ];

  // Tính tổng hoạt động động theo range để hiển thị
  const totalActivity =
    data?.chartData?.reduce((sum, d) => sum + d.hoatDong, 0) || 0;
  const rangeLabelText =
    range === "7d"
      ? "7 ngày qua"
      : range === "4w"
        ? "4 tuần qua"
        : "12 tháng qua";

  return (
    <div className="space-y-4">
      {/* 4 THẺ CHỈ SỐ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div
              className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0 ${stat.bg}`}
            >
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{stat.increase}</p>
            </div>
          </div>
        ))}
      </div>

      {/* BIỂU ĐỒ & RANKING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* BIỂU ĐỒ — Recharts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Biểu đồ Hoạt động
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Bình luận & đánh giá trong {rangeLabelText}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-600">
                {totalActivity.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">tổng hoạt động</p>
            </div>
          </div>

          <div className="flex gap-1 mb-4">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  range === opt.value
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {data?.chartData && data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={data.chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barSize={range === "12m" ? 20 : 32} // Cân đối lại kích thước cột nếu hiện 12 tháng
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#EEF2FF", radius: 6 }}
                />
                <Bar dataKey="hoatDong" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">
              Chưa có dữ liệu hoạt động trong {rangeLabelText}
            </div>
          )}
        </div>

        {/* TOP THỊNH HÀNH */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Top Thịnh hành
            </h2>
            {/* 3 Nút Filter Top Thịnh Hành */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {TRENDING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTrendingFilter(opt.value)}
                  className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                    trendingFilter === opt.value
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Danh sách 10 cuốn sách có Scrollbar */}
          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar flex-1">
            {data?.trendingBooks?.map((book, index) => (
              <div key={book._id} className="flex items-center gap-3">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    index === 0
                      ? "bg-amber-100 text-amber-600"
                      : index === 1
                        ? "bg-slate-200 text-slate-600"
                        : index === 2
                          ? "bg-orange-100 text-orange-600"
                          : "bg-slate-50 text-slate-400"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold text-slate-900 truncate"
                    title={book.title}
                  >
                    {book.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    {/* Hiển thị Icon phù hợp với bộ lọc */}
                    {trendingFilter === "listen" ? (
                      <span className="flex items-center text-indigo-500">
                        <Headphones className="h-3 w-3 mr-1" />
                        {book.listenCount?.toLocaleString() || 0}
                      </span>
                    ) : (
                      <span className="flex items-center text-blue-500">
                        <PlayCircle className="h-3 w-3 mr-1" />
                        {book.viewCount?.toLocaleString() || 0}
                      </span>
                    )}

                    <span className="flex items-center">
                      <Star className="h-3 w-3 mr-1 text-amber-400 fill-amber-400" />
                      {book.rating || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {(!data?.trendingBooks || data.trendingBooks.length === 0) && (
              <div className="text-center text-slate-400 text-sm py-4">
                Chưa có dữ liệu sách
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HOẠT ĐỘNG MỚI NHẤT */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">
          Hoạt động mới nhất
        </h2>
        <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {data?.recentActivities?.map((activity) => (
            <div
              key={activity.id}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-3"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                {activity.type === "comment" && (
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                )}
                {activity.type === "review" && (
                  <Star className="h-4 w-4 text-amber-500" />
                )}
              </div>

              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-lg border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900 text-sm">
                    {activity.user}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {moment(activity.time).fromNow()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 truncate">
                  {activity.action}{" "}
                  <span className="font-medium text-indigo-600">
                    {activity.target}
                  </span>
                </p>
              </div>
            </div>
          ))}

          {(!data?.recentActivities || data.recentActivities.length === 0) && (
            <div className="text-center text-slate-400 text-sm py-4">
              Chưa có hoạt động nào gần đây
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
