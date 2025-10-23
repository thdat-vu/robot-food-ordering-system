"use client"

import { LoginForm } from "@/components/login/login-form";
import { authsApi } from "@/lib/api/auths";
import { useRouter } from "next/navigation";
import { useState } from "react";

// const res = await authsApi.SignIn("admin", "123456");
interface DecodedToken {
  sub: string;
  email?: string;
  role?: string;
  exp?: number;
}


export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔹 Call backend
      const res = await authsApi.SignIn(username, password);
      console.log("Sign-in result:", res);

      if (!res.success || !res.data?.accessToken) {
        setError(res.message || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }

      // 🔹 Decode JWT token
      const token = res.data.data.accessToken;
      console.log ("Access Token:", token);
      const decoded: DecodedToken = jwtDecode(token);

      // 🔹 Save token locally (already done in authsApi)
      // localStorage.setItem("accessToken", token);

      // 🔹 Role-based redirect
      switch (decoded.role) {
        case "Admin":
          router.push("/admin");
          break;
        case "Moderator":
          router.push("/moderator");
          break;
        case "Chef":
          router.push("/chef");
          break;
        case "Waiter":
          router.push("/waiter");
          break;
        default:
          router.push("/");
          break;
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Có lỗi xảy ra khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/elegant-restaurant-interior-with-warm-lighting-and.jpg"
          alt="Restaurant interior"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 text-white">
          <h2 className="text-4xl font-serif font-bold mb-3 text-balance">
            Trải nghiệm ẩm thực tuyệt hảo
          </h2>
          <p className="text-lg text-white/90 max-w-md leading-relaxed">
            Tham gia chúng tôi để trải nghiệm một hành trình ăn uống không thể
            quên nơi mỗi món ăn kể một câu chuyện
            story
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
function jwtDecode(token: any): DecodedToken {
  throw new Error("Function not implemented.");
}

