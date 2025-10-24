"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserCog,
  UtensilsCrossed,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChefHat,
  Users,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useAuth from "@/service/authen/authenticationService";
import { error } from 'console';

type UserRole = "chef" | "waiter" | "moderator" | "admin";

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
  const [selectedRole, setSelectedRole] = useState<UserRole>();
  const { handleLogin, loading, error } = useAuth(); // ✅ đúng
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(username, password);
  };

   

  const roles = [
    {
      value: "chef" as UserRole,
      label: "Bếp",
      icon: ChefHat,
      description: "Quản lý bếp",
    },
    {
      value: "waiter" as UserRole,
      label: "Phục vụ",
      icon: Users,
      description: "Phục vụ nhà hàng",
    },
    {
      value: "moderator" as UserRole,
      label: "Điều phối",
      icon: Shield,
      description: "Kiểm duyệt",
    },
    {
      value: "admin" as UserRole,
      label: "Quản trị viên",
      icon: UserCog,
      description: "Quản trị hệ thống",
    },
  ];

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
        {/* Role Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Chức vụ</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`flex flex-row sm:flex-col items-center gap-3 sm:gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    selectedRole === role.value
                      ? "border-primary bg-primary/5"
                      : "border-input bg-card hover:border-primary/50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      selectedRole === role.value
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div className="text-left sm:text-center flex-1 sm:flex-none">
                    <div
                      className={`text-sm font-medium ${
                        selectedRole === role.value
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {role.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {role.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Username Field */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Tên đăng nhập
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
