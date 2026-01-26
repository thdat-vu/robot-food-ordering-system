"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Smartphone, MessageSquare } from "lucide-react";

interface AttachDeviceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deviceId: string, reason: string) => Promise<void>;
  tableName: string;
}

export const AttachDeviceDialog: React.FC<AttachDeviceDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tableName,
}) => {
  const [deviceId, setDeviceId] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const REASONS = [
    "Thiết bị hỏng/lỗi kỹ thuật",
    "Thiết bị hết pin/đang sạc",
    "Lỗi kết nối mạng",
    "Khách yêu cầu đổi thiết bị",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDeviceId = deviceId.trim();

    if (!trimmedDeviceId || !reason) return;

    try {
      setIsSubmitting(true);
      await onSubmit(trimmedDeviceId, reason);
      setDeviceId("");
      setReason("");
      onClose();
    } catch (error) {
      // Error handling is managed by the parent via toast
      console.error("Attach device failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <DialogHeader className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-6 h-6" />
            Đổi thiết bị cho {tableName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              ID Thiết bị mới
            </label>
            <Input
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="Nhập deviceId (ví dụ: a1b2c3d4...)"
              className="rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Lý do đổi thiết bị
            </label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    reason === r
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                      : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {!reason && (
              <p className="text-[11px] text-red-500 font-medium ml-1">
                Vui lòng chọn một lý do
              </p>
            )}
          </div>

          <DialogFooter className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border-2 border-gray-200 hover:bg-gray-100 font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !deviceId.trim() || !reason}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-bold shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận đổi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
