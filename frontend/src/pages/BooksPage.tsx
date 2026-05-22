import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, BookText, Loader2, Eye } from "lucide-react";
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
import { toast } from "sonner";
import EditBookModal from "../components/EditBookModal";

// IMPORT BỘ NÃO ZUSTAND VÀ ROUTER
import { useBookStore } from "@/stores/useBookStore";
import { useNavigate } from "react-router"; // Hoặc react-router-dom tuỳ phiên bản của bạn

const BooksPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  // LẤY SÁCH VÀ CÁC HÀM TỪ STORE RA
  const { books, fetchBooks, isLoading, deleteBook } = useBookStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const handleEdit = (book: any) => {
    setSelectedBook(book);
    setIsEditModalOpen(true);
  };

  // TỰ ĐỘNG GỌI API LẤY SÁCH KHI VỪA VÀO TRANG
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // HÀM XỬ LÝ XOÁ SÁCH
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá cuốn sách này không?"))
      return;
    try {
      await deleteBook(id);
      toast.success("Đã xoá sách thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xoá sách!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quản lý Sách
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Xem, thêm, sửa và xoá các cuốn sách trong hệ thống.
          </p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm sách mới
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[50px] text-center">STT</TableHead>
              <TableHead>Tên sách</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead className="text-center">Số chương</TableHead>
              <TableHead className="text-right pr-6">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* TRẠNG THÁI: ĐANG LOAD API */}
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  </div>
                </TableCell>
              </TableRow>
            ) : /* TRẠNG THÁI: KHÔNG CÓ DỮ LIỆU */
            books.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-32 text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <BookText className="h-10 w-10 text-slate-300 mb-2" />
                    <p>Chưa có cuốn sách nào.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              /* TRẠNG THÁI: HIỂN THỊ DỮ LIỆU THẬT */
              books.map((book, index) => (
                <TableRow key={book._id} className="hover:bg-slate-50">
                  <TableCell className="text-center font-medium text-slate-500">
                    {index + 1}
                  </TableCell>

                  {/* CỘT TÊN SÁCH (Kèm Ảnh Bìa) */}
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
                      <span className="font-semibold text-slate-900">
                        {book.title}
                      </span>
                    </div>
                  </TableCell>

                  {/* CỘT TÁC GIẢ (Đã fix lỗi Object bằng cách gọi .name) */}
                  <TableCell className="text-slate-600">
                    {book.author?.name || "Chưa rõ"}
                  </TableCell>

                  {/* CỘT SỐ CHƯƠNG */}
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {book.totalChapters || 0} chương
                    </span>
                  </TableCell>

                  {/* CỘT HÀNH ĐỘNG */}
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
                        onClick={() => handleEdit(book)} // GỌI HÀM VỪA TẠO
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
