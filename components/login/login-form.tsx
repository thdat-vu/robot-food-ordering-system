"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UtensilsCrossed, Lock, Eye, EyeOff, User, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import useAuth from "@/service/authen/authenticationService";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { handleLogin, loading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(username, password);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-200">
      {/* Logo and Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 transform hover:scale-105 transition-transform duration-300">
              <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-[10px]">✓</span>
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Chào mừng trở lại
          </h1>
          <p className="text-gray-500 mt-2">
            Đăng nhập để quản lý nhà hàng của bạn
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-red-800 font-medium text-sm">Đăng nhập thất bại</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username Field */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
            Tên đăng nhập
          </Label>
          <div className="relative group">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              focusedField === 'username' ? 'text-primary' : 'text-gray-400'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <Input
              id="username"
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              className="pl-12 h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
            Mật khẩu
          </Label>
          <div className="relative group">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              focusedField === 'password' ? 'text-primary' : 'text-gray-400'
            }`}>
              <Lock className="w-5 h-5" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className="pl-12 pr-12 h-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-gray-900 placeholder:text-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="w-5 h-5 rounded-md border-2"
            />
            <Label
              htmlFor="remember"
              className="text-sm font-medium cursor-pointer text-gray-700 select-none"
            >
              Ghi nhớ đăng nhập
            </Label>
          </div>
          <a
            href="#"
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-4"
          >
            Quên mật khẩu?
          </a>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang đăng nhập...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Đăng nhập
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-gray-500 font-medium">
            Hoặc
          </span>
        </div>
      </div>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-gray-500">
        Bạn chưa có tài khoản?{" "}
        <a
          href="#"
          className="font-semibold text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-4"
        >
          Đăng ký ngay
        </a>
      </p>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-center text-xs text-gray-500">
          Bằng việc đăng nhập, bạn đồng ý với{" "}
          <a href="#" className="text-primary hover:underline">Điều khoản sử dụng</a>
          {" "}và{" "}
          <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>
        </p>
      </div>
    </div>
  );
}
