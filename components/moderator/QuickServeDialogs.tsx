import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Zap } from "lucide-react";

interface SmartServeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  otherCount: number;
  otherTableNames: string[];
  onProcessSingle: () => void;
  onProcessAll: () => void;
  onCancel: () => void;
}

export const SmartServeDialog: React.FC<SmartServeDialogProps> = ({
  open,
  onOpenChange,
  otherCount,
  otherTableNames,
  onProcessSingle,
  onProcessAll,
  onCancel,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xử lý đồng bộ</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-600">
            Hệ thống phát hiện còn <strong>{otherCount}</strong> yêu cầu phục vụ
            nhanh từ các bàn: <strong>{otherTableNames.join(", ")}</strong>.{" "}
            <br />
            Bạn có muốn xử lý tất cả các yêu cầu này cùng lúc không?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onCancel}>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction
            onClick={onProcessSingle}
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
          >
            Chỉ xử lý bàn này
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onProcessAll}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            <Zap className="w-4 h-4 mr-2" />
            Xác nhận xử lý tất cả
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface GlobalServeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  tableNames: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const GlobalServeDialog: React.FC<GlobalServeDialogProps> = ({
  open,
  onOpenChange,
  count,
  tableNames,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xử lý hàng loạt</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-600">
            Bạn đang thực hiện xử lý <strong>{count}</strong> yêu cầu phục vụ
            nhanh đang chờ từ các bàn: <strong>{tableNames.join(", ")}</strong>.
            <br />
            Bạn có chắc chắn muốn xác nhận đã hoàn thành tất cả không?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200"
          >
            <Zap className="w-4 h-4 mr-2" />
            Xác nhận hoàn thành
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
