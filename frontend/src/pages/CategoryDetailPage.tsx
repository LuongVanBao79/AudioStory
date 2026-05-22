import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  Headphones,
  Star,
  Loader2,
  CheckCircle2,
  FolderTree,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCategoryStore } from "@/stores/useCategoryStore";
import CategoryModal from "../components/CategoryModal";
import { useState } from "react";

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
const CategoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { currentCategory, isLoading, fetchCategoryById } = useCategoryStore();

  useEffect(() => {
    if (id) fetchCategoryById(id);
  }, [id]);

  const books = currentCategory?.books ?? [];

  // ── Format số ───────────────────────────────────────────────
  const formatCount = (n = 0) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n);

  const totalListens = books.reduce((sum, b) => sum + (b.listenCount ?? 0), 0);
  const totalViews = books.reduce((sum, b) => sum + (b.viewCount ?? 0), 0);
  const avgRating =
    books.length > 0
      ? (
          books.reduce((sum, b) => sum + (b.rating ?? 0), 0) / books.length
        ).toFixed(1)
      : "—";

  // ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!currentCategory) return null;

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb / Back ─────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-500 hover:text-slate-800 -ml-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-500">Chi tiết danh mục</span>
      </div>

      {/* ── Profile Card ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header gradient */}
        <div className="h-24 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />

        <div className="px-6 pb-6">
          {/* Icon + Actions */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="h-20 w-20 rounded-2xl border-4 border-white bg-emerald-100 shadow-md flex items-center justify-center">
              <FolderTree className="h-9 w-9 text-emerald-600" />
            </div>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setIsModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>

          {/* Tên + meta */}
          <h1 className="text-2xl font-bold text-slate-900">
            {currentCategory.name}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono text-slate-600">
              {currentCategory.slug}
            </span>
          </div>
          <p className="text-slate-500 mt-3 leading-relaxed max-w-2xl">
            {currentCategory.description || (
              <span className="italic">Chưa có mô tả.</span>
            )}
          </p>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-emerald-600" />}
          label="Số sách"
          value={currentCategory.total ?? books.length}
          color="bg-emerald-50"
        />
        <StatCard
          icon={<Headphones className="h-5 w-5 text-indigo-600" />}
          label="Lượt nghe"
          value={formatCount(totalListens)}
          color="bg-indigo-50"
        />
        <StatCard
          icon={<Eye className="h-5 w-5 text-sky-600" />}
          label="Lượt xem"
          value={formatCount(totalViews)}
          color="bg-sky-50"
        />
        <StatCard
          icon={<Star className="h-5 w-5 text-amber-500" />}
          label="Đánh giá TB"
          value={avgRating}
          color="bg-amber-50"
        />
      </div>

      {/* ── Danh sách sách ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">
            Sách thuộc danh mục {currentCategory.name}
          </h2>
          <span className="text-sm text-slate-400">{books.length} cuốn</span>
        </div>

        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <BookOpen className="h-10 w-10 mb-2 text-slate-300" />
            <p>Chưa có sách nào trong danh mục này</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {books.map((book, index) => (
              <div
                key={book._id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                {/* STT */}
                <span className="text-sm font-medium text-slate-400 w-6 shrink-0">
                  {index + 1}
                </span>

                {/* Ảnh bìa */}
                <div className="h-14 w-10 rounded-lg bg-slate-200 overflow-hidden shrink-0 shadow-sm">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Thông tin */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 truncate">
                      {book.title}
                    </p>
                    {book.isFull && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-indigo-600 font-medium">
                    {book.author?.name ?? "—"}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-slate-500 shrink-0">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400" />
                    <span>{book.rating?.toFixed(1) ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{formatCount(book.viewCount)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Headphones className="h-3.5 w-3.5" />
                    <span>{formatCount(book.listenCount)}</span>
                  </div>
                </div>

                {/* Badge + Nút */}
                <Badge
                  className={
                    book.isFull
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                  }
                >
                  {book.isFull ? "Hoàn thành" : "Đang cập nhật"}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 shrink-0"
                  onClick={() => navigate(`/books/${book._id}`)}
                >
                  Xem chi tiết
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Sửa danh mục ────────────────────────────────── */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={currentCategory}
      />
    </div>
  );
};

export default CategoryDetailPage;
