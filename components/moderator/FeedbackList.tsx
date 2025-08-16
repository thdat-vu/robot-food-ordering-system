import React from "react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface FeedbackData {
  idFeedback: string;
  idTable: string;
  feedBack: string;
  isPending: boolean;
  createDate: string;
  orderId: string;
  orderItems: {
    name: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
  rating?: number;
  customerName?: string;
}

export default function FeedbackList({
  tableId,
  feedbacks,
}: {
  tableId: string;
  feedbacks: FeedbackData[];
}) {
  if (!feedbacks || feedbacks.length === 0) {
    return <p>Không có phản hồi nào cho bàn này.</p>;
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((fb) => (
        <Card
          key={fb.idFeedback}
          className="p-4 shadow-sm border rounded-xl bg-white space-y-3"
        >
          {/* Tiêu đề */}
          <h2 className="font-semibold text-lg">{fb.feedBack}</h2>
          <p className="text-sm text-gray-500">
            Bàn {fb.idTable} · {fb.customerName ?? "Khách ẩn danh"}
          </p>

          {/* Nội dung feedback */}
          <p className="text-gray-700">{fb.feedBack}</p>

          {/* Thông tin đơn hàng */}
          <div className="mt-3 p-3 bg-red-50 rounded-lg border text-sm space-y-2">
            <p className="font-semibold text-purple-600">
              Đơn hàng {fb.orderId} · Phản hồi về món ăn
            </p>
            {fb.orderItems.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm"
              >
                <span>
                  {item.name} ({item.price.toLocaleString()}đ x {item.quantity})
                </span>
                <span className="font-medium">
                  {(item.price * item.quantity).toLocaleString()}đ
                </span>
              </div>
            ))}
            <div className="text-right font-semibold">
              Tổng đơn: {fb.totalPrice.toLocaleString()}đ
            </div>
          </div>

          {/* Rating
          {fb.rating && (
            <div className="flex space-x-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < fb.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
          )} */}

          {/* Footer */}
          <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
            <span>
              {fb.isPending ? (
                <span className="text-yellow-500">Chưa xử lý</span>
              ) : (
                <span className="text-green-500">Đã xử lý</span>
              )}
            </span>
            <span>{fb.createDate}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
