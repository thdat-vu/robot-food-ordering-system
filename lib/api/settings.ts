import apiClient from "@/lib/axios";

export type PaymentPolicy = "Prepay" | "Postpay";

export async function getPaymentPolicy(): Promise<PaymentPolicy> {
  const res = await apiClient.get("/settings/payment-policy");
  const raw = res.data?.data ?? res.data?.Data; // backend returns enum as number
  const value = typeof raw === "number" ? raw : parseInt(String(raw), 10);
  return value === 1 ? "Prepay" : "Postpay";
}

export async function updatePaymentPolicy(policy: PaymentPolicy): Promise<PaymentPolicy> {
  const payload = { policy: policy === "Prepay" ? 1 : 2 };
  const res = await apiClient.patch("/settings/payment-policy", payload);
  const raw = res.data?.data ?? res.data?.Data;
  const value = typeof raw === "number" ? raw : parseInt(String(raw), 10);
  return value === 1 ? "Prepay" : "Postpay";
}


