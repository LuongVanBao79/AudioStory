import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// IMPORT 3 BỘ NÃO ZUSTAND
import { useBookStore } from "@/stores/useBookStore";
import { useCategoryStore } from "@/stores/useCategoryStore"; // Nhớ check lại tên file store
import { useAuthorStore } from "@/stores/useAuthorStore"; // Nhớ check lại tên file store

// LƯU Ý: Đã bỏ z.string().url() cho coverImage vì chúng ta sẽ dùng File Upload
const bookSchema = z.object({
  title: z.string().min(1, { message: "Vui lòng nhập tên sách" }),
  author: z.string().min(1, { message: "Vui lòng chọn tác giả" }),
  category: z.string().min(1, { message: "Vui lòng chọn thể loại" }),
  description: z.string().optional(),
  isFull: z.boolean(),
});

type BookFormValues = z.infer<typeof bookSchema>;

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Quản lý ảnh bìa
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lấy dữ liệu từ các Store
  const { addBook } = useBookStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { authors, fetchAuthors } = useAuthorStore();

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      category: "",
      description: "",
      isFull: false,
    },
  });

  // Tải danh sách Danh mục & Tác giả khi mở Modal
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchAuthors();
    } else {
      form.reset();
      setPreviewImage(null);
      setSelectedFile(null);
    }
  }, [isOpen, fetchCategories, fetchAuthors, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: BookFormValues) => {
    setIsLoading(true);
    try {
      // Đóng gói dữ liệu chuẩn Form-Data
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("author", values.author);
      formData.append("category", values.category);
      if (values.description)
        formData.append("description", values.description);

      // Chú ý: boolean phải chuyển thành string để gửi qua FormData
      formData.append("isFull", String(values.isFull));

      // Key "cover" phải khớp với cấu hình multer bên Backend
      if (selectedFile) formData.append("cover", selectedFile);

      await addBook(formData);
      toast.success("Thêm sách mới thành công!");
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi thêm sách",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm Sách Mới</DialogTitle>
          <DialogDescription>
            Điền các thông tin và tải ảnh bìa lên để tạo một cuốn sách.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CỘT TRÁI: UPLOAD ẢNH BÌA */}
              <div className="col-span-1 flex flex-col items-center space-y-2">
                <FormLabel className="w-full text-left">Ảnh bìa sách</FormLabel>
                <div
                  className="relative w-full aspect-[2/3] rounded-md border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden hover:bg-slate-100 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-xs text-slate-500 font-medium">
                        Tải ảnh bìa
                      </span>
                    </div>
                  )}
                  {previewImage && (
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        Đổi ảnh
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* CỘT PHẢI: THÔNG TIN SÁCH */}
              <div className="col-span-2 space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tên sách <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Harry Potter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* DROPDOWN TÁC GIẢ THẬT */}
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tác giả <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tác giả" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {authors.map((author) => (
                              <SelectItem key={author._id} value={author._id}>
                                {author.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* DROPDOWN DANH MỤC THẬT */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Thể loại <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn thể loại" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isFull"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Trạng thái hoàn thành</FormLabel>
                        <DialogDescription className="text-xs">
                          Bật nếu truyện đã ra hết.
                        </DialogDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả truyện</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập tóm tắt nội dung..."
                      className="resize-none h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2 space-x-2 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu cuốn sách
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookModal;
