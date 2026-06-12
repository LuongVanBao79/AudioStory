// src/store/useDashboardStore.ts
import { create } from "zustand";
import type {
  DashboardData,
  DashboardRange,
  TrendingFilter,
} from "../types/dashboard";
import { dashboardService } from "../services/dashboardServices";

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  range: DashboardRange;
  trendingFilter: TrendingFilter; // ⚡ THÊM MỚI
  setRange: (range: DashboardRange) => void;
  setTrendingFilter: (filter: TrendingFilter) => void; // ⚡ THÊM MỚI
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  range: "7d",
  trendingFilter: "read", // Mặc định là lọc theo đọc nhiều

  setRange: (range) => {
    set({ range });
    get().fetchDashboardData();
  },

  setTrendingFilter: (filter) => {
    set({ trendingFilter: filter });
    get().fetchDashboardData(); // Tự động fetch lại khi đổi filter
  },

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { range, trendingFilter } = get();
      // Truyền cả 2 tham số xuống service
      const data = await dashboardService.getDashboardData(
        range,
        trendingFilter,
      );
      set({ data, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Đã xảy ra lỗi khi tải dữ liệu tổng quan",
        isLoading: false,
      });
    }
  },
}));
