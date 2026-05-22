import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, PenTool, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AuthorModal from "../components/AuthorModal";
import { toast } from "sonner";

// IMPORT KHO DỮ LIỆU TÁC GIẢ
import { useAuthorStore } from "@/stores/useAuthorStore"; // Sửa lại đường dẫn nếu cần
import { useNavigate } from "react-router";

const AuthorsPage = () => {
  // Bốc dữ liệu và hàm từ Store
  const { authors, isLoading, fetchAuthors, deleteAuthor } = useAuthorStore();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<any>(null);

  // Tự động load dữ liệu khi vào trang
  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handleAdd = () => {
    setSelectedAuthor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (author: any) => {
    setSelectedAuthor(author);
    setIsModalOpen(true);
  };

  // Hàm gọi API Xóa
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá tác giả này không?")) return;
    try {
      await deleteAuthor(id);
      toast.success("Xoá tác giả thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xoá tác giả!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quản lý Tác giả
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý thông tin và hình ảnh các tác giả truyện.
          </p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={handleAdd}
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm tác giả
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[50px] text-center">STT</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Tiểu sử</TableHead>
              <TableHead className="text-center">Số tác phẩm</TableHead>
              <TableHead className="text-right pr-6">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* ĐANG LOAD */}
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-2" />
                    <p className="text-slate-500">Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : /* TRỐNG DỮ LIỆU */
            authors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-32 text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <PenTool className="h-10 w-10 text-slate-300 mb-2" />
                    <p>Chưa có tác giả nào.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              /* CÓ DỮ LIỆU THẬT */
              authors.map((author, index) => (
                <TableRow key={author._id} className="hover:bg-slate-50">
                  <TableCell className="text-center font-medium text-slate-500">
                    {index + 1}
                  </TableCell>

                  {/* Cột hiển thị Ảnh + Tên tác giả */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                        {author.avatarUrl ? (
                          <img
                            src={author.avatarUrl}
                            alt={author.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-slate-500 font-semibold text-sm">
                            {author.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-slate-900">
                        {author.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-slate-600 truncate max-w-[300px]">
                    {author.bio || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {author.bookCount || 0} sách
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        onClick={() => navigate(`/authors/${author._id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEdit(author)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(author._id)}
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

      <AuthorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        authorToEdit={selectedAuthor}
      />
    </div>
  );
};

export default AuthorsPage;
