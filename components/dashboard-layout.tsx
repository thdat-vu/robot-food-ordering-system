"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  Clock,
  BarChart3,
  Calendar,
  ShoppingBag,
  Settings,
  Bell,
  Search,
  ChevronRight,
  Menu,
  X,
  ChefHat,
  Shield,
  UserCog,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

type DashboardLayoutProps = {
  children: React.ReactNode;
  role?: "chef" | "manager" | "moderator" | "admin";
  secondaryNav?: { key: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  activeSecondary?: string;
  onSecondaryChange?: (key: string) => void;
  hidePrimaryNav?: boolean;
};

const navigation = [
  { name: "Tổng Quan", icon: LayoutDashboard, href: "#", current: true },
  {
    name: "Quản Lý Thực Đơn",
    icon: UtensilsCrossed,
    href: "#",
    current: false,
  },
  { name: "Nhân Viên", icon: Users, href: "#", current: false },
  { name: "Giờ Làm Việc", icon: Clock, href: "#", current: false },
  { name: "Phân Tích", icon: BarChart3, href: "#", current: false },
  { name: "Đặt Bàn", icon: Calendar, href: "#", current: false },
  { name: "Đơn Hàng", icon: ShoppingBag, href: "#", current: false },
  { name: "Cài Đặt", icon: Settings, href: "#", current: false },
];

const roleConfig = {
  chef: { label: "Bếp Trưởng", icon: ChefHat, initials: "BT" },
  manager: { label: "Quản Lý", icon: Users, initials: "QL" },
  moderator: { label: "Kiểm Duyệt", icon: Shield, initials: "KD" },
  admin: { label: "Quản Trị", icon: UserCog, initials: "QT" },
};

export function DashboardLayout({
  children,
  secondaryNav,
  activeSecondary,
  onSecondaryChange,
  hidePrimaryNav,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Tổng Quan");
  const [user , setUserInfo] = useState<DecodedToken | null >(null);

  
  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserInfo(parsed);
      } catch (err) {
        console.error("Lỗi đọc userInfo từ localStorage:", err);
      }
    }
  }, []);
  const currentRole = roleConfig[user?.Role.toLowerCase() as keyof typeof roleConfig] || {label: "Người Dùng", initials: "ND" };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">
                La Cuisine
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {!hidePrimaryNav && navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveNav(item.name);
                  console.log("[v0] Navigation clicked:", item.name);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeNav === item.name
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            ))}

            {/* Secondary navigation (per-page) */}
            {secondaryNav && secondaryNav.length > 0 && (
              <div className="mt-4 pt-4 border-t border-sidebar-border">
                {secondaryNav.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => onSecondaryChange && onSecondaryChange(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSecondary === item.key
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentRole.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                 {user?.Name || "Người Dùng"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentRole.label}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 sm:h-16 bg-card border-b border-border">
          <div className="flex items-center justify-between h-full px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm..."
                  className="pl-10 bg-background border-input"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
