import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  FolderTree,
  Loader2,
  Eye,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CategoryModal from "../components/CategoryModal";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const CategoriesPage = () => {
  const { categories, isLoading, fetchCategories, deleteCategory } =
    useCategoryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Lọc realtime theo tên hoặc slug
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q),
    );
  }, [categories, search]);

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };
  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá danh mục này không?"))
      return;
    try {
      await deleteCategory(id);
      toast.success("Xoá danh mục thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xoá danh mục!");
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar: Search + Add ── */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, slug, mô tả..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg
                       text-slate-700 placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                       transition-all shadow-sm"
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

        {/* Số kết quả — chỉ hiện khi đang search */}
        {search && !isLoading && (
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {filtered.length} / {categories.length} danh mục
          </span>
        )}

        <div className="flex-1" />

        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={handleAdd}
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[50px] text-center">STT</TableHead>
              <TableHead>Tên danh mục</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-center">Số sách</TableHead>
              <TableHead className="text-right pr-6">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-32 text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-2" />
                    <p>Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-32 text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <FolderTree className="h-10 w-10 text-slate-300 mb-2" />
                    <p className="text-sm">
                      {search
                        ? `Không tìm thấy kết quả cho "${search}"`
                        : "Chưa có danh mục nào."}
                    </p>
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="mt-1 text-xs text-indigo-500 hover:underline"
                      >
                        Xoá bộ lọc
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((cat, index) => (
                <TableRow key={cat._id} className="hover:bg-slate-50">
                  <TableCell className="text-center font-medium text-slate-500">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {cat.name}
                  </TableCell>
                  <TableCell>
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-500">
                      {cat.slug}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 truncate max-w-[200px]">
                    {cat.description || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {cat.bookCount || 0} cuốn
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        onClick={() => navigate(`/categories/${cat._id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEdit(cat)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(cat._id)}
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

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={selectedCategory}
      />
    </div>
  );
};

export default CategoriesPage;
