import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  DollarSign,
  Clock,
  Loader2,
  Info,
  Store,
  Percent,
  Timer,
  CalendarClock,
  Table2,
  LucideIcon,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPaymentPolicy,
  updatePaymentPolicy,
  getSystemSettings,
  updateBusinessSettings,
} from "@/lib/api/settings";

interface ResultDialog {
  open: boolean;
  success: boolean;
  message: string;
}

interface ConfirmDialog {
  open: boolean;
  target: "prepay" | "postpay" | null;
}

type FormState = {
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  openingTime: string;
  closingTime: string;
  openingHours: string;
  taxRate: string;
  maxTableCapacity: string;
  tableAccessTimeoutWithoutOrderMinutes: string;
  orderCleanupAfterDays: string;
};

const emptyForm: FormState = {
  restaurantName: "",
  restaurantAddress: "",
  restaurantPhone: "",
  openingTime: "",
  closingTime: "",
  openingHours: "",
  taxRate: "",
  maxTableCapacity: "",
  tableAccessTimeoutWithoutOrderMinutes: "",
  orderCleanupAfterDays: "",
};

export const ConfigPage: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<"prepay" | "postpay">(
    "postpay"
  );
  const [pendingPolicy, setPendingPolicy] = useState<string | null>(null);
  const [effectiveDate, setEffectiveDate] = useState<string | null>(null);

  const [loadingPolicy, setLoadingPolicy] = useState<boolean>(true);
  const [savingPolicy, setSavingPolicy] = useState<boolean>(false);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [initialForm, setInitialForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const [resultDialog, setResultDialog] = useState<{
    open: boolean;
    success: boolean;
    message: string;
  }>({ open: false, success: true, message: "" });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    target: "prepay" | "postpay" | null;
  }>({ open: false, target: null });

  // Load payment policy + settings
  const loadPolicy = async () => {
    try {
      setLoadingPolicy(true);
      const policy = await getPaymentPolicy();
      setPaymentMethod(policy === "Prepay" ? "prepay" : "postpay");
    } catch (err) {
    } finally {
      setLoadingPolicy(false);
    }
  };

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const map = await getSystemSettings();
      const taxFromDb = map.TaxRate ?? "";
      const sanitizedTax = taxFromDb.replace("%", "").trim();
      const next: FormState = {
        restaurantName: map.RestaurantName ?? "",
        restaurantAddress: map.RestaurantAddress ?? "",
        restaurantPhone: map.RestaurantPhone ?? "",
        openingTime: map.OpeningTime ?? "",
        closingTime: map.ClosingTime ?? "",
        openingHours: map.OpeningHours ?? "",
        taxRate: sanitizedTax,
        maxTableCapacity: map.MaxTableCapacity ?? "",
        tableAccessTimeoutWithoutOrderMinutes:
          map.TableAccessTimeoutWithoutOrderMinutes ?? "",
        orderCleanupAfterDays: map.OrderCleanupAfterDays ?? "",
      };

      if (!next.openingHours && next.openingTime && next.closingTime) {
        next.openingHours = computeOpeningHours(
          next.openingTime,
          next.closingTime
        );
      }

      setForm(next);
      setInitialForm(next);

      setPendingPolicy(map.PaymentPolicyPending ?? null);
      setEffectiveDate(map.PaymentPolicyEffectiveDate ?? null);
    } catch (error: any) {
      setResultDialog({
        open: true,
        success: false,
        message:
          error?.response?.data?.message ||
          "Không thể tải cấu hình. Vui lòng thử lại.",
      });
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadPolicy();
    loadSettings();
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

  const formatDateTimeVn = (iso?: string | null) => {
    if (!iso) return "";
    const date = new Date(iso);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(date);
  };

  const parseTimeToMinutes = (time: string): number | null => {
    const match = time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (!match) return null;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 60 + minutes;
  };

  const to12h = (time: string) => {
    const minutes = parseTimeToMinutes(time);
    if (minutes === null) return "";
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const period = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")} ${period}`;
  };

  const computeOpeningHours = (open: string, close: string) => {
    const openMinutes = parseTimeToMinutes(open);
    const closeMinutes = parseTimeToMinutes(close);
    if (openMinutes === null || closeMinutes === null) return "";
    if (openMinutes >= closeMinutes) return "";
    return `${to12h(open)} - ${to12h(close)}`;
  };

  const toPolicyLabel = (value?: string | null) => {
    if (!value) return "";
    const raw = value.toLowerCase();
    if (raw === "prepay") return "Thanh toán trước";
    if (raw === "postpay") return "Thanh toán sau";
    return value;
  };

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "openingTime" || field === "closingTime") {
        const generated = computeOpeningHours(
          field === "openingTime" ? value : next.openingTime,
          field === "closingTime" ? value : next.closingTime
        );
        next.openingHours = generated || prev.openingHours;
      }
      return next;
    });
  };

  const handleSelectPolicy = (v: "prepay" | "postpay") => {
    if (loadingPolicy || savingPolicy) return;
    setConfirmDialog({ open: true, target: v });
  };

  const confirmChangePolicy = async () => {
    if (!confirmDialog.target) return;
    const v = confirmDialog.target;
    const nextLabel = v === "prepay" ? "Thanh toán trước" : "Thanh toán sau";
    setConfirmDialog({ open: false, target: null });
    setSavingPolicy(true);

    try {
      await updatePaymentPolicy(v === "prepay" ? "Prepay" : "Postpay");
      await loadPolicy();
      await loadSettings();
      setResultDialog({
        open: true,
        success: true,
        message: `Đã chuyển sang "${nextLabel}". Chính sách sẽ áp dụng lúc 00:00 hôm sau.`,
      });
    } catch (e: any) {
      setResultDialog({
        open: true,
        success: false,
        message: `Cập nhật thất bại. Vui lòng thử lại.`,
      });
    } finally {
      setSavingPolicy(false);
    }
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    const name = form.restaurantName.trim();
    if (!name) {
      nextErrors.restaurantName = "RestaurantName không được để trống";
    } else if (name.length > 200) {
      nextErrors.restaurantName = "RestaurantName tối đa 200 ký tự";
    }

    const address = form.restaurantAddress.trim();
    if (address.length > 500) {
      nextErrors.restaurantAddress = "Địa chỉ tối đa 500 ký tự";
    }

    const phone = form.restaurantPhone.trim();
    if (phone.length > 20) {
      nextErrors.restaurantPhone = "Số điện thoại tối đa 20 ký tự";
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!form.openingTime.trim()) {
      nextErrors.openingTime = "OpeningTime không được để trống";
    } else if (!timeRegex.test(form.openingTime.trim())) {
      nextErrors.openingTime = "Định dạng HH:mm 24h, ví dụ 10:00";
    }

    if (!form.closingTime.trim()) {
      nextErrors.closingTime = "ClosingTime không được để trống";
    } else if (!timeRegex.test(form.closingTime.trim())) {
      nextErrors.closingTime = "Định dạng HH:mm 24h, ví dụ 22:00";
    }

    const openingMinutes = parseTimeToMinutes(form.openingTime.trim() || "");
    const closingMinutes = parseTimeToMinutes(form.closingTime.trim() || "");
    if (
      openingMinutes !== null &&
      closingMinutes !== null &&
      openingMinutes >= closingMinutes
    ) {
      nextErrors.closingTime = "OpeningTime phải nhỏ hơn ClosingTime";
    }

    let normalizedTax: string | undefined;
    const taxRaw = form.taxRate.trim();
    if (!taxRaw) {
      nextErrors.taxRate = "TaxRate không được để trống";
    } else {
      const raw = taxRaw.replace("%", "").replace(",", ".").trim();
      const parsed = Number(raw);
      if (Number.isNaN(parsed)) {
        nextErrors.taxRate = "TaxRate phải là số (ví dụ 8 hoặc 8%)";
      } else if (parsed < 0 || parsed > 100) {
        nextErrors.taxRate = "TaxRate phải trong khoảng 0 - 100 (%)";
      } else {
        normalizedTax = `${parsed % 1 === 0 ? parsed.toFixed(0) : parsed}%`;
      }
    }

    const maxTableCapacity = parseInt(form.maxTableCapacity.trim(), 10);
    if (Number.isNaN(maxTableCapacity)) {
      nextErrors.maxTableCapacity = "MaxTableCapacity phải là số nguyên";
    } else if (maxTableCapacity <= 0 || maxTableCapacity > 1000) {
      nextErrors.maxTableCapacity = "Giá trị phải > 0 và ≤ 1000";
    }

    const timeoutMinutes = parseInt(
      form.tableAccessTimeoutWithoutOrderMinutes.trim(),
      10
    );
    if (Number.isNaN(timeoutMinutes)) {
      nextErrors.tableAccessTimeoutWithoutOrderMinutes =
        "TableAccessTimeoutWithoutOrderMinutes phải là số nguyên";
    } else if (timeoutMinutes <= 0 || timeoutMinutes > 240) {
      nextErrors.tableAccessTimeoutWithoutOrderMinutes =
        "Giá trị phải > 0 và ≤ 240 phút";
    }

    const cleanupDays = parseInt(form.orderCleanupAfterDays.trim(), 10);
    if (Number.isNaN(cleanupDays)) {
      nextErrors.orderCleanupAfterDays =
        "OrderCleanupAfterDays phải là số nguyên";
    } else if (cleanupDays <= 0 || cleanupDays > 365) {
      nextErrors.orderCleanupAfterDays = "Giá trị phải > 0 và ≤ 365 ngày";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;

    const openingHoursText = computeOpeningHours(
      form.openingTime.trim(),
      form.closingTime.trim()
    );

    return {
      restaurantName: name,
      restaurantAddress: address,
      restaurantPhone: phone,
      openingTime: form.openingTime.trim(),
      closingTime: form.closingTime.trim(),
      openingHours: openingHoursText || form.openingHours || undefined,
      taxRate: normalizedTax!,
      maxTableCapacity,
      tableAccessTimeoutWithoutOrderMinutes: timeoutMinutes,
      orderCleanupAfterDays: cleanupDays,
    };
  };

  const handleSaveSettings = async () => {
    const payload = validateForm();
    if (!payload) return;

    try {
      setSavingSettings(true);
      await updateBusinessSettings(payload);
      await loadSettings();
      setResultDialog({
        open: true,
        success: true,
        message: "Đã lưu cấu hình thành công.",
      });
    } catch (error: any) {
      setResultDialog({
        open: true,
        success: false,
        message:
          error?.response?.data?.message ||
          "Lưu cấu hình thất bại. Vui lòng thử lại.",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
  };

  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm]
  );

  const computedOpeningHours = computeOpeningHours(
    form.openingTime.trim(),
    form.closingTime.trim()
  );

  const renderInput = (
    field: keyof FormState,
    label: string,
    placeholder: string,
    helper?: string,
    options?: {
      type?: "text" | "time" | "number";
      min?: number;
      max?: number;
      step?: number;
      readOnly?: boolean;
      icon?: LucideIcon;
    }
  ) => (
    <div className="space-y-1">
      <Label className="text-sm font-medium flex items-center gap-1.5">
        {options?.icon && (
          <options.icon className="w-3.5 h-3.5 text-muted-foreground" />
        )}
        {label}
      </Label>
      <Input
        type={options?.type ?? "text"}
        value={form[field]}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        placeholder={placeholder}
        readOnly={options?.readOnly}
        min={options?.min}
        max={options?.max}
        step={options?.step}
      />
      {helper && (
        <p className="text-xs text-muted-foreground leading-snug">{helper}</p>
      )}
      {errors[field] && <p className="text-xs text-red-500">{errors[field]}</p>}
    </div>
  );

  const pad = (n: number) => n.toString().padStart(2, "0");
  const hourOptions = Array.from({ length: 24 }, (_, i) => pad(i));
  const minuteOptions = ["00", "15", "30", "45"];

  const renderTimePicker = (
    field: "openingTime" | "closingTime",
    label: string,
    helper?: string
  ) => {
    const current = form[field] || "";
    const [h, m] = current.split(":");
    const selectedHour = hourOptions.includes(h) ? h : "09";
    const selectedMinute = minuteOptions.includes(m) ? m : "00";

    const handleChange = (newHour: string, newMinute: string) => {
      const next = `${newHour}:${newMinute}`;
      handleFieldChange(field, next);
    };

    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <select
            className="border rounded-md px-2 py-2 text-sm bg-background"
            value={selectedHour}
            onChange={(e) => handleChange(e.target.value, selectedMinute)}
          >
            {hourOptions.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">:</span>
          <select
            className="border rounded-md px-2 py-2 text-sm bg-background"
            value={selectedMinute}
            onChange={(e) => handleChange(selectedHour, e.target.value)}
          >
            {minuteOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        {helper && (
          <p className="text-xs text-muted-foreground leading-snug">{helper}</p>
        )}
        {errors[field] && (
          <p className="text-xs text-red-500">{errors[field]}</p>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-8 pb-8">
        {/* Payment Method Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-background border border-primary/10 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
                <DollarSign className="w-3 h-3" />
                Chính sách thanh toán
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Chính sách thanh toán
              </h2>
              <p className="text-muted-foreground">
                {loadingPolicy
                  ? "Đang tải chính sách thanh toán..."
                  : "Chọn thời điểm khách hàng thanh toán phù hợp với mô hình kinh doanh"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] ${loadingPolicy || savingPolicy
                    ? "opacity-60 pointer-events-none"
                    : ""
                  } ${paymentMethod === "prepay"
                    ? "border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20"
                    : "border-2 border-border hover:border-primary/30 hover:shadow-md"
                  }`}
                onClick={() => handleSelectPolicy("prepay")}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-3 rounded-xl ${paymentMethod === "prepay"
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
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] ${loadingPolicy || savingPolicy
                    ? "opacity-60 pointer-events-none"
                    : ""
                  } ${paymentMethod === "postpay"
                    ? "border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20"
                    : "border-2 border-border hover:border-primary/30 hover:shadow-md"
                  }`}
                onClick={() => handleSelectPolicy("postpay")}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-3 rounded-xl ${paymentMethod === "postpay"
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

            <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Info className="w-4 h-4" />
                Thông tin áp dụng
              </div>
              <div>
                <span className="font-medium text-foreground">
                  Chính sách thanh toán:
                </span>{" "}
                {pendingPolicy
                  ? toPolicyLabel(pendingPolicy)
                  : toPolicyLabel(
                    paymentMethod === "prepay" ? "Prepay" : "Postpay"
                  )}
              </div>
              <div>
                <span className="font-medium text-foreground">
                  Có hiệu lực lúc:
                </span>{" "}
                {effectiveDate ? formatDateTimeVn(effectiveDate) : "--"}
              </div>
              {/* <div className="text-xs text-muted-foreground">
                  Chính sách mới sẽ được áp dụng lúc 00:00 ngày hôm sau. Bạn có thể
                  dùng API apply-pending để kích hoạt thủ công nếu cần.
                </div> */}
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                Cấu hình khác
              </h3>
              {/* <p className="text-sm text-muted-foreground">
                Các giá trị này bám sát SystemSettingKeys và đã nối API backend.
                Không có Service Charge hay Reservation Lead Time.
              </p> */}
            </div>

            {loadingSettings ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tải cấu hình...
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {renderInput(
                    "restaurantName",
                    "Tên Nhà Hàng",
                    "Sweet & Salt Factory - Steakhouse",
                    "Tối đa 200 ký tự",
                    { type: "text", icon: Store }
                  )}

                  {renderInput(
                    "restaurantAddress",
                    "Địa chỉ",
                    "449c Trần Hưng Đạo, Cầu Kho, Quận 1...",
                    "Tối đa 500 ký tự",
                    { type: "text", icon: MapPin }
                  )}

                  {renderInput(
                    "restaurantPhone",
                    "Số điện thoại",
                    "0937142618",
                    "Tối đa 20 ký tự",
                    { type: "text", icon: Phone }
                  )}

                  {renderTimePicker(
                    "openingTime",
                    "Thời gian mở cửa (24h)",
                    "Ví dụ 10:00. Thời gian mở cửa phải sớm hơn thời gian đóng cửa"
                  )}

                  {renderTimePicker(
                    "closingTime",
                    "Thời gian đóng cửa (24h)",
                    "Ví dụ 22:00. Thời gian đóng cửa phải trễ hơn thời gian mở cửa"
                  )}

                  {/* {renderInput(
                    "taxRate",
                    "Thuế VAT (%)",
                    "8%",
                    "0 - 100%. Có thể nhập 8 hoặc 8% (ví dụ 8%)",
                    {
                      type: "number",
                      min: 0,
                      max: 100,
                      step: 0.1,
                      icon: Percent,
                    }
                  )} */}

                  {/* {renderInput(
                    "maxTableCapacity",
                    "Số bàn tối đa",
                    "20",
                    "Số bàn tối đa từ 1 đến 100 bàn",
                    { type: "number", min: 1, max: 100, step: 1, icon: Table2 }
                  )} */}

                  {renderInput(
                    "tableAccessTimeoutWithoutOrderMinutes",
                    "Thời gian tối đa không đặt món (phút)",
                    "3",
                    "Ví dụ: 3 phút. Bạn có thể đặt món trong vòng 3 phút sau khi bàn được cấp",
                    { type: "number", min: 1, max: 240, step: 1, icon: Timer }
                  )}

                  {renderInput(
                    "orderCleanupAfterDays",
                    "Thời gian tối đa dọn bàn (ngày)",
                    "1",
                    "Ví dụ: 1 ngày. Sau một ngày thì bàn sẽ được dọn và cấp cho khách hàng khác",
                    {
                      type: "number",
                      min: 1,
                      max: 365,
                      step: 1,
                      icon: CalendarClock,
                    }
                  )}

                  {/* <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      Opening Hours (tự sinh cho UI cũ)
                    </Label>
                    <Input
                      value={
                        computedOpeningHours || form.openingHours || "Chưa có"
                      }
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground leading-snug">
                      Đồng bộ từ OpeningTime/ClosingTime để tương thích ngược.
                    </p>
                  </div> */}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={!hasChanges || savingSettings}
                  >
                    Đặt lại
                  </Button>
                  <Button
                    onClick={handleSaveSettings}
                    disabled={savingSettings || loadingSettings || !hasChanges}
                  >
                    {savingSettings && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Lưu cấu hình
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(v) => setConfirmDialog((prev) => ({ ...prev, open: v }))}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Bạn có chắc muốn thay đổi?</DialogTitle>
            <DialogDescription>
              Thao tác này sẽ cập nhật chính sách thanh toán và được áp dụng lúc
              00:00 ngày hôm sau.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, target: null })}
            >
              Hủy
            </Button>
            <Button onClick={confirmChangePolicy} disabled={savingPolicy}>
              {savingPolicy && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Đồng ý
            </Button>
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
