import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  Edit,
  Settings,
  DollarSign,
  Clock,
  Store,
  Percent,
  Users,
  Calendar,
  LucideIcon,
} from "lucide-react";
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

// ✅ Import thêm getPaymentPolicy từ service có sẵn của bạn
import { getPaymentPolicy, updatePaymentPolicy } from "@/lib/api/settings";

interface ConfigItem {
  id: number;
  key: string;
  value: string;
  category: string;
  description: string;
  icon: LucideIcon;
}

interface CategoryInfo {
  key: string;
  label: string;
}

interface ResultDialog {
  open: boolean;
  success: boolean;
  message: string;
}

interface RestrictionDialog {
  open: boolean;
  availableAt: Date | null;
}

interface ConfirmDialog {
  open: boolean;
  target: "prepay" | "postpay" | null;
}

const configs: ConfigItem[] = [
  {
    id: 1,
    key: "Restaurant Name",
    value: "The Golden Fork",
    category: "General",
    description: "Display name",
    icon: Store,
  },
  {
    id: 2,
    key: "Opening Hours",
    value: "10:00 AM - 10:00 PM",
    category: "General",
    description: "Business hours",
    icon: Clock,
  },
  {
    id: 3,
    key: "Tax Rate",
    value: "10%",
    category: "Financial",
    description: "VAT percentage",
    icon: Percent,
  },
  {
    id: 4,
    key: "Service Charge",
    value: "5%",
    category: "Financial",
    description: "Service fee",
    icon: DollarSign,
  },
  {
    id: 5,
    key: "Max Table Capacity",
    value: "50",
    category: "Operations",
    description: "Total tables",
    icon: Users,
  },
  {
    id: 6,
    key: "Reservation Lead Time",
    value: "2 hours",
    category: "Operations",
    description: "Minimum booking time",
    icon: Calendar,
  },
];

const categoryColors: Record<string, string> = {
  General: "from-blue-500/10 to-blue-600/5",
  Financial: "from-emerald-500/10 to-emerald-600/5",
  Operations: "from-purple-500/10 to-purple-600/5",
};

const categoryIcons: Record<string, LucideIcon> = {
  General: Settings,
  Financial: DollarSign,
  Operations: Clock,
};

export const ConfigPage: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<"prepay" | "postpay">(
    "postpay"
  );

  const [loadingPolicy, setLoadingPolicy] = useState<boolean>(true);

  const [resultDialog, setResultDialog] = useState<{
    open: boolean;
    success: boolean;
    message: string;
  }>({ open: false, success: true, message: "" });

  const [restrictionDialog, setRestrictionDialog] = useState<{
    open: boolean;
    availableAt: Date | null;
  }>({ open: false, availableAt: null });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    target: "prepay" | "postpay" | null;
  }>({ open: false, target: null });

  // ✅ GET policy khi load trang
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingPolicy(true);

        // policy backend trả "Prepay" | "Postpay"
        const policy = await getPaymentPolicy();

        if (!mounted) return;
        setPaymentMethod(policy === "Prepay" ? "prepay" : "postpay");
      } catch (err) {
        console.error("Get payment policy failed:", err);
      } finally {
        if (mounted) setLoadingPolicy(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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

  const formatVnDate = (d: Date | null) => {
    if (!d) return "";
    const dateStr = d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `00:00 ngày ${dateStr}`;
  };

  const handleSelectPolicy = async (v: "prepay" | "postpay") => {
    if (loadingPolicy) return;

    if (paymentMethod === "prepay" && v === "postpay") {
      const nextMidnight = getNextMidnight();
      setRestrictionDialog({ open: true, availableAt: nextMidnight });
      return;
    }
    setConfirmDialog({ open: true, target: v });
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
      <div className="space-y-8 pb-8">
        {/* Payment Method Section - Hero Style */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-background border border-primary/10 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
                <DollarSign className="w-3 h-3" />
                Chính sách thanh toán
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Phương Thức Thanh Toán
              </h2>
              <p className="text-muted-foreground">
                {loadingPolicy
                  ? "Đang tải chính sách thanh toán..."
                  : "Chọn thời điểm khách hàng thanh toán phù hợp với mô hình kinh doanh"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  loadingPolicy ? "opacity-60 pointer-events-none" : ""
                } ${
                  paymentMethod === "prepay"
                    ? "border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20"
                    : "border-2 border-border hover:border-primary/30 hover:shadow-md"
                }`}
                onClick={() => handleSelectPolicy("prepay")}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-3 rounded-xl ${
                          paymentMethod === "prepay"
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary group-hover:bg-primary/20"
                        } transition-colors`}
                      >
                        <DollarSign className="w-5 h-5" />
                      </div>

                      {paymentMethod === "prepay" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-in zoom-in">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        Thanh toán trước
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Khách thanh toán trước khi nhận món. Giúp kiểm soát dòng
                        tiền tốt hơn.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  loadingPolicy ? "opacity-60 pointer-events-none" : ""
                } ${
                  paymentMethod === "postpay"
                    ? "border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20"
                    : "border-2 border-border hover:border-primary/30 hover:shadow-md"
                }`}
                onClick={() => handleSelectPolicy("postpay")}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-3 rounded-xl ${
                          paymentMethod === "postpay"
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary group-hover:bg-primary/20"
                        } transition-colors`}
                      >
                        <Clock className="w-5 h-5" />
                      </div>

                      {paymentMethod === "postpay" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-in zoom-in">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        Thanh toán sau
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Khách thanh toán sau khi dùng xong. Tạo trải nghiệm
                        thoải mái hơn.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Configuration Categories */}
        {[
          { key: "General", label: "Cài Đặt Chung" },
          { key: "Financial", label: "Cài Đặt Tài Chính" },
          { key: "Operations", label: "Cài Đặt Vận Hành" },
        ].map((category) => {
          const CategoryIcon = categoryIcons[category.key];
          const categoryConfigs = configs.filter(
            (c) => c.category === category.key
          );

          return (
            <div key={category.key} className="space-y-4">
              <div
                className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${
                  categoryColors[category.key]
                } border border-border/50`}
              >
                <div className="p-2 rounded-lg bg-background/80 backdrop-blur">
                  <CategoryIcon className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {category.label}
                  </h3>
                </div>
                <Badge variant="secondary" className="text-xs font-medium">
                  {categoryConfigs.length} mục
                </Badge>
              </div>

              <div className="grid gap-3">
                {categoryConfigs.map((config) => {
                  const ConfigIcon = config.icon;
                  return (
                    <Card
                      key={config.id}
                      className="group hover:shadow-md transition-all duration-200 hover:border-primary/30"
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-2.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                              <ConfigIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-foreground mb-1">
                                {config.key}
                              </div>
                              <div className="text-sm text-muted-foreground mb-3">
                                {config.description}
                              </div>
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-muted to-muted/50 text-sm font-mono font-medium border border-border/50">
                                {config.value}
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 w-full sm:w-auto group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                          >
                            <Edit className="w-4 h-4" />
                            Chỉnh Sửa
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Restriction Dialog */}
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

      {/* Confirm Dialog */}
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

      {/* Result Dialog */}
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
