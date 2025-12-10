"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UtensilsCrossed, Lock, Eye, EyeOff, User } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuth from "@/service/authen/authenticationService";
import { error } from 'console';

interface DecodedToken {
  sub: string;
  email?: string;
  role?: string;
  exp?: number;
}

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { handleLogin, loading, error } = useAuth(); // ✅ đúng
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(username, password);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Logo and Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <UtensilsCrossed className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
          Chào mừng
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Đăng nhập vào tài khoản của bạn để tiếp tục
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* Username Field */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Tên đăng nhập
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="vd: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 h-11 sm:h-12 bg-card border-input"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Mật khẩu
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-11 sm:h-12 bg-card border-input"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal cursor-pointer text-foreground"
            >
              Ghi nhớ tôi
            </Label>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-primary hover:text-accent transition-colors"
          >
            Quên mật khẩu?
          </a>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 sm:h-12 text-base font-medium"
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>

        {error && (
          <p className="text-center text-red-600 text-sm font-medium mt-2">
            {error}
          </p>
        )}
      </form>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-muted-foreground">
        {"Bạn chưa có tài khoản? "}
        <a
          href="#"
          className="font-medium text-primary hover:text-accent transition-colors"
        >
          Đăng ký
        </a>
      </p>
    </div>
  );
}
