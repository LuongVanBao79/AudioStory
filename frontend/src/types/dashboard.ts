// Thêm DailyView vào type hiện có của bạn
// Nếu file types/dashboard.ts chưa có interface này thì thêm vào

export interface DailyView {
  day: string; // "T2", "T3", ... "CN"
  luotNghe: number; // Tổng hoạt động trong ngày
}
export type DashboardRange = "7d" | "4w" | "12m";

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
  dailyViews: DailyView[]; // ⚡ THÊM MỚI
}
