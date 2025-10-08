"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UtensilsCrossed,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChefHat,
  Users,
  Shield,
} from "lucide-react";

type UserRole = "chef" | "waiter" | "moderator";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("chef");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[v0] Login attempt:", {
      phone,
      role: selectedRole,
      rememberMe,
    });

    if (selectedRole === "chef") {
      router.push("/chef");
    } else if (selectedRole === "waiter") {
      router.push("/waiter");
    } else if (selectedRole === "moderator") {
      router.push("/moderator");
    }
  };

  const roles = [
    {
      value: "chef" as UserRole,
      label: "Chef",
      icon: ChefHat,
      description: "Kitchen management",
    },
    {
      value: "waiter" as UserRole,
      label: "Waiter",
      icon: Users,
      description: "Restaurant operations",
    },
    {
      value: "moderator" as UserRole,
      label: "Moderator",
      icon: Shield,
      description: "Content moderation",
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
          Welcome back
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Sign in to your account to continue
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select your role</Label>
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

        <div className="space-y-4">
          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+84 123 456 789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 h-11 sm:h-12 bg-card border-input"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
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
              Remember me
            </Label>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-primary hover:text-accent transition-colors"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 sm:h-12 text-base font-medium"
        >
          Sign in
        </Button>
      </form>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-muted-foreground">
        {"Don't have an account? "}
        <a
          href="#"
          className="font-medium text-primary hover:text-accent transition-colors"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}
