import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  PlayCircle,
  FileText,
  Star,
  MessageSquare,
  Headphones,
  BookOpen,
  Loader2,
  CheckCircle2,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ChapterModal from "../components/ChapterModal";

// IMPORTS TỪ STORE & AXIOS
import { useBookStore } from "@/stores/useBookStore";
import { useChapterStore } from "@/stores/useChapterStore";
import { useReviewStore } from "@/stores/useReviewStore";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

// ==========================================
// COMPONENT CHÍNH
// ==========================================
const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // BỐC DỮ LIỆU TỪ ZUSTAND STORE
  const { currentBook, isLoading, fetchBookById } = useBookStore();
  const { chapters, fetchChaptersByBook, deleteChapter } = useChapterStore();
  const { reviews, fetchAdminReviews, toggleHideReview, deleteReview } =
    useReviewStore();

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [previewChapter, setPreviewChapter] = useState<any>(null);

  // GỌI API LẤY CHI TIẾT SÁCH + CHƯƠNG + REVIEW KHI VỪA VÀO TRANG
  useEffect(() => {
    if (id) {
      fetchBookById(id);
      fetchChaptersByBook(id);
      fetchAdminReviews(); // Lấy cả đánh giá về
    }
  }, [id, fetchBookById, fetchChaptersByBook, fetchAdminReviews]);

  // HÀM LẤY FULL NỘI DUNG CHỮ CỦA CHƯƠNG KHI BẤM XEM TRƯỚC
  const handleSelectPreview = async (chapterSummary: any) => {
    try {
      // 1. Set tạm thông tin cơ bản trước để UI phản hồi ngay (Audio play được luôn)
      setPreviewChapter(chapterSummary);

      // 2. Gọi API lấy chi tiết để có được trường `content` (chữ)
      const res: any = await axiosInstance.get(
        `/chapters/${chapterSummary._id}`,
      );
      if (res.data) {
        setPreviewChapter(res.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải nội dung chữ:", error);
    }
  };

  // TỰ ĐỘNG CHỌN CHƯƠNG 1 ĐỂ PREVIEW NẾU CHƯA CHỌN GÌ
  useEffect(() => {
    if (chapters.length > 0 && !previewChapter) {
      handleSelectPreview(chapters[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters]);

  // ==========================================
  // LOGIC XỬ LÝ CHƯƠNG
  // ==========================================
  const handleAddChapter = () => {
    setSelectedChapter(null);
    setIsChapterModalOpen(true);
  };

  const handleEditChapter = (chapter: any) => {
    setSelectedChapter(chapter);
    setIsChapterModalOpen(true);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xoá chương này? File audio cũng sẽ bị xoá khỏi hệ thống.",
      )
    )
      return;
    try {
      await deleteChapter(chapterId);
      toast.success("Đã xoá chương thành công!");
      if (previewChapter?._id === chapterId) setPreviewChapter(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xoá chương!");
    }
  };

  // ==========================================
  // LOGIC XỬ LÝ ĐÁNH GIÁ (REVIEWS)
  // ==========================================
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  // Lọc ra review của ĐÚNG SÁCH NÀY
  // Chỉ cần check r.book?._id là đủ (và đảm bảo id tồn tại)
  const bookReviews = safeReviews.filter((r) => id && r.book?._id === id);

  // Tính toán thông kê
  const totalReviews = bookReviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          bookReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        ).toFixed(1)
      : "0.0";

  const handleToggleHideReview = async (
    reviewId: string,
    currentStatus: boolean,
  ) => {
    try {
      await toggleHideReview(reviewId);
      toast.success(
        currentStatus ? "Đã khôi phục hiển thị!" : "Đã ẩn đánh giá!",
      );
    } catch (error) {
      toast.error("Lỗi khi thay đổi trạng thái!");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm("Xoá vĩnh viễn đánh giá này khỏi hệ thống?")) {
      try {
        await deleteReview(reviewId);
        toast.success("Đã xoá đánh giá!");
      } catch (error) {
        toast.error("Lỗi khi xoá đánh giá!");
      }
    }
  };

  // HÀM VẼ SAO CHUNG
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
          />
        ))}
      </div>
    );
  };

  // TRẠNG THÁI LOADING
  if (isLoading || !currentBook) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-indigo-500" />
        <p>Đang tải thông tin sách...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER: Nút Quay lại & Tiêu đề */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/books")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {currentBook.title}
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý chi tiết, chương và kiểm duyệt tương tác
          </p>
        </div>
      </div>

      {/* TABS MENU */}
      <Tabs defaultValue="chapters" className="w-full">
        <TabsList className="grid w-full max-w-4xl grid-cols-4 mb-6 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger
            value="info"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Thông tin Sách
          </TabsTrigger>
          <TabsTrigger
            value="chapters"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Danh sách Chương
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2"
          >
            <MessageSquare className="h-4 w-4" /> Đánh giá
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-indigo-600 font-medium flex items-center justify-center gap-2"
          >
            <Headphones className="h-4 w-4" /> Nghe & Đọc thử
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: THÔNG TIN SÁCH */}
        <TabsContent
          value="info"
          className="bg-white p-6 rounded-lg border shadow-sm"
        >
          <div className="flex gap-8">
            <div className="w-48 h-64 bg-slate-200 rounded-md overflow-hidden shrink-0 border shadow-sm flex items-center justify-center">
              {currentBook.coverImage ? (
                <img
                  src={currentBook.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen className="h-12 w-12 text-slate-400" />
              )}
            </div>
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Tên sách</p>
                  <p className="text-base font-semibold text-slate-900">
                    {currentBook.title}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Tác giả</p>
                  <p className="text-base text-slate-900">
                    {currentBook.author?.name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Thể loại</p>
                  <p className="text-base text-slate-900">
                    {currentBook.category?.name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Trạng thái
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium ${currentBook.isFull ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}
                  >
                    {currentBook.isFull ? "Đã hoàn thành" : "Đang ra"}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-slate-500">Mô tả</p>
                  <p className="text-base text-slate-700 mt-1">
                    {currentBook.description || "Chưa có mô tả."}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Edit className="mr-2 h-4 w-4" /> Sửa thông tin sách
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: DANH SÁCH CHƯƠNG */}
        <TabsContent value="chapters">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Tổng số: {chapters.length} chương
            </h2>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleAddChapter}
            >
              <Plus className="mr-2 h-4 w-4" /> Thêm chương mới
            </Button>
          </div>

          <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[80px] text-center">Chương</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead className="text-center">Audio</TableHead>
                  <TableHead className="text-center">Lượt nghe</TableHead>
                  <TableHead className="text-right pr-6">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chapters.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-slate-500"
                    >
                      Chưa có chương nào. Hãy tạo chương mới để AI đọc truyện
                      nhé!
                    </TableCell>
                  </TableRow>
                ) : (
                  chapters.map((chapter) => (
                    <TableRow key={chapter._id} className="hover:bg-slate-50">
                      <TableCell className="text-center font-bold text-slate-700">
                        {chapter.chapterNumber}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {chapter.title}
                      </TableCell>
                      <TableCell className="text-center">
                        {chapter.audioUrl ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-xs font-medium">
                            <PlayCircle className="h-3 w-3" /> Đã có Audio
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-500 text-xs font-medium">
                            <FileText className="h-3 w-3" /> Chỉ có chữ
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-slate-600">
                        {chapter.views || 0}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleEditChapter(chapter)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteChapter(chapter._id)}
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
        </TabsContent>

        {/* TAB 3: ĐÁNH GIÁ & KIỂM DUYỆT */}
        <TabsContent value="reviews" className="space-y-4">
          <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Thống kê Đánh giá
              </h2>
              <p className="text-sm text-slate-500">
                Dựa trên ý kiến của độc giả về sách này.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                  {averageRating}{" "}
                  <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
                </div>
                <div className="text-sm text-slate-500 mt-1">Trung bình</div>
              </div>
              <div className="h-10 w-px bg-slate-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">
                  {totalReviews}
                </div>
                <div className="text-sm text-slate-500 mt-1">Lượt đánh giá</div>
              </div>
            </div>
          </div>

          <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[200px]">Người dùng</TableHead>
                  <TableHead className="w-[150px]">Điểm số</TableHead>
                  <TableHead>Nội dung bình luận</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right pr-6">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookReviews.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-slate-500"
                    >
                      Sách này chưa có đánh giá nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookReviews.map((review) => (
                    <TableRow
                      key={review._id}
                      className={`hover:bg-slate-50 transition-colors ${review.isHidden ? "bg-slate-50/50" : ""}`}
                    >
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0 uppercase">
                            {review.user?.username?.charAt(0) || "?"}
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={`truncate max-w-[120px] ${review.isHidden ? "text-slate-400" : ""}`}
                              title={review.user?.username || "Ẩn danh"}
                            >
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
                        <div className={review.isHidden ? "opacity-50" : ""}>
                          {renderStars(review.rating)}
                        </div>
                      </TableCell>

                      <TableCell
                        className={`max-w-[300px] truncate ${review.isHidden ? "text-slate-400 italic" : "text-slate-700"}`}
                        title={review.content}
                      >
                        {review.content}
                      </TableCell>

                      <TableCell className="text-center">
                        {review.isHidden ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
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
                          {review.isHidden ? (
                            <Button
                              onClick={() =>
                                handleToggleHideReview(
                                  review._id,
                                  review.isHidden,
                                )
                              }
                              variant="outline"
                              size="sm"
                              className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Duyệt
                            </Button>
                          ) : (
                            <Button
                              onClick={() =>
                                handleToggleHideReview(
                                  review._id,
                                  review.isHidden,
                                )
                              }
                              variant="outline"
                              size="sm"
                              className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                            >
                              <EyeOff className="h-4 w-4 mr-1" /> Ẩn
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDeleteReview(review._id)}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
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
        </TabsContent>

        {/* TAB 4: TRẢI NGHIỆM (XEM TRƯỚC AUDIO & TEXT) */}
        <TabsContent value="preview" className="h-[600px]">
          {!previewChapter ? (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <BookOpen className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                Cuốn sách này chưa có chương nào để nghe thử.
              </p>
            </div>
          ) : (
            <div className="flex gap-6 h-full">
              {/* Cột trái: Danh sách chọn chương */}
              <div className="w-1/3 bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-slate-50 font-semibold text-slate-800">
                  Chọn chương để test
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  {chapters.map((chapter) => (
                    <div
                      key={chapter._id}
                      onClick={() => handleSelectPreview(chapter)} // <-- ĐÃ SỬA THÀNH GỌI HÀM MỚI Ở ĐÂY
                      className={`p-3 mb-2 rounded-md cursor-pointer transition-colors flex items-center justify-between ${
                        previewChapter._id === chapter._id
                          ? "bg-indigo-50 border border-indigo-200 text-indigo-700"
                          : "hover:bg-slate-100 border border-transparent text-slate-700"
                      }`}
                    >
                      <div className="font-medium truncate pr-2">
                        Chương {chapter.chapterNumber}: {chapter.title}
                      </div>
                      {chapter.audioUrl ? (
                        <PlayCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cột phải: Khung Trải nghiệm (Player + Reader) */}
              <div className="flex-1 bg-white rounded-lg border shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 border-b bg-white">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Chương {previewChapter.chapterNumber}:{" "}
                    {previewChapter.title}
                  </h2>
                  {previewChapter.audioUrl ? (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Headphones className="h-5 w-5 text-indigo-600" />
                        <span className="font-semibold text-slate-700 text-sm">
                          Trình phát Audio
                        </span>
                      </div>
                      <audio
                        controls
                        className="w-full h-10 outline-none"
                        key={previewChapter.audioUrl}
                      >
                        <source
                          src={previewChapter.audioUrl}
                          type="audio/mpeg"
                        />
                        Trình duyệt của bạn không hỗ trợ thẻ audio.
                      </audio>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-sm flex items-center">
                      <FileText className="h-5 w-5 mr-2" /> Chương này chưa có
                      file Audio (Chỉ có chữ).
                    </div>
                  )}
                </div>

                <div className="flex-1 p-8 overflow-y-auto bg-[#Fdfbf7]">
                  <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-2 mb-6 text-slate-400">
                      <BookOpen className="h-5 w-5" />
                      <span className="uppercase tracking-widest text-xs font-bold">
                        Nội dung chữ
                      </span>
                    </div>
                    <div className="prose prose-slate prose-lg">
                      {previewChapter.content ? (
                        previewChapter.content
                          .split("\n")
                          .map((paragraph: string, index: number) => (
                            <p
                              key={index}
                              className="text-slate-800 leading-relaxed mb-4 text-justify"
                            >
                              {paragraph}
                            </p>
                          ))
                      ) : (
                        <p className="text-slate-400 italic">
                          Chưa có nội dung chữ cho chương này hoặc đang tải dữ
                          liệu...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* MODAL THÊM/SỬA CHƯƠNG */}
      <ChapterModal
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        chapterToEdit={selectedChapter}
        bookId={id || ""}
      />
    </div>
  );
};

export default BookDetailsPage;
