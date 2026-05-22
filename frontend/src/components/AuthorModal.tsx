import React, { useEffect, useState } from "react";
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

// IMPORT STORE
import { useAuthorStore } from "@/stores/useAuthorStore";

// 1. Zod Schema cho Tác giả
const authorSchema = z.object({
  name: z.string().min(2, { message: "Tên tác giả phải có ít nhất 2 ký tự" }),
  bio: z.string().optional(),
});

type AuthorFormValues = z.infer<typeof authorSchema>;

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorToEdit?: any;
}

const AuthorModal: React.FC<AuthorModalProps> = ({
  isOpen,
  onClose,
  authorToEdit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isEditing = !!authorToEdit;

  // Lấy hàm từ Store
  const { createAuthor, updateAuthor } = useAuthorStore();

  const form = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    defaultValues: { name: "", bio: "" },
  });

  // Đổ dữ liệu khi bấm nút Sửa
  useEffect(() => {
    if (authorToEdit) {
      form.reset({
        name: authorToEdit.name,
        bio: authorToEdit.bio || "",
      });
      setPreviewImage(authorToEdit.avatarUrl || null);
      setSelectedFile(null);
    } else {
      form.reset({ name: "", bio: "" });
      setPreviewImage(null);
      setSelectedFile(null);
    }
  }, [authorToEdit, form, isOpen]);

  // Hàm xử lý chọn ảnh để Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // HÀM SUBMIT GỌI API THẬT
  const onSubmit = async (values: AuthorFormValues) => {
    setIsLoading(true);
    try {
      // 1. Dùng FormData để gói cả chữ lẫn ảnh
      const formData = new FormData();
      formData.append("name", values.name);

      if (values.bio) {
        formData.append("bio", values.bio);
      }

      // Chú ý: Key gửi ảnh phải khớp với backend (mình đã cấu hình bên Node.js là "avatar")
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      // 2. Gọi API
      if (isEditing) {
        await updateAuthor(authorToEdit._id, formData);
        toast.success("Cập nhật tác giả thành công!");
      } else {
        await createAuthor(formData);
        toast.success("Thêm tác giả thành công!");
      }

      form.reset();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa Tác giả" : "Thêm Tác giả mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin tác giả."
              : "Thêm một tác giả mới vào hệ thống."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            {/* Vùng Upload Ảnh (Giao diện chuẩn xịn của bạn) */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <FormLabel className="w-full text-left">Ảnh đại diện</FormLabel>
              <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden hover:bg-slate-100 transition-colors group">
                {previewImage ? (
                  <>
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {/* Nút xoá ảnh khi đã chọn */}
                    <div
                      className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        setPreviewImage(null);
                        setSelectedFile(null); // Clear file khỏi State
                      }}
                    >
                      <X className="text-white h-6 w-6" />
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                    <UploadCloud className="h-8 w-8 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500 font-medium">
                      Tải ảnh lên
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên tác giả <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Nguyễn Nhật Ánh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiểu sử / Giới thiệu</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Vài nét về tác giả..."
                      className="resize-none h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4 space-x-2 border-t mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Lưu thay đổi" : "Thêm tác giả"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthorModal;
