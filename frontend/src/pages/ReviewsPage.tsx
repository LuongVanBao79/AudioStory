import { useEffect, useState } from "react";
import {
  Star,
  EyeOff,
  CheckCircle2,
  Trash2,
  Search,
  MessageSquareWarning,
  Eye,
  X, // <-- Thêm Icon này
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
  DialogDescription,
} from "@/components/ui/dialog"; // <-- Import Dialog của shadcn
import { useReviewStore } from "@/stores/useReviewStore";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ReviewsPage = () => {
  const {
    reviews,
    isLoading,
    fetchAdminReviews,
    toggleHideReview,
    deleteReview,
  } = useReviewStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [starFilter, setStarFilter] = useState<number | "all">("all");
  const [needsReviewOnly, setNeedsReviewOnly] = useState(false);

  // === STATE QUẢN LÝ POPUP XEM CHI TIẾT ===
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  useEffect(() => {
    fetchAdminReviews();
  }, [fetchAdminReviews]);

  const safeReviews = Array.isArray(reviews) ? reviews : [];

  const filteredReviews = safeReviews.filter((review) => {
    const normalizedSearch = searchTerm.toLowerCase();
    const matchSearch =
      review.user?.username?.toLowerCase().includes(normalizedSearch) ||
      review.content?.toLowerCase().includes(normalizedSearch);

    const matchStar = starFilter === "all" || review.rating === starFilter;
    const matchNeedsReview = needsReviewOnly ? review.rating <= 2 : true;

    return matchSearch && matchStar && matchNeedsReview;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-amber-400 fill-amber-400"
                : "text-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleToggleHide = async (id: string, currentStatus: boolean) => {
    try {
      await toggleHideReview(id);
      if (currentStatus) toast.success("Đã khôi phục hiển thị đánh giá!");
      else toast.success("Đã ẩn đánh giá vi phạm khỏi hệ thống!");

      // Nếu đang mở popup của đúng review này thì cập nhật lại state để popup đổi nút
      if (selectedReview?._id === id) {
        setSelectedReview({ ...selectedReview, isHidden: !currentStatus });
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi thay đổi trạng thái!");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xoá đánh giá này vĩnh viễn không?")
    ) {
      try {
        await deleteReview(id);
        toast.success("Đã xoá đánh giá vĩnh viễn!");
        if (selectedReview?._id === id) setSelectedReview(null); // Đóng popup nếu đang mở
      } catch (error) {
        toast.error("Không thể xoá đánh giá lúc này!");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* THANH CÔNG CỤ TÌM KIẾM & LỌC */}
      <div className="flex items-center justify-between gap-3 ">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên người dùng hoặc nội dung..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg
                 text-slate-700 placeholder-slate-400 shadow-sm
                 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter sao */}
        <Select
          value={String(starFilter)}
          onValueChange={(val) =>
            setStarFilter(val === "all" ? "all" : Number(val))
          }
        >
          <SelectTrigger className="w-44 bg-white border-slate-200 text-sm shadow-sm">
            <SelectValue placeholder="Tất cả số sao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả số sao</SelectItem>
            <SelectItem value="5">5 Sao (Tuyệt vời)</SelectItem>
            <SelectItem value="4">4 Sao (Khá tốt)</SelectItem>
            <SelectItem value="3">3 Sao (Bình thường)</SelectItem>
            <SelectItem value="2">2 Sao (Tệ)</SelectItem>
            <SelectItem value="1">1 Sao (Rất tệ)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* BẢNG DỮ LIỆU ĐÁNH GIÁ */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[200px]">Người dùng</TableHead>
              <TableHead className="w-[180px]">Sách đánh giá</TableHead>
              <TableHead className="w-[120px]">Điểm số</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead className="text-center w-[100px]">
                Trạng thái
              </TableHead>
              <TableHead className="text-right pr-6 w-[160px]">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* ... (Phần loading và empty state giữ nguyên) ... */}
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-slate-500"
                >
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-slate-500"
                >
                  {safeReviews.length === 0
                    ? "Chưa có đánh giá nào."
                    : "Không tìm thấy đánh giá phù hợp."}
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow
                  key={review._id}
                  className={`hover:bg-slate-50 transition-colors ${
                    review.isHidden
                      ? "bg-slate-50/80 opacity-75"
                      : review.rating <= 2
                        ? "bg-red-50/30"
                        : ""
                  }`}
                >
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0 border border-indigo-200 uppercase">
                        {review.user?.username?.charAt(0) || "?"}
                      </div>
                      <div className="flex flex-col">
                        <span className="truncate max-w-[120px]">
                          {review.user?.username || "Ẩn danh"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[150px]">
                      {review.book?.title || "Sách đã xoá"}
                    </span>
                  </TableCell>

                  <TableCell>{renderStars(review.rating)}</TableCell>

                  <TableCell
                    className={`max-w-xs md:max-w-sm truncate ${review.isHidden ? "italic text-slate-400" : "text-slate-700"}`}
                  >
                    {review.content}
                  </TableCell>

                  <TableCell className="text-center">
                    {review.isHidden ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-500">
                        Đã ẩn
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Hiển thị
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-2">
                      {/* NÚT XEM CHI TIẾT */}
                      <Button
                        onClick={() => setSelectedReview(review)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {review.isHidden ? (
                        <Button
                          onClick={() =>
                            handleToggleHide(review._id, review.isHidden)
                          }
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                          title="Khôi phục hiển thị"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() =>
                            handleToggleHide(review._id, review.isHidden)
                          }
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                          title="Ẩn đánh giá này"
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(review._id)}
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

      {/* =========================================
          POPUP MODAL XEM CHI TIẾT ĐÁNH GIÁ 
      ========================================= */}
      <Dialog
        open={!!selectedReview}
        onOpenChange={(open) => !open && setSelectedReview(null)}
      >
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Chi tiết đánh giá</DialogTitle>
            <DialogDescription>
              Thông tin đầy đủ về đánh giá của độc giả
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="mt-4 space-y-4">
              {/* Thông tin User & Sách */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    Người dùng
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedReview.user?.username || "Ẩn danh"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedReview.user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    Sách
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedReview.book?.title || "Đã xoá"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(selectedReview.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Nội dung Review */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {renderStars(selectedReview.rating)}
                  {selectedReview.isHidden && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-slate-200 text-slate-500">
                      Đang bị ẩn
                    </span>
                  )}
                </div>

                {/* Khu vực hiển thị text đầy đủ có thanh cuộn nếu quá dài */}
                <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 max-h-[300px] overflow-y-auto">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedReview.content}
                  </p>
                </div>
              </div>

              {/* Nút thao tác nhanh trong Popup */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReview(null)}
                >
                  Đóng
                </Button>
                <Button
                  variant={selectedReview.isHidden ? "default" : "destructive"}
                  onClick={() =>
                    handleToggleHide(
                      selectedReview._id,
                      selectedReview.isHidden,
                    )
                  }
                >
                  {selectedReview.isHidden ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Khôi phục hiển
                      thị
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" /> Ẩn đánh giá này
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsPage;
