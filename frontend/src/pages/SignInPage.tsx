import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Headphones, Mail, Lock, Eye, EyeOff } from "lucide-react";

import { useAuthStore } from "@/stores/useAuthStore";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import bgImage from "@/assets/backgroundaudiostory.png";

const signInSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ." }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu." }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const SignInPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuthStore();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    setIsLoading(true);

    try {
      await login(values);

      toast.success("Đăng nhập thành công!");

      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Sai email hoặc mật khẩu!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />

      {/* Overlay sáng hơn */}
      <div className="absolute inset-0 bg-black/10" />
      {/* Blur circle decoration */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-indigo-400/30 rounded-full blur-3xl" />

      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-blue-300/30 rounded-full blur-3xl" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div
          className="
            rounded-3xl
            border border-white/40
            bg-white/25
            backdrop-blur-xl
            shadow-[0_8px_32px_rgba(0,0,0,0.15)]
            p-8
          "
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="
                w-14 h-14 rounded-2xl
                bg-gradient-to-br from-indigo-500 to-blue-500
                flex items-center justify-center
                shadow-lg
                mb-4
              "
            >
              <Headphones className="w-7 h-7 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-slate-800">AudioStory</h1>

            <p className="text-slate-600 text-sm mt-2 text-center">
              Hệ thống quản trị sách nói & thư viện điện tử
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Email</FormLabel>

                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                        <input
                          type="email"
                          placeholder="admin@audiostory.com"
                          {...field}
                          className="
                            w-full
                            pl-10
                            pr-4
                            py-3
                            rounded-xl
                            bg-white/70
                            border border-white/60
                            text-slate-700
                            placeholder:text-slate-400
                            focus:outline-none
                            focus:ring-2
                            focus:ring-indigo-400
                            focus:border-transparent
                            transition-all
                          "
                        />
                      </div>
                    </FormControl>

                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Mật khẩu</FormLabel>

                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="
                            w-full
                            pl-10
                            pr-12
                            py-3
                            rounded-xl
                            bg-white/70
                            border border-white/60
                            text-slate-700
                            placeholder:text-slate-400
                            focus:outline-none
                            focus:ring-2
                            focus:ring-indigo-400
                            focus:border-transparent
                            transition-all
                          "
                        />

                        {/* Eye Icon */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                            hover:text-slate-600
                            transition-colors
                          "
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>

                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full
                  py-3
                  rounded-xl
                  bg-gradient-to-r
                  from-indigo-500
                  to-blue-500
                  hover:from-indigo-600
                  hover:to-blue-600
                  text-white
                  font-semibold
                  shadow-lg
                  transition-all
                  duration-200
                  flex
                  items-center
                  justify-center
                  gap-2
                  disabled:opacity-70
                "
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>
          </Form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/signup"
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
