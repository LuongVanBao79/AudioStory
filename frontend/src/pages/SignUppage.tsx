import React from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

// 1. IMPORT TRỰC TIẾP STORE (Không import authService)
import { useAuthStore } from "@/stores/useAuthStore";

// 2. KHAI BÁO SCHEMA ZOD
const signUpSchema = z
  .object({
    username: z
      .string()
      .min(2, { message: "Tên đăng nhập phải có ít nhất 2 ký tự." }),
    email: z.string().email({ message: "Email không hợp lệ." }),
    password: z
      .string()
      .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUppage = () => {
  const navigate = useNavigate();

  // 3. LẤY HÀM register VÀ TRẠNG THÁI isLoading TỪ ZUSTAND STORE
  const { register, isLoading } = useAuthStore();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // 4. XỬ LÝ SUBMIT THÔNG QUA STORE
  const onSubmit = async (values: SignUpFormValues) => {
    try {
      // Đổi tên field 'username' thành 'name' cho khớp với backend
      const { confirmPassword, username, ...rest } = values;

      await register({ name: username, ...rest }); // ← Sửa ở đây

      toast.success("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
      navigate("/signin");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Tạo tài khoản AudioStory
          </CardTitle>
          <CardDescription>
            Nhập thông tin của bạn để trải nghiệm hệ thống
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* TRƯỜNG TÊN ĐĂNG NHẬP */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên hiển thị (Username)</FormLabel>
                    <FormControl>
                      <Input placeholder="nguoidung_01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TRƯỜNG EMAIL */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="user@audiostory.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TRƯỜNG PASSWORD */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input placeholder="******" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TRƯỜNG CONFIRM PASSWORD */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xác nhận mật khẩu</FormLabel>
                    <FormControl>
                      <Input placeholder="******" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NÚT SUBMIT */}
              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử
                    lý...
                  </>
                ) : (
                  "Đăng ký"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 border-t px-6 py-4">
          <div className="text-sm text-center text-slate-600">
            Bạn đã có tài khoản?{" "}
            <Link
              to="/signin"
              className="font-semibold text-slate-900 hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUppage;
