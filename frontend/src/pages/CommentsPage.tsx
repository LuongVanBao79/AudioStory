// src/pages/CommentsPage.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import {
  EyeOff,
  CheckCircle2,
  Trash2,
  Search,
  AlertTriangle,
  ShieldAlert,
  Eye,
  BookOpen,
  MessageSquare,
  Calendar,
  User,
  X,
  Ban,
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { CommentItem } from "@/types/comment";
import { useCommentStore } from "@/stores/useCommentStore";

const CommentsPage = () => {
  const {
    comments,
    isLoading,
    fetchAdminComments,
    toggleHideComment,
    deleteComment,
  } = useCommentStore();

  // === STATE TÌM KIẾM & LỌC ===
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "hidden" | "visible"
  >("all");
  const [reportedOnly, setReportedOnly] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("filter") === "reported") {
      setReportedOnly(true);
      setSearchParams({});
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAdminComments();
  }, [fetchAdminComments]);

  // === LỌC DỮ LIỆU ===
  const filteredComments = (comments || []).filter((comment) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      comment.user?.username?.toLowerCase().includes(searchLower) ||
      comment.content?.toLowerCase().includes(searchLower) ||
      comment.book?.title?.toLowerCase().includes(searchLower);

    let matchStatus = true;
    if (statusFilter === "hidden") matchStatus = comment.isHidden === true;
    if (statusFilter === "visible") matchStatus = comment.isHidden === false;

    const matchReported = reportedOnly ? comment.isReported === true : true;

    return matchSearch && matchStatus && matchReported;
  });

  // === STATE MODAL CHI TIẾT ===
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<CommentItem | null>(
    null,
  );
  const [isActioning, setIsActioning] = useState(false);

  const handleViewDetail = (comment: CommentItem) => {
    setSelectedComment(comment);
    setIsDetailOpen(true);
  };

  // === ACTIONS (dùng cả trong table và trong modal) ===
  const handleToggleHide = async (id: string, currentStatus: boolean) => {
    setIsActioning(true);
    try {
      await toggleHideComment(id);
      // Cập nhật selectedComment nếu đang mở modal
      if (selectedComment?._id === id) {
        setSelectedComment((prev) =>
          prev ? { ...prev, isHidden: !currentStatus } : prev,
        );
      }
      toast.success(
        currentStatus ? "Đã khôi phục bình luận!" : "Đã ẩn bình luận!",
      );
    } catch {
      toast.error("Lỗi cập nhật trạng thái!");
    } finally {
      setIsActioning(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xoá bình luận này và TẤT CẢ câu trả lời không?",
      )
    )
      return;
    setIsActioning(true);
    try {
      await deleteComment(id);
      toast.success("Đã xoá bình luận vĩnh viễn!");
      setIsDetailOpen(false);
    } catch {
      toast.error("Lỗi khi xoá bình luận!");
    } finally {
      setIsActioning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TIÊU ĐỀ */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Quản lý Bình luận
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi, kiểm duyệt và quản lý bình luận của độc giả.
        </p>
      </div>

      {/* THANH CÔNG CỤ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-lg border shadow-sm gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm theo nội dung, user hoặc tên sách..."
            className="pl-9 w-full bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            className="h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-slate-50 text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="visible">Đang hiển thị</option>
            <option value="hidden">Đã bị ẩn</option>
          </select>

          <Button
            variant="outline"
            onClick={() => setReportedOnly(!reportedOnly)}
            className={`transition-colors ${
              reportedOnly
                ? "text-red-700 border-red-300 bg-red-100 hover:bg-red-200 hover:text-red-800"
                : "text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
            }`}
          >
            <ShieldAlert className="h-4 w-4 mr-2" />
            {reportedOnly ? "Đang lọc Cảnh báo" : "Bị báo cáo"}
          </Button>
        </div>
      </div>

      {/* BẢNG BÌNH LUẬN */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[180px]">Người bình luận</TableHead>
              <TableHead className="w-[200px]">Vị trí</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead className="text-center w-[130px]">
                Trạng thái
              </TableHead>
              <TableHead className="text-right pr-6 w-[160px]">
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
            ) : filteredComments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-slate-500"
                >
                  {!comments || comments.length === 0
                    ? "Chưa có bình luận nào."
                    : "Không tìm thấy bình luận phù hợp với bộ lọc."}
                </TableCell>
              </TableRow>
            ) : (
              filteredComments.map((comment) => (
                <TableRow
                  key={comment._id}
                  className={`hover:bg-slate-50 transition-colors ${
                    comment.isHidden
                      ? "bg-slate-50/80 opacity-75"
                      : comment.isReported
                        ? "bg-amber-50/40"
                        : ""
                  }`}
                >
                  {/* Người bình luận */}
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0 border border-slate-300 uppercase">
                        {comment.user?.username?.charAt(0) || "?"}
                      </div>
                      <div className="flex flex-col">
                        <span>{comment.user?.username || "Ẩn danh"}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Vị trí */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span
                        className="text-xs font-semibold text-slate-700 truncate max-w-[180px]"
                        title={comment.book?.title}
                      >
                        {comment.book?.title || "Sách đã xoá"}
                      </span>
                      <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-sm inline-block w-fit">
                        {comment.chapter?.title ||
                          `Chương ${comment.chapter?.chapterNumber || ""}`}
                      </span>
                    </div>
                  </TableCell>

                  {/* Nội dung */}
                  <TableCell
                    className={`max-w-xs md:max-w-sm truncate ${
                      comment.isHidden
                        ? "italic text-slate-400"
                        : "text-slate-800"
                    }`}
                  >
                    {comment.isReported && !comment.isHidden && (
                      <AlertTriangle className="h-4 w-4 text-amber-500 inline-block mr-2 mb-0.5" />
                    )}
                    {comment.parentComment && (
                      <span className="text-indigo-600 font-semibold mr-1">
                        [Trả lời]
                      </span>
                    )}
                    {comment.content}
                  </TableCell>

                  {/* Trạng thái */}
                  <TableCell className="text-center">
                    {comment.isHidden ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-500">
                        Đã ẩn
                      </span>
                    ) : comment.isReported ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
                        Bị báo cáo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Bình thường
                      </span>
                    )}
                  </TableCell>

                  {/* Hành động */}
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-2">
                      {/* Nút Xem chi tiết */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                        title="Xem chi tiết"
                        onClick={() => handleViewDetail(comment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Nút Ẩn / Khôi phục */}
                      <Button
                        onClick={() =>
                          handleToggleHide(comment._id, comment.isHidden)
                        }
                        variant="outline"
                        size="icon"
                        className={`h-8 w-8 ${
                          comment.isHidden
                            ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                            : "text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                        }`}
                        title={comment.isHidden ? "Khôi phục" : "Ẩn bình luận"}
                      >
                        {comment.isHidden ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Nút Xoá */}
                      <Button
                        onClick={() => handleDelete(comment._id)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        title="Xoá vĩnh viễn"
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

      {/* ====== MODAL CHI TIẾT BÌNH LUẬN ====== */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-slate-900">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                Chi tiết Bình luận
              </DialogTitle>
              {/* Badge trạng thái trong modal */}
              {selectedComment && (
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    selectedComment.isHidden
                      ? "bg-slate-200 text-slate-600"
                      : selectedComment.isReported
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}
                >
                  {selectedComment.isHidden
                    ? "Đã ẩn"
                    : selectedComment.isReported
                      ? "⚠ Bị báo cáo"
                      : "Bình thường"}
                </span>
              )}
            </div>
          </DialogHeader>

          {selectedComment && (
            <div className="px-6 py-5 space-y-5">
              {/* THÔNG TIN NGƯỜI DÙNG */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0 border-2 border-indigo-200 uppercase">
                  {selectedComment.user?.username?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {selectedComment.user?.username || "Ẩn danh"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Đăng lúc:{" "}
                    {new Date(selectedComment.createdAt).toLocaleString(
                      "vi-VN",
                    )}
                  </p>
                </div>
              </div>

              {/* VỊ TRÍ BÌNH LUẬN */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-[11px] text-blue-400 font-medium mb-1 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Sách
                  </p>
                  <p
                    className="text-sm font-semibold text-blue-800 truncate"
                    title={selectedComment.book?.title}
                  >
                    {selectedComment.book?.title || "Sách đã xoá"}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-[11px] text-indigo-400 font-medium mb-1 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> Chương
                  </p>
                  <p className="text-sm font-semibold text-indigo-800 truncate">
                    {selectedComment.chapter?.title ||
                      `Chương ${selectedComment.chapter?.chapterNumber || "?"}`}
                  </p>
                </div>
              </div>

              {/* Nếu là reply thì hiển thị tag */}
              {selectedComment.parentComment && (
                <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-2 rounded-md border border-indigo-100">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Đây là bình luận{" "}
                  <span className="font-semibold">trả lời</span> cho một bình
                  luận khác
                </div>
              )}

              {/* NỘI DUNG BÌNH LUẬN */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  Nội dung
                </p>
                <div
                  className={`p-4 rounded-lg border text-sm leading-relaxed ${
                    selectedComment.isHidden
                      ? "bg-slate-50 border-slate-200 text-slate-400 italic"
                      : selectedComment.isReported
                        ? "bg-amber-50 border-amber-200 text-slate-700"
                        : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  {selectedComment.isReported && !selectedComment.isHidden && (
                    <div className="flex items-center gap-2 text-amber-600 text-xs font-medium mb-3 pb-2 border-b border-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Bình luận này đã bị người dùng báo cáo
                    </div>
                  )}
                  {selectedComment.content}
                </div>
              </div>

              {/* ===== VÙNG HÀNH ĐỘNG ===== */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                  Hành động kiểm duyệt
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {/* Ẩn / Khôi phục */}
                  <Button
                    disabled={isActioning}
                    onClick={() =>
                      handleToggleHide(
                        selectedComment._id,
                        selectedComment.isHidden,
                      )
                    }
                    variant="outline"
                    className={`flex flex-col h-auto py-3 gap-1.5 ${
                      selectedComment.isHidden
                        ? "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                        : "text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100"
                    }`}
                  >
                    {selectedComment.isHidden ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-xs font-semibold">Khôi phục</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-5 w-5" />
                        <span className="text-xs font-semibold">
                          Ẩn bình luận
                        </span>
                      </>
                    )}
                  </Button>

                  {/* Khoá người dùng */}
                  <Button
                    disabled={isActioning}
                    variant="outline"
                    className="flex flex-col h-auto py-3 gap-1.5 text-orange-700 border-orange-200 bg-orange-50 hover:bg-orange-100"
                    onClick={() => {
                      // TODO: gọi API khoá user
                      toast.info(
                        `Chức năng khoá tài khoản "${selectedComment.user?.username}" đang được phát triển.`,
                      );
                    }}
                  >
                    <Ban className="h-5 w-5" />
                    <span className="text-xs font-semibold">Khoá User</span>
                  </Button>

                  {/* Xoá vĩnh viễn */}
                  <Button
                    disabled={isActioning}
                    variant="outline"
                    className="flex flex-col h-auto py-3 gap-1.5 text-red-700 border-red-200 bg-red-50 hover:bg-red-100"
                    onClick={() => handleDelete(selectedComment._id)}
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="text-xs font-semibold">Xoá vĩnh viễn</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Footer đóng modal */}
          <div className="px-6 pb-5 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDetailOpen(false)}
              className="gap-2"
            >
              <X className="h-4 w-4" /> Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommentsPage;
