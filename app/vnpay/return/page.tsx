"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentsApi } from "@/lib/api/payments";

export default function VNPayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Đang xác thực thanh toán VNPay...</p>
          </div>
        </div>
      }
    >
      <ReturnContent />
    </Suspense>
  );
}

function ReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const rawQuery = useMemo(() => {
    const entries = Array.from(searchParams.entries());
    return new URLSearchParams(entries).toString();
  }, [searchParams]);

  useEffect(() => {
    const processReturn = async () => {
      try {
        const res = await paymentsApi.handleVnPayReturn(rawQuery);

        const vnpAmount = searchParams.get("vnp_Amount");
        const vnpPayDate = searchParams.get("vnp_PayDate");

        const amount = vnpAmount ? Number(vnpAmount) / 100 : undefined;
        const payDate = vnpPayDate || undefined;

        if (res.statusCode === 200 && (res.code === "PAID" || res.data?.paymentStatus === 2 || res.code === "SUCCESS")) {
          const orderId = (res as any).data?.orderId;
          const message = (res as any).data?.message || "Payment success (VNPay)";
          const params = new URLSearchParams({ orderId: orderId ?? "", message });
          if (amount) params.set("amount", String(amount));
          if (payDate) params.set("payDate", payDate);
          router.replace(`/waiter/payment-success?${params.toString()}`);
          return;
        }

        router.replace(`/waiter?payment=failed`);
      } catch (e) {
        setError("Có lỗi khi xác thực thanh toán.");
        router.replace(`/waiter?payment=failed`);
      }
    };

    if (rawQuery) processReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawQuery]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Đang xác thực thanh toán VNPay...</p>
      </div>
    </div>
  );
}
