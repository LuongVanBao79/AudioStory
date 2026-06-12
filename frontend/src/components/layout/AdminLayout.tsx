import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import Sidebar from "./Sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  MessageSquare,
  Star,
  AlertTriangle,
} from "lucide-react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/categories": "Danh mục",
  "/authors": "Tác giả",
  "/books": "Sách & Chương",
  "/reviews": "Đánh giá",
  "/comments": "Bình luận",
  "/users": "Người dùng",
};

// ── Helper: Icon theo loại thông báo ──────────────────────────
const NotifIcon = ({ type }: { type: string }) => {
  if (type === "new_comment")
    return <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />;
  if (type === "new_review")
    return <Star className="h-3.5 w-3.5 text-yellow-500" />;
  if (type === "reported")
    return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
  return null;
};

// ── Helper: Label theo loại thông báo ─────────────────────────
const notifLabel = (type: string, bookTitle: string, reportCount?: number) => {
  if (type === "new_comment") return `Bình luận mới trong "${bookTitle}"`;
  if (type === "new_review") return `Đánh giá mới cho "${bookTitle}"`;
  if (type === "reported")
    return `Bình luận bị báo cáo ${reportCount ? `(${reportCount} lần)` : ""} trong "${bookTitle}"`;
  return bookTitle;
};

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();

  const { notifications, unreadCount, init, markAsRead, markAllAsRead } =
    useNotificationStore();

  const navigate = useNavigate();

  const handleNotifClick = (notif: any) => {
    markAsRead(notif._id);
    setNotifOpen(false);
    if (notif.type === "new_review") navigate("/reviews");
    else if (notif.type === "new_comment") navigate("/comments");
    else if (notif.type === "reported") navigate("/comments?filter=reported");
  };

  const pageTitle =
    PAGE_TITLES[location.pathname] ??
    PAGE_TITLES["/" + location.pathname.split("/")[1]] ??
    "Admin";

  // Khởi tạo SSE khi admin mở web, cleanup khi unmount
  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, []);

  const closeAll = () => {
    setDropdownOpen(false);
    setNotifOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* ── Sidebar ── */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
          sidebarOpen ? "w-64" : "w-0"
        }`}
      >
        <Sidebar />
      </div>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* ── Header ── */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-3 px-4 z-20 flex-shrink-0">
          {/* Toggle sidebar */}
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label={sidebarOpen ? "Đóng sidebar" : "Mở sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </button>

          {/* ── Page title ── */}
          <h1 className="text-sm font-semibold text-slate-700 hidden sm:block">
            {pageTitle}
          </h1>

          {/* Divider mỏng giữa title và search */}
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />

          {/* Search bar */}
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-8 pr-10 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg
                         text-slate-700 placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                         transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-white border border-slate-200 rounded px-1 py-0.5 font-sans">
              ⌘K
            </kbd>
          </div>

          <div className="flex-1" />

          {/* ── Right controls ── */}
          <div className="flex items-center gap-1">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen((p) => !p);
                  setDropdownOpen(false);
                }}
                className="relative p-2 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Thông báo"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 ring-2 ring-white flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white leading-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
                  {/* Header dropdown */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Thông báo
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                          {unreadCount} mới
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>

                  {/* Danh sách thông báo */}
                  <ul className="max-h-[360px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <Bell className="h-8 w-8 mb-2 opacity-30" />
                        <span className="text-xs">Chưa có thông báo nào</span>
                      </li>
                    ) : (
                      notifications.map((notif) => (
                        <li
                          key={notif._id}
                          onClick={() => handleNotifClick(notif)}
                          className={`flex gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors last:border-b-0 ${
                            !notif.isRead ? "bg-indigo-50/50" : ""
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                              notif.type === "reported"
                                ? "bg-red-100"
                                : notif.type === "new_review"
                                  ? "bg-yellow-100"
                                  : "bg-indigo-100"
                            }`}
                          >
                            <NotifIcon type={notif.type} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700 leading-relaxed truncate">
                              {notifLabel(
                                notif.type,
                                notif.bookTitle,
                                notif.reportCount,
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              <span className="font-medium">
                                {notif.userName}:
                              </span>{" "}
                              {notif.preview}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {formatDistanceToNow(new Date(notif.createdAt), {
                                addSuffix: true,
                                locale: vi,
                              })}
                            </p>
                          </div>

                          {!notif.isRead && (
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                          )}
                        </li>
                      ))
                    )}
                  </ul>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="w-full text-xs text-center text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Xem tất cả →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setDropdownOpen((p) => !p);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {(user?.name ?? "A")[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate hidden sm:block">
                  {user?.name || "Admin"}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden py-1">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {user?.email || "admin@example.com"}
                    </p>
                  </div>
                  <div className="py-1">
                    {[
                      { icon: User, label: "Hồ sơ cá nhân" },
                      { icon: Settings, label: "Cài đặt" },
                    ].map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Icon className="h-4 w-4 text-slate-400" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto px-6 py-4">
          <Outlet />
        </main>
      </div>

      {/* Click-away backdrop — đóng tất cả dropdown khi click ra ngoài */}
      {(dropdownOpen || notifOpen) && (
        <div className="fixed inset-0 z-10" onClick={closeAll} />
      )}
    </div>
  );
};

export default AdminLayout;
