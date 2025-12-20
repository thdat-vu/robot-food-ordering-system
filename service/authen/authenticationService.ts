import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import {authsApi} from "@/lib/api/auths";



export default function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // 🔹 Gọi API đăng nhập
      const res = await authsApi.SignIn(username, password);

      if (!res?.success || !res?.data?.accessToken) {
        throw new Error(res?.message || "Đăng nhập thất bại");
      }

      const token = res.data.accessToken;

      // 🔹 Giải mã JWT
      const decoded: DecodedToken = jwtDecode(token);
     

      if (!decoded.Role) {
        throw new Error("Không tìm thấy quyền trong token");
      }

      // 🔹 Lưu token & role
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userInfo", JSON.stringify(decoded));
      // 🔹 Điều hướng theo quyền
      redirectByRole(decoded.Role);
    } catch (err: any) {
      console.error("❌ Login error:", err);
      setError(err.message || "Có lỗi xảy ra khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role: string) => {
    const normalizedRole = role.toLowerCase();
    switch (normalizedRole) {
      case "admin":
        router.push("/admin");
        break;
      case "chef":
        router.push("/chef");
        break;
      case "moderator":
        router.push("/moderator");
        break;
      case "waiter":
        router.push("/waiter");
        break;
      default:
        router.push("/");
        break;
    }
  };

  return { handleLogin, loading, error };
}
