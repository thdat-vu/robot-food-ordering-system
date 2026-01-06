import apiClient from "@/lib/axios";

export type PaymentPolicy = "Prepay" | "Postpay";

export type BusinessSettings = {
  restaurantName?: string;
  openingTime?: string;
  closingTime?: string;
  openingHours?: string;
  taxRate?: string;
  maxTableCapacity?: number;
  tableAccessTimeoutWithoutOrderMinutes?: number;
  orderCleanupAfterDays?: number;
};

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

export async function getSystemSettings(): Promise<Record<string, string>> {
  const res = await apiClient.get("/settings");
  const list = (res.data?.data ?? res.data?.Data ?? []) as Array<{
    key?: string;
    value?: string | number | null;
  }>;

  const map: Record<string, string> = {};
  for (const item of list) {
    if (!item?.key) continue;
    const val =
      item.value === null || item.value === undefined
        ? ""
        : String(item.value);
    map[item.key] = val;
  }
  return map;
}

export async function updateBusinessSettings(
  payload: BusinessSettings
): Promise<void> {
  // Clean undefined fields to avoid sending them
  const body: Record<string, any> = {};
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) body[k] = v;
  });

  await apiClient.patch("/settings/business", body);
}


