"use client";

import { useSearchParams, useRouter } from "next/navigation";
import PaymentSuccess from "@/components/waiter/PaymentSuccess";

export default function Page() {
  const params = useSearchParams();
  const router = useRouter();

  const amount = params.get("amount");
  const orderId = params.get("orderId");
  const payDate = params.get("payDate");
  const message = params.get("message") ?? undefined;

  return (
    <PaymentSuccess
      amount={amount ? Number(amount) : undefined}
      orderId={orderId ?? undefined}
      payDate={payDate ?? undefined}
      message={message}
      onBack={() => router.replace("/waiter")}
    />
  );
}


