// src/services/dashboard.service.ts
import axiosInstance from "../lib/axios";
import type {
  DashboardData,
  DashboardRange,
  TrendingFilter,
} from "@/types/dashboard"; // Bỏ .ts ở cuối

export const dashboardService = {
  getDashboardData: async (
    range: DashboardRange = "7d",
    trendingFilter: TrendingFilter = "read", // ⚡ THÊM MỚI
  ): Promise<DashboardData> => {
    // Sử dụng params object của axios để code clean hơn
    return await axiosInstance.get(`/admin/dashboard`, {
      params: {
        range,
        trendingFilter,
      },
    });
  },
};
