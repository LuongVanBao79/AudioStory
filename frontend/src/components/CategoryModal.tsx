import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

// IMPORT KHO DỮ LIỆU
import { useCategoryStore } from "@/stores/useCategoryStore";

// 1. Định nghĩa Zod Schema cho Danh mục
const categorySchema = z.object({
  name: z.string().min(2, { message: "Tên danh mục phải có ít nhất 2 ký tự" }),
  slug: z.string().min(2, { message: "Slug không được để trống" }),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: any; // Nếu có truyền vào thì là đang Sửa, không có là Thêm mới
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!categoryToEdit;

  // Lấy hàm Thêm và Sửa từ Store
  const { createCategory, updateCategory } = useCategoryStore();

  // Khởi tạo Form
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  // Tự động điền dữ liệu nếu đang ở chế độ Sửa
  useEffect(() => {
    if (categoryToEdit) {
      form.reset({
        name: categoryToEdit.name,
        slug: categoryToEdit.slug,
        description: categoryToEdit.description || "",
      });
    } else {
      form.reset({ name: "", slug: "", description: "" });
    }
  }, [categoryToEdit, form, isOpen]); // Thêm isOpen vào dependency để reset mỗi khi mở/đóng

  // Hàm xử lý Submit GỌI API THẬT
  const onSubmit = async (values: CategoryFormValues) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        // Gọi API Sửa (truyền ID và data)
        await updateCategory(categoryToEdit._id, values);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        // Gọi API Thêm mới (chỉ truyền data)
        await createCategory(values);
        toast.success("Thêm danh mục thành công!");
      }
      form.reset();
      onClose();
    } catch (error: any) {
      // Bắt lỗi từ Backend trả về (ví dụ: Trùng tên/slug)
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
            {isEditing ? "Chỉnh sửa Danh mục" : "Thêm Danh mục mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin danh mục dưới đây."
              : "Tạo một phân loại mới cho kho sách của bạn."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên danh mục <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Tiên Hiệp"
                      {...field}
                      // Mẹo UX: Tự động tạo slug khi gõ tên
                      onChange={(e) => {
                        field.onChange(e);
                        if (!isEditing) {
                          const autoSlug = e.target.value
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9]/g, "-")
                            .replace(/-+/g, "-")
                            .replace(/^-|-$/g, "");
                          form.setValue("slug", autoSlug);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Slug (Đường dẫn chuẩn SEO){" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="VD: tien-hiep" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả ngắn</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả cho danh mục này..."
                      className="resize-none h-20"
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
                {isEditing ? "Lưu thay đổi" : "Tạo danh mục"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;
