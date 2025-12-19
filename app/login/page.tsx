"use client"

import { LoginForm } from "@/components/login/login-form";
import { Sparkles, UtensilsCrossed } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Enhanced Image Section with lighter overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/elegant-restaurant-interior-with-warm-lighting-and.jpg"
          alt="Restaurant interior"
          className="object-cover w-full h-full scale-105 hover:scale-100 transition-transform duration-[3000ms]"
        />
        {/* Lighter gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/30 to-transparent" />
        
        {/* Floating decorative elements - simplified */}
        <div className="absolute top-8 left-8 flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-5 py-2.5 border border-white/30 shadow-lg">
          <UtensilsCrossed className="w-5 h-5 text-white" />
          <span className="text-white text-sm font-semibold">Robot Food Ordering System</span>
        </div>
        
        {/* Main content */}
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-amber-300 text-sm font-semibold uppercase tracking-wider">Hệ thống quản lý hiện đại</span>
          </div>
          <h2 className="text-5xl font-serif font-bold mb-4 text-white leading-tight drop-shadow-lg">
            Trải nghiệm<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
              ẩm thực tuyệt hảo
            </span>
          </h2>
          <p className="text-lg text-white/90 max-w-md leading-relaxed drop-shadow">
            Quản lý nhà hàng thông minh với công nghệ robot phục vụ hiện đại, 
            mang đến trải nghiệm độc đáo cho khách hàng.
          </p>
          
          {/* Feature pills - lighter style */}
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30 shadow-md">
              🤖 Robot phục vụ
            </span>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30 shadow-md">
              📱 Đặt món trực tuyến
            </span>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30 shadow-md">
              ⚡ Xử lý nhanh chóng
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Login Form with lighter styling */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Background decorative elements - lighter */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        
        <div className="w-full max-w-md relative z-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

