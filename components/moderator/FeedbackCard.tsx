"use client";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, CheckCircle, AlertCircle, Calendar } from "lucide-react";

type FeedbackCardProps = {
  table: string;
  item: {
    name: string;
    image: string;
  };
  feedback: string;
  status: "resolved" | "pending";
  createdAt: string;
};

export default function FeedbackCard({
  table,
  item,
  feedback,
  status,
  createdAt,
}: FeedbackCardProps) {
  return (
    <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4 flex items-start gap-4">
        {/* Ảnh order item */}
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 rounded-lg object-cover border"
        />

        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">{table}</span>
            {status === "resolved" ? (
              <CheckCircle className="text-green-500 w-5 h-5" />
            ) : (
              <AlertCircle className="text-yellow-500 w-5 h-5" />
            )}
          </div>

          <p className="text-gray-700 text-sm">{item.name}</p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            {feedback}
          </p>

          <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3" />
            {new Date(createdAt).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
