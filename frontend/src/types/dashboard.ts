// src/types/dashboard.ts

export type DashboardRange = "7d" | "4w" | "12m";
// ⚡ THÊM MỚI: Type cho bộ lọc Top thịnh hành
export type TrendingFilter = "read" | "listen" | "rating";

// ⚡ SỬA: Đổi DailyView thành ChartDataPoint cho đúng với API trả về
export interface ChartDataPoint {
  label: string; // Trước đây là "day"
  hoatDong: number; // Trước đây là "luotNghe"
  date?: string; // (Tùy chọn) trả về thêm từ API cho mốc 7 ngày
}

export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalViews: number;
  reportedCommentsCount: number;
}

export interface TrendingBook {
  _id: string;
  title: string;
  viewCount: number;
  listenCount: number; // ⚡ THÊM MỚI: Cần cho bộ lọc "Nghe nhiều"
  rating: number;
}

export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: "comment" | "review" | "system" | "alert";
}

export interface DashboardData {
  stats: DashboardStats;
  trendingBooks: TrendingBook[];
  recentActivities: RecentActivity[];
  chartData: ChartDataPoint[]; // ⚡ SỬA: Đổi từ dailyViews thành chartData
}
