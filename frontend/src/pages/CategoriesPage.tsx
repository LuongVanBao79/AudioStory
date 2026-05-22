import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, FolderTree, Loader2, Eye } from "lucide-react";
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
import { useCategoryStore } from "@/stores/useCategoryStore"; // Nhớ check lại tên file store cho chuẩn nhé
import { toast } from "sonner"; // Dùng để hiển thị thông báo góc màn hình
import { useNavigate } from "react-router";

const CategoriesPage = () => {
  // Lấy toàn bộ "vũ khí" từ Store ra
  const { categories, isLoading, fetchCategories, deleteCategory } =
    useCategoryStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Gọi API lấy dữ liệu ngay khi vừa vào trang
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Mở modal Thêm mới
  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  // Mở modal Sửa
  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const navigate = useNavigate();

  // Hàm xử lý Xoá
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quản lý Danh mục
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập các thể loại truyện để phân loại kho sách.
          </p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={handleAdd}
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
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
            {/* TRẠNG THÁI 1: ĐANG LOAD DỮ LIỆU */}
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
            ) : /* TRẠNG THÁI 2: KHÔNG CÓ DỮ LIỆU */
            categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-32 text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <FolderTree className="h-10 w-10 text-slate-300 mb-2" />
                    <p>Chưa có danh mục nào.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              /* TRẠNG THÁI 3: CÓ DỮ LIỆU THẬT */
              categories.map((cat, index) => (
                <TableRow key={cat._id} className="hover:bg-slate-50">
                  <TableCell className="text-center font-medium text-slate-500">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {cat.name}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
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
                        onClick={() => handleDelete(cat._id)} // Gọi API Xoá ở đây
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
