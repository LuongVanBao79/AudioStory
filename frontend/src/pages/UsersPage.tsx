import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UserPlus,
  Edit,
  Trash2,
  Search,
  Shield,
  User,
  Ban,
  CheckCircle2,
  Lock,
  Mail,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useUserStore } from "@/stores/useUserStore";
import type { User as UserType } from "@/types/user";

const userSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  role: z.string(),
  password: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

const UsersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // ── Filter state ──
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">(
    "all",
  );

  const {
    users,
    isLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Lọc client-side — users ít nên không cần server-side
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (users || []).filter((u) => {
      const matchSearch =
        !q ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const hasFilter = search || roleFilter !== "all" || statusFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", role: "user", password: "" },
  });

  useEffect(() => {
    if (selectedUser) {
      form.reset({
        name: selectedUser.username,
        email: selectedUser.email,
        role: selectedUser.role,
        password: "",
      });
    } else {
      form.reset({ name: "", email: "", role: "user", password: "" });
    }
  }, [selectedUser, isModalOpen]);

  const handleAdd = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };
  const handleEdit = (user: UserType) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const onSubmit = async (values: UserFormValues) => {
    try {
      const submitData = { ...values };
      if (selectedUser && !submitData.password) delete submitData.password;
      if (selectedUser) {
        await updateUser(selectedUser._id, submitData);
        toast.success("Cập nhật tài khoản thành công!");
      } else {
        await createUser(submitData);
        toast.success("Tạo tài khoản mới thành công!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!",
      );
    }
  };

  const handleToggleStatus = async (user: UserType) => {
    try {
      await toggleUserStatus(user._id);
      toast.success(
        user.status === "active"
          ? `Đã khoá tài khoản: ${user.username}`
          : `Đã mở khoá tài khoản: ${user.username}`,
      );
    } catch {
      toast.error("Lỗi khi thay đổi trạng thái!");
    }
  };

  const handleDelete = async (user: UserType) => {
    if (
      !window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${user.username}?`)
    )
      return;
    try {
      await deleteUser(user._id);
      toast.success("Đã xóa tài khoản thành công!");
    } catch {
      toast.error("Lỗi khi xóa tài khoản!");
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg
                       text-slate-700 placeholder-slate-400 shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter: Role */}
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}
        >
          <SelectTrigger className="w-40 bg-white border-slate-200 text-sm shadow-sm">
            <SelectValue placeholder="Tất cả vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="admin">Quản trị viên</SelectItem>
            <SelectItem value="user">Độc giả</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter: Status */}
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger className="w-40 bg-white border-slate-200 text-sm shadow-sm">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="banned">Đã khoá</SelectItem>
          </SelectContent>
        </Select>

        {/* Xoá bộ lọc */}
        {hasFilter && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700
                       border border-slate-200 bg-white rounded-lg px-3 py-2 shadow-sm transition-colors"
          >
            <X className="h-3 w-3" /> Xoá bộ lọc
          </button>
        )}

        {/* Counter */}
        {!isLoading && (
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {filtered.length} / {(users || []).length} người dùng
          </span>
        )}

        <div className="flex-1" />

        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={handleAdd}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Thêm tài khoản
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[250px]">Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right pr-6 w-[150px]">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-slate-500"
                >
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-slate-500"
                >
                  <div className="flex flex-col items-center">
                    <User className="h-10 w-10 text-slate-300 mb-2" />
                    <p className="text-sm">
                      {hasFilter
                        ? "Không tìm thấy người dùng phù hợp."
                        : "Chưa có người dùng nào."}
                    </p>
                    {hasFilter && (
                      <button
                        onClick={clearFilters}
                        className="mt-1 text-xs text-indigo-500 hover:underline"
                      >
                        Xoá bộ lọc
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow
                  key={user._id}
                  className={`hover:bg-slate-50 transition-colors ${user.status === "banned" ? "bg-red-50/40 opacity-80" : ""}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 uppercase border
                        ${user.role === "admin" ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}
                      >
                        {(user.username || user.email || "?").charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">
                          {user.username || "Chưa cập nhật"}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center mt-0.5">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email || "Chưa có email"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {user.role === "admin" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Shield className="h-3 w-3 mr-1.5" /> Quản trị viên
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <User className="h-3 w-3 mr-1.5" /> Độc giả
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-slate-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>

                  <TableCell className="text-center">
                    {user.status === "active" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                        Đã khoá
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`h-8 w-8 ${
                          user.status === "active"
                            ? "text-amber-600 hover:bg-amber-50 border-amber-200"
                            : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                        }`}
                        title={
                          user.status === "active"
                            ? "Khoá tài khoản"
                            : "Mở khoá tài khoản"
                        }
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.status === "active" ? (
                          <Ban className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => handleDelete(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Chỉnh sửa Tài khoản" : "Tạo Tài khoản mới"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Cập nhật thông tin hoặc thay đổi quyền hạn của người dùng."
                : "Cấp tài khoản mới để truy cập hệ thống."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Họ và Tên <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Nguyễn Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Địa chỉ Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="VD: email@example.com"
                        {...field}
                        disabled={!!selectedUser}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phân quyền <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn quyền" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">Độc giả (User)</SelectItem>
                          <SelectItem value="admin">
                            Quản trị viên (Admin)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mật khẩu{" "}
                        {selectedUser && (
                          <span className="text-xs text-slate-400 font-normal">
                            (Bỏ trống nếu không đổi)
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4 space-x-2 border-t mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {selectedUser ? "Lưu thay đổi" : "Tạo tài khoản"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
