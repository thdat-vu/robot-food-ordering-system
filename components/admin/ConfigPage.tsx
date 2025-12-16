import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updatePaymentPolicy } from "@/lib/api/settings";

const configs = [
  {
    id: 1,
    key: "Restaurant Name",
    value: "The Golden Fork",
    category: "General",
    description: "Display name",
  },
  {
    id: 2,
    key: "Opening Hours",
    value: "10:00 AM - 10:00 PM",
    category: "General",
    description: "Business hours",
  },
  {
    id: 3,
    key: "Tax Rate",
    value: "10%",
    category: "Financial",
    description: "VAT percentage",
  },
  {
    id: 4,
    key: "Service Charge",
    value: "5%",
    category: "Financial",
    description: "Service fee",
  },
  {
    id: 5,
    key: "Max Table Capacity",
    value: "50",
    category: "Operations",
    description: "Total tables",
  },
  {
    id: 6,
    key: "Reservation Lead Time",
    value: "2 hours",
    category: "Operations",
    description: "Minimum booking time",
  },
];

export const ConfigPage: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<"prepay" | "postpay">(
    "postpay"
  );
  console.log(paymentMethod + "===================");
  const [resultDialog, setResultDialog] = useState<{
    open: boolean;
    success: boolean;
    message: string;
  }>({ open: false, success: true, message: "" });

  const getNextMidnight = () => {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0
    );
  };

  const [restrictionDialog, setRestrictionDialog] = useState<{
    open: boolean;
    availableAt: Date | null;
  }>({ open: false, availableAt: null });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    target: "prepay" | "postpay" | null;
  }>({ open: false, target: null });

  const handleSelectPolicy = async (v: "prepay" | "postpay") => {
    if (paymentMethod === "prepay" && v === "postpay") {
      const nextMidnight = getNextMidnight();
      setRestrictionDialog({ open: true, availableAt: nextMidnight });
      return;
    }
    setConfirmDialog({ open: true, target: v });
  };

  const formatVnDate = (d: Date | null) => {
    if (!d) return "";
    const dateStr = d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `00:00 ngày ${dateStr}`;
  };

  const confirmChangePolicy = async () => {
    if (!confirmDialog.target) return;
    const v = confirmDialog.target;
    const nextLabel = v === "prepay" ? "Thanh toán trước" : "Thanh toán sau";
    const prev = paymentMethod;
    setConfirmDialog({ open: false, target: null });
    setPaymentMethod(v);
    try {
      await updatePaymentPolicy(v === "prepay" ? "Prepay" : "Postpay");
      setResultDialog({
        open: true,
        success: true,
        message: `Đã chuyển sang "${nextLabel}" thành công.`,
      });
    } catch (e: any) {
      setPaymentMethod(prev);
      setResultDialog({
        open: true,
        success: false,
        message: `Cập nhật thất bại. Vui lòng thử lại.`,
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="font-medium text-foreground">
            Phương Thức Thanh Toán
          </div>
          <div className="text-sm text-muted-foreground mb-3">
            Chọn thời điểm khách hàng thanh toán
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                paymentMethod === "prepay"
                  ? "border-2 border-primary bg-primary/5"
                  : "border-2 border-transparent hover:border-muted-foreground/20"
              }`}
              onClick={() => handleSelectPolicy("prepay")}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold text-foreground">
                        Thanh toán trước
                      </div>

                      {paymentMethod === "prepay" && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Khách thanh toán trước khi nhận món
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                paymentMethod === "postpay"
                  ? "border-2 border-primary bg-primary/5"
                  : "border-2 border-transparent hover:border-muted-foreground/20"
              }`}
              onClick={() => handleSelectPolicy("postpay")}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold text-foreground">
                        Thanh toán sau
                      </div>
                      {paymentMethod === "postpay" && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Khách thanh toán sau khi dùng xong
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {[
          { key: "General", label: "Cài Đặt Chung" },
          { key: "Financial", label: "Cài Đặt Tài Chính" },
          { key: "Operations", label: "Cài Đặt Vận Hành" },
        ].map((category) => (
          <div key={category.key}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {category.label}
              </h3>
              <Badge variant="outline" className="text-xs">
                {configs.filter((c) => c.category === category.key).length} mục
              </Badge>
            </div>
            <div className="grid gap-3">
              {configs
                .filter((config) => config.category === category.key)
                .map((config) => (
                  <Card
                    key={config.id}
                    className="hover:shadow-sm transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-medium text-foreground mb-1">
                            {config.key}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {config.description}
                          </div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-muted text-sm font-mono">
                            {config.value}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 w-full sm:w-auto bg-transparent"
                        >
                          <Edit className="w-4 h-4" />
                          Chỉnh Sửa
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {/* Payment section moved above */}
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={restrictionDialog.open}
        onOpenChange={(v) =>
          setRestrictionDialog((prev) => ({ ...prev, open: v }))
        }
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Không thể đổi ngay</DialogTitle>
            <DialogDescription>
              Hệ thống đang ở chế độ "Thanh toán trước". Bạn chỉ có thể đổi sang
              "Thanh toán sau" từ {formatVnDate(restrictionDialog.availableAt)}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() =>
                setRestrictionDialog({ open: false, availableAt: null })
              }
            >
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(v) => setConfirmDialog((prev) => ({ ...prev, open: v }))}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Bạn có chắc muốn thay đổi?</DialogTitle>
            <DialogDescription>
              Thao tác này sẽ cập nhật chính sách thanh toán hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, target: null })}
            >
              Hủy
            </Button>
            <Button onClick={confirmChangePolicy}>Đồng ý</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={resultDialog.open}
        onOpenChange={(v) => setResultDialog((prev) => ({ ...prev, open: v }))}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>
              {resultDialog.success
                ? "Cập nhật thành công"
                : "Cập nhật thất bại"}
            </DialogTitle>
            <DialogDescription>{resultDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() =>
                setResultDialog((prev) => ({ ...prev, open: false }))
              }
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
