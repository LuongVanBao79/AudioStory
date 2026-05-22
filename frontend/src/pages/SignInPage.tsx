import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 1. Định nghĩa Schema bắt lỗi cho Đăng nhập (Chỉ cần Email và Password)
const signInSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ." }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu." }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const SignInPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 2. Khởi tạo Form
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Lấy hàm login từ Zustand ra
  const { login } = useAuthStore();

  // 3. Xử lý Submit
  const onSubmit = async (values: SignInFormValues) => {
    setIsLoading(true);
    try {
      // 1. Chỉ cần gọi 1 dòng này, Zustand và Axios sẽ lo toàn bộ việc gọi API Node.js và lưu Cookie!
      await login(values);

      // 2. Thành công thì bật thông báo và chuyển trang
      toast.success("Đăng nhập thành công! Chào mừng trở lại.");
      navigate("/");
    } catch (error: any) {
      // 3. Nếu sai pass, Axios sẽ ném lỗi ra đây, Zustand truyền ra và ta hiện thông báo đỏ
      toast.error(error.response?.data?.message || "Sai email hoặc mật khẩu!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Grid Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
      `,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="min-h-screen flex items-center justify-center relative z-10 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Đăng nhập
            </CardTitle>
            <CardDescription>
              Nhập email và mật khẩu để truy cập trang Quản trị
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin@audiostory.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="******"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t px-6 py-4">
            <div className="text-sm text-center text-slate-600">
              Bạn chưa có tài khoản?{" "}
              <Link
                to="/signup"
                className="font-semibold text-slate-900 hover:underline"
              >
                Đăng ký ngay
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignInPage;
