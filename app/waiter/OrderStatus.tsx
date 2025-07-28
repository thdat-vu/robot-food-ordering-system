"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function OrderStatus({ dish }: { dish: any }) {
  if (!dish) {
    return (
      <div className="w-2/3 p-4 flex items-center justify-center text-muted-foreground text-sm">
        <p>Chọn món để xem trạng thái phục vụ</p>
      </div>
    );
  }

  const handleComplete = () => {
    toast("Hoàn thành đơn hàng", {
      description: `Món ${dish.name} đã được phục vụ thành công!`,
    });
  };

  return (
    <div className="w-2/3 p-4 space-y-6">
      {/* Thông tin đơn hàng */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Đơn hàng: {dish.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-gray-600">
          <p>Mã đơn: {dish.id}</p>
          <p>Bàn: {dish.table}</p>
          <p>Thời gian: {dish.time || "12:00"}</p>
          <p>Ghi chú: {dish.note || "Không có"}</p>
        </CardContent>
      </Card>

      {/* Tiến trình phục vụ */}
      <div>
        <Label className="mb-1 block">Tiến trình phục vụ</Label>
        <Progress value={70} className="h-3" />
        <p className="text-sm mt-1 text-green-700">Đang phục vụ ✅</p>
      </div>

      {/* Sơ đồ phục vụ */}
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden shadow">
        <iframe
          src="https://map-doan-nhattruowngs-projects.vercel.app/map/5"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 w-full h-full rounded-lg border-none"
          title="Map Embed"
        />
        <div
          className="absolute"
          style={{
            left: "60%",
            top: "40%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-white animate-pulse" />
          <div className="text-xs text-red-700 font-bold text-center">
            Bàn 5
          </div>
        </div>
      </div>

      {/* Danh sách món đã phục vụ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Món đã phục vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Nước chanh dây #1</li>
            <li>Nước chanh dây #2</li>
          </ul>
        </CardContent>
      </Card>

      {/* Nút hoàn thành */}
      <div className="flex justify-center">
        <Button
          className="bg-yellow-400 text-white font-bold hover:bg-yellow-500"
          onClick={handleComplete}
        >
          Hoàn thành
        </Button>
      </div>
    </div>
  );
}
