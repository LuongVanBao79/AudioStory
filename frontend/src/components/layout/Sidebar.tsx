import { NavLink } from "react-router";
import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  Headphones,
  FolderTree,
  PenTool,
  Star,
  MessageSquare,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

const Sidebar = () => {
  const { logout } = useAuthStore();

  const menuGroups = [
    {
      title: "Tổng quan",
      items: [{ name: "Dashboard", icon: LayoutDashboard, path: "/" }],
    },
    {
      title: "Quản lý Nội dung",
      items: [
        { name: "Danh mục", icon: FolderTree, path: "/categories" },
        { name: "Tác giả", icon: PenTool, path: "/authors" },
        { name: "Sách & Chương", icon: BookOpen, path: "/books" },
      ],
    },
    {
      title: "Cộng đồng",
      items: [
        { name: "Đánh giá", icon: Star, path: "/reviews" },
        { name: "Bình luận", icon: MessageSquare, path: "/comments" },
      ],
    },
    {
      title: "Hệ thống",
      items: [{ name: "Người dùng", icon: Users, path: "/users" }],
    },
  ];

  return (
    <div className="w-full h-full bg-slate-900 text-slate-300 flex flex-col">
      {/* Logo
          FIX 3: h-16 → h-14  (match AdminLayout header height so top bar aligns) */}
      <div className="h-14 flex items-center px-6 bg-slate-950 border-b border-slate-800 flex-shrink-0">
        <Headphones className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
        <span className="text-base font-bold text-white tracking-wider truncate">
          AudioStory
        </span>
      </div>

      {/* Menu groups */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 px-4">
        {menuGroups.map((group, index) => (
          <div key={index}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-4">
              {group.title}
            </div>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                      isActive
                        ? "bg-indigo-600 text-white font-medium shadow-md"
                        : "hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex-shrink-0">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
