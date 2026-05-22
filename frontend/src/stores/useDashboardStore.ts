// src/store/useDashboardStore.ts
import { create } from "zustand";
import type { DashboardData, DashboardRange } from "../types/dashboard";
import { dashboardService } from "../services/dashboardServices";

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  range: DashboardRange;
  setRange: (range: DashboardRange) => void;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  range: "7d",

  setRange: (range) => {
    set({ range });
    get().fetchDashboardData(); // tự fetch lại khi đổi range
  },

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await dashboardService.getDashboardData(get().range);
      set({ data, isLoading: false });
    } catch (error: any) {
      set({
        error: error?.message || "Đã xảy ra lỗi khi tải dữ liệu tổng quan",
        isLoading: false,
      });
    }
  },
}));
