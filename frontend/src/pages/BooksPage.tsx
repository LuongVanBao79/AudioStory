import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  BookText,
  Loader2,
  Eye,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddBookModal from "../components/AddBookModal";
import EditBookModal from "../components/EditBookModal";
import { toast } from "sonner";
import { useBookStore } from "@/stores/useBookStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { useNavigate } from "react-router";

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "top-view", label: "Lượt xem" },
  { value: "top-listen", label: "Lượt nghe" },
  { value: "rating", label: "Đánh giá" },
] as const;

const LIMIT = 20;

const BooksPage = () => {
  const navigate = useNavigate();
  const {
    books,
    isLoading,
    total,
    totalPages,
    currentPage,
    fetchBooks,
    deleteBook,
  } = useBookStore();
  const { categories, fetchCategories } = useCategoryStore();

  // ── Modal state ──
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  // ── Filter state ──
  const [search, setSearch] = useState("");
  const [inputVal, setInputVal] = useState(""); // giá trị ô input (debounce)
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<
    "newest" | "top-view" | "top-listen" | "rating"
  >("newest");
  const [page, setPage] = useState(1);

  // Load categories cho dropdown filter
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch mỗi khi filter/page thay đổi
  useEffect(() => {
    fetchBooks({
      search: search || undefined,
      category: category || undefined,
      sort,
      page,
      limit: LIMIT,
    });
  }, [search, category, sort, page]);

  // Debounce search 400ms — tránh gọi API mỗi keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(inputVal);
      setPage(1); // reset về trang 1 khi search mới
    }, 400);
    return () => clearTimeout(t);
  }, [inputVal]);

  const handleFilterChange = (newCategory: string, newSort: typeof sort) => {
    setCategory(newCategory);
    setSort(newSort);
    setPage(1);
  };

  const handleEdit = (book: any) => {
    setSelectedBook(book);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá cuốn sách này không?"))
      return;
    try {
      await deleteBook(id);
      toast.success("Đã xoá sách thành công!");
      // Nếu xoá hết trang cuối → lùi lại 1 trang
      if (books.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchBooks({ search, category, sort, page, limit: LIMIT });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xoá sách!");
    }
  };

  const clearFilters = () => {
    setInputVal("");
    setSearch("");
    setCategory("");
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilter = inputVal || category || sort !== "newest";

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Tìm theo tên sách..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg
                       text-slate-700 placeholder-slate-400 shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
          {inputVal && (
            <button
              onClick={() => setInputVal("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter: Danh mục */}
        <Select
          value={category}
          onValueChange={(val) =>
            handleFilterChange(val === "all" ? "" : val, sort)
          }
        >
          <SelectTrigger
            className="w-44 bg-white border-slate-200 text-sm shadow-sm
                             focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          >
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter: Sắp xếp */}
        <Select
          value={sort}
          onValueChange={(val) =>
            handleFilterChange(category, val as typeof sort)
          }
        >
          <SelectTrigger
            className="w-36 bg-white border-slate-200 text-sm shadow-sm
                             focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Nút xoá filter — chỉ hiện khi đang lọc */}
        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700
                       border border-slate-200 bg-white rounded-lg px-3 py-2 shadow-sm transition-colors"
          >
            <X className="h-3 w-3" /> Xoá bộ lọc
          </button>
        )}

        {/* Tổng kết quả */}
        {!isLoading && (
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {total} cuốn sách
          </span>
        )}

        <div className="flex-1" />

        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm sách mới
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[50px] text-center">STT</TableHead>
              <TableHead>Tên sách</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-center">Số chương</TableHead>
              <TableHead className="text-right pr-6">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
                    <p className="text-slate-500 text-sm">
                      Đang tải dữ liệu...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-32 text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <BookText className="h-10 w-10 text-slate-300 mb-2" />
                    <p className="text-sm">
                      {search || category
                        ? "Không tìm thấy kết quả phù hợp."
                        : "Chưa có cuốn sách nào."}
                    </p>
                    {(search || category) && (
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
              books.map((book, index) => (
                <TableRow key={book._id} className="hover:bg-slate-50">
                  <TableCell className="text-center font-medium text-slate-500">
                    {(page - 1) * LIMIT + index + 1}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-8 shrink-0 rounded bg-slate-100 border overflow-hidden">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookText className="h-full w-full p-2 text-slate-300" />
                        )}
                      </div>
                      <span className="font-semibold text-slate-900 line-clamp-2 max-w-[200px]">
                        {book.title}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-slate-600">
                    {book.author?.name || "—"}
                  </TableCell>

                  <TableCell>
                    {book.category?.name ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full
                                       text-xs font-medium bg-violet-100 text-violet-700"
                      >
                        {book.category.name}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full
                                     text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {book.totalChapters || 0} chương
                    </span>
                  </TableCell>

                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        onClick={() => navigate(`/books/${book._id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEdit(book)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(book._id)}
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

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-500">
            Trang <span className="font-medium text-slate-700">{page}</span> /{" "}
            {totalPages}
            &nbsp;·&nbsp;{total} sách
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* ✅ Tách riêng hàm tính dãy số trang — không dùng reduce phức tạp */}
            {(() => {
              const pages: (number | "...")[] = [];
              for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
                  pages.push(i);
                } else if (pages[pages.length - 1] !== "...") {
                  pages.push("...");
                }
              }
              return pages.map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="px-1 text-slate-400 text-sm">
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 text-sm ${page === p ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                    onClick={() => setPage(p as number)}
                  >
                    {p}
                  </Button>
                ),
              );
            })()}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <EditBookModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        bookToEdit={selectedBook}
      />
    </div>
  );
};

export default BooksPage;
