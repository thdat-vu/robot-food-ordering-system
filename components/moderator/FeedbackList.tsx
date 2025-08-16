import React from "react";
import { Card } from "@/components/ui/card";
import { Star, Clock, CheckCircle, MessageSquare } from "lucide-react";
import Image from "next/image";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface FeedbackData {
  idFeedback: string;
  idTable: string;
  feedBack: string;
  isPending: boolean;
  createDate: string;
  orderId: string;
  orderItems: OrderItem[];
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
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <MessageSquare className="w-12 h-12 mb-4" />
        <p className="text-lg font-semibold">Không có phản hồi nào cho bàn này</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {feedbacks.map((fb) => (
        <Card
          key={fb.idFeedback}
          className="p-4 shadow-lg border rounded-xl bg-white transition-all duration-200 hover:shadow-xl"
        >
          {/* Header section */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-semibold text-xl line-clamp-1">{fb.feedBack}</h2>
              <p className="text-sm text-gray-600">
                Bàn {fb.idTable} · {fb.customerName || "Khách vãng lai"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  fb.isPending
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {fb.isPending ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Chưa xử lý
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Đã xử lý
                  </span>
                )}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(fb.createDate)}
              </span>
            </div>
          </div>

          {/* Rating (if exists)
          {fb.rating && (
            <div className="flex mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < fb.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))} */}
            {/* </div> */}
          {/* )} */}

          {/* Order details */}
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border text-sm space-y-3">
            <p className="font-semibold text-purple-600">
              Đơn hàng #{fb.orderId}
            </p>
            
            <div className="space-y-2">
              {fb.orderItems.map((item, idx) => (
                <div
                  key={`${fb.idFeedback}-${idx}`}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                 
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.price.toLocaleString()}đ × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium">
                    {(item.price * item.quantity).toLocaleString()}đ
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-600">Thành tiền:</span>
              <span className="font-semibold text-lg">
                {fb.totalPrice.toLocaleString()}đ
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
