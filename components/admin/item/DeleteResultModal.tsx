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
  tableName: string;
  errorMessage?: string;
  onClose: () => void;
};

export const DeleteResultModal: React.FC<Props> = ({
  open,
  isSuccess,
  tableName,
  errorMessage,
  onClose,
}) => {
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
              {isSuccess ? "Xoá bàn thành công!" : "Xoá bàn thất bại!"}
            </DialogTitle>

            {/* Description */}
            <DialogDescription className="mt-3 text-gray-600">
              {isSuccess ? (
                <>
                  Bàn <span className="font-semibold text-gray-800">{tableName}</span> đã được xoá khỏi hệ thống.
                </>
              ) : (
                <>
                  Không thể xoá bàn{" "}
                  <span className="font-semibold text-gray-800">{tableName}</span>.
                  <br />
                  <span className="text-red-600 font-medium mt-2 block">
                    {errorMessage || "Đã xảy ra lỗi trong quá trình xoá."}
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
