import { ReasonTextVI } from "@/lib/utils/Reason";

export const humanizeAutoReleaseNoOrderTimeout = (data: any) => {
  const tableName = data?.table?.name ?? "bàn";
  const minutes = data?.autoReleaseMinutes;

  const base = ReasonTextVI[data?.reason] ?? "Hệ thống tự động giải phóng bàn.";
  const extra =
    typeof minutes === "number"
      ? ` (Thời gian: ${minutes} phút không có đơn.)`
      : "";

  return ` ${tableName} được giải phóng tự động.${extra} ${base}`;
};
