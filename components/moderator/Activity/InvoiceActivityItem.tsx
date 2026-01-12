"use client";

import React, { useState, useEffect } from "react";
import {
  ReceiptText,
  CreditCard,
  Clock,
  ArrowUpRight,
  Calendar,
  X,
  FileText,
  ShoppingCart,
} from "lucide-react";

import CompleteBillComponent from "@/components/moderator/CompleteBillComponent";
import OrderDetailsComponent from "@/components/moderator/OrderDetailsComponent";

// =====================
// Types
// =====================
export interface InvoiceData {
  invoiceId: string;
  invoiceCode: string;
  totalAmount: number;
  paymentMethod: string | number;
  paymentStatus: string | number;
  orderCode?: string;
  createdAtUtc?: string | number | Date;
}

export interface Activity {
  type: string;
  data: InvoiceData;
}

export interface InvoiceActivityItemProps {
  activity: Activity;
  /** thời gian tạo activity (createdTime) từ TableActivityLog */
  timeStamp?: string | number | Date;
  className?: string;
}

// =====================
// Utils
// =====================
const normalizeType = (t: unknown) => String(t ?? "").trim();

const toDateSafe = (v: unknown): Date | null => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v as any);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDateTimeVN = (v: unknown): string => {
  const d = toDateSafe(v);
  return d ? d.toLocaleString("vi-VN") : "—";
};

const formatTimeVN = (v: unknown): string => {
  const d = toDateSafe(v);
  return d
    ? d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : "—";
};

const formatVND = (v: number | null | undefined): string =>
  Number(v ?? 0).toLocaleString("vi-VN") + " đ";

const mapPaymentMethod = (m: string | number | null | undefined): string => {
  const key = String(m ?? "");
  const methods: Record<string, string> = {
    "0": "Tiền mặt",
    "1": "VNPay",
    "2": "PayOS",
    Cash: "Tiền mặt",
    VNPay: "VNPay",
    PayOS: "PayOS",
  };
  return methods[key] ?? "Chưa rõ";
};

const mapPaymentStatus = (
  s: string | number | null | undefined
): { label: string; cls: string } => {
  const key = String(s ?? "");
  const statuses: Record<string, { label: string; cls: string }> = {
    "0": {
      label: "Chưa thanh toán",
      cls: "bg-amber-50 text-amber-700 ring-amber-200",
    },
    "1": {
      label: "Đã thanh toán",
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    "2": {
      label: "Thất bại",
      cls: "bg-rose-50 text-rose-700 ring-rose-200",
    },
    Unpaid: {
      label: "Chưa thanh toán",
      cls: "bg-amber-50 text-amber-700 ring-amber-200",
    },
    Paid: {
      label: "Đã thanh toán",
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    Failed: {
      label: "Thất bại",
      cls: "bg-rose-50 text-rose-700 ring-rose-200",
    },
  };

  return (
    statuses[key] ?? {
      label: "Không xác định",
      cls: "bg-slate-50 text-slate-700 ring-slate-200",
    }
  );
};

// =====================
// Component
// =====================
const InvoiceActivityItem: React.FC<InvoiceActivityItemProps> = ({
  activity,
  timeStamp,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"invoice" | "order">("invoice");
  const [billData, setBillData] = useState<any>(null);

  const type = normalizeType(activity?.type);
  const data = activity?.data;

  if (type !== "CreateInvoice" || !data?.invoiceId) return null;

  const st = mapPaymentStatus(data.paymentStatus);
  const headerTime = timeStamp ?? data.createdAtUtc ?? new Date();

  // (Optional) ESC để đóng modal
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/* Card */}
      <div
        className={[
          "group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md",
          className ?? "",
        ].join(" ")}
      >
        <div className="absolute -left-3 top-7 h-6 w-6 rounded-full border-4 border-white bg-blue-500 shadow-sm" />

        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="text-sm font-medium text-slate-900">Tạo hóa đơn</div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateTimeVN(headerTime)}
          </div>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 shadow-sm">
                <ReceiptText className="h-5 w-5 text-white" />
              </div>

              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-500">
                  Hóa đơn mới
                </div>
                <div className="truncate text-lg font-bold text-slate-900">
                  #{data.invoiceCode}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                {formatVND(data.totalAmount)}
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-blue-200">
                <CreditCard className="h-3.5 w-3.5" />
                {mapPaymentMethod(data.paymentMethod)}
              </div>

              <div
                className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ${st.cls}`}
              >
                {st.label}
              </div>

              {data.orderCode && (
                <div className="inline-flex items-center rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200">
                  Order:{" "}
                  <span className="ml-1 font-medium">{data.orderCode}</span>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600 ring-1 ring-slate-200">
                <Clock className="h-3.5 w-3.5" />
                {formatTimeVN(data.createdAtUtc ?? headerTime)}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow active:scale-95"
            onClick={() => setOpen(true)}
          >
            Xem chi tiết
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)} // click nền đóng
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()} // chặn click trong modal
          >
            {/* Header */}
            <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 rounded-lg p-2">
                    <ReceiptText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">
                      Chi tiết hóa đơn #{data.invoiceCode}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {formatDateTimeVN(headerTime)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                  aria-label="Đóng"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-6">
                <button
                  onClick={() => setActiveTab("invoice")}
                  className={[
                    "flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all rounded-t-lg",
                    activeTab === "invoice"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50",
                  ].join(" ")}
                >
                  <FileText className="w-4 h-4" />
                  Hóa đơn
                </button>
                <button
                  onClick={() => setActiveTab("order")}
                  className={[
                    "flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all rounded-t-lg",
                    activeTab === "order"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50",
                  ].join(" ")}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Chi tiết đơn hàng
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[75vh] overflow-auto">
              {activeTab === "invoice" ? (
                <CompleteBillComponent
                  invoiceId={data.invoiceId}
                  onBillDataLoaded={(bill) => setBillData(bill)}
                />
              ) : (
                <OrderDetailsComponent
                  orderItems={billData?.details || []}
                  loading={!billData}
                  error={null}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceActivityItem;
