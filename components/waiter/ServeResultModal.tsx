"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

type Props = {
  open: boolean;
  isSuccess: boolean;
  servedCount: number;
  tableNumbers: number[];
  errorMessage?: string;
  onClose: () => void;
};

export const ServeResultModal: React.FC<Props> = ({
  open,
  isSuccess,
  servedCount,
  tableNumbers,
  errorMessage,
  onClose,
}) => {
  const formatTableNumbers = () => {
    if (tableNumbers.length === 0) return "";
    if (tableNumbers.length === 1) return `Bàn ${tableNumbers[0]}`;
    return tableNumbers.map((t) => `Bàn ${t}`).join(", ");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isSuccess ? "bg-emerald-100" : "bg-red-100"
              }`}
            >
              {isSuccess ? (
                <FiCheckCircle className="w-8 h-8 text-emerald-600" />
              ) : (
                <FiXCircle className="w-8 h-8 text-red-600" />
              )}
            </div>

            {/* Title */}
            <DialogTitle
              className={`text-xl font-semibold ${
                isSuccess ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {isSuccess ? "Phục vụ thành công!" : "Phục vụ thất bại!"}
            </DialogTitle>

            {/* Description */}
            <DialogDescription className="mt-3 text-gray-600">
              {isSuccess ? (
                <>
                  <span className="font-semibold text-emerald-700">
                    {servedCount} món
                  </span>{" "}
                  đã được phục vụ thành công cho{" "}
                  <span className="font-semibold text-gray-800">
                    {formatTableNumbers()}
                  </span>
                  .
                </>
              ) : (
                <>
                  Không thể phục vụ các món đã chọn.
                  <br />
                  <span className="text-red-600 font-medium mt-2 block">
                    {errorMessage || "Đã xảy ra lỗi trong quá trình phục vụ. Vui lòng thử lại."}
                  </span>
                </>
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            onClick={onClose}
            className={`w-full ${
              isSuccess
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
