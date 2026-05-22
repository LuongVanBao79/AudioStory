// src/services/dashboard.service.ts
import axiosInstance from "../lib/axios"; // Đường dẫn tuỳ thuộc vào cấu trúc thư mục của bạn
import type { DashboardData, DashboardRange } from "@/types/dashboard.ts";

export const dashboardService = {
  getDashboardData: async (
    range: DashboardRange = "7d",
  ): Promise<DashboardData> => {
    return await axiosInstance.get(`/admin/dashboard?range=${range}`);
  },
};
