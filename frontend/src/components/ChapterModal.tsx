import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Bot } from "lucide-react";

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

// MỚI: Import Select của shadcn/ui
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useChapterStore } from "@/stores/useChapterStore";

// 1. CẬP NHẬT ZOD SCHEMA
const chapterSchema = z.object({
  chapterNumber: z.coerce
    .number()
    .min(1, { message: "Số chương phải lớn hơn 0" }),
  title: z.string().min(1, { message: "Vui lòng nhập tên chương" }),
  content: z.string().min(10, { message: "Nội dung cần ít nhất 10 ký tự" }),
  voiceType: z.string().default("Xuân Vĩnh (Nam - Miền Nam)"),
  refAudio: z.string().optional(),
});

type ChapterFormValues = z.infer<typeof chapterSchema>;

interface ChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterToEdit?: any;
  bookId: string;
}

const ChapterModal: React.FC<ChapterModalProps> = ({
  isOpen,
  onClose,
  chapterToEdit,
  bookId,
}) => {
  const isEditing = !!chapterToEdit;
  const { createChapter, updateChapter, isGeneratingAudio } = useChapterStore();

  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterSchema) as any,
    defaultValues: {
      chapterNumber: 1,
      title: "",
      content: "",
      voiceType: "Xuân Vĩnh (Nam - Miền Nam)", // Giọng mặc định
      refAudio: "",
    },
  });

  // Lắng nghe sự thay đổi của field "voiceType" để hiện ô nhập file clone
  const currentVoiceType = form.watch("voiceType");

  useEffect(() => {
    if (chapterToEdit) {
      form.reset({
        chapterNumber: chapterToEdit.chapterNumber || 1,
        title: chapterToEdit.title || "",
        content: chapterToEdit.content || "",
        voiceType: chapterToEdit.voiceType || "Xuân Vĩnh (Nam - Miền Nam)",
        refAudio: chapterToEdit.refAudio || "",
      });
    } else {
      form.reset({
        chapterNumber: 1,
        title: "",
        content: "",
        voiceType: "Xuân Vĩnh (Nam - Miền Nam)",
        refAudio: "",
      });
    }
  }, [chapterToEdit, form, isOpen]);

  const onSubmit = async (values: ChapterFormValues) => {
    try {
      if (isEditing) {
        await updateChapter(chapterToEdit._id, values);
        toast.success("Cập nhật chương và Audio thành công!");
      } else {
        const payload = { ...values, book: bookId };
        await createChapter(payload);
        toast.success("Tuyệt vời! AI đã đọc xong và thêm chương thành công!");
      }
      form.reset();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Lỗi tạo chương, vui lòng thử lại!",
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isGeneratingAudio && !open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa Chương" : "Thêm Chương mới (AI Voice)"}
          </DialogTitle>
          <DialogDescription>
            Nhập nội dung truyện và chọn giọng đọc. AI sẽ tự động đọc và tạo
            file âm thanh mp3.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit) as any}
            className="space-y-4 py-4"
          >
            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control as any}
                name="chapterNumber"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Số chương <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isGeneratingAudio}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>
                      Tên chương <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Khởi đầu mới..."
                        disabled={isGeneratingAudio}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* MỚI: PHẦN CHỌN GIỌNG ĐỌC VÀ FILE CLONE */}
            <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg border">
              <FormField
                control={form.control as any}
                name="voiceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn Giọng Đọc AI</FormLabel>
                    <Select
                      disabled={isGeneratingAudio}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giọng đọc..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Xuân Vĩnh (Nam - Miền Nam)">
                          Xuân Vĩnh (Nam - Miền Nam)
                        </SelectItem>
                        <SelectItem value="Phạm Tuyên (Nam - Miền Bắc)">
                          Phạm Tuyên (Nam - Miền Bắc)
                        </SelectItem>
                        <SelectItem value="Bích Ngọc (Nữ - Miền Bắc)">
                          Bích Ngọc (Nữ - Miền Bắc)
                        </SelectItem>
                        <SelectItem value="Thục Đoan (Nữ - Miền Nam)">
                          Thục Đoan (Nữ - Miền Nam)
                        </SelectItem>
                        <SelectItem
                          value="clone"
                          className="font-semibold text-indigo-600"
                        >
                          ✨ Nhái giọng (Clone Voice)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Chỉ hiện thị ô này nếu người dùng chọn "clone" */}
              {currentVoiceType === "clone" && (
                <FormField
                  control={form.control as any}
                  name="refAudio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên file âm thanh mẫu (.wav/.mp3)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: giong_mau_1.wav"
                          disabled={isGeneratingAudio}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control as any}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung chữ (Text để AI đọc)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập nội dung truyện vào đây..."
                      className="resize-none h-56 leading-relaxed"
                      disabled={isGeneratingAudio}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4 space-x-2 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isGeneratingAudio}
              >
                Hủy bỏ
              </Button>

              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 min-w-[180px]"
                disabled={isGeneratingAudio}
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI đang xử lý...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    {isEditing ? "Lưu & Đọc lại" : "Tạo Audio & Lưu"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterModal;
