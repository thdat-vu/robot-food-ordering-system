import React from "react";
import StatusBadge from "./StatusBadge";

/* ================= TYPES ================= */

type OrderItemStatus = number | string;

type ActivityItem = {
  productName: string;
  sizeName: number | string;
  toppingCount?: number;
  previousStatus?: OrderItemStatus;
  newStatus?: OrderItemStatus;
};

type CreateOrderData = {
  tableName?: string;
  itemCount: number;
  totalPrice: number;
  items: ActivityItem[];
};

type UpdateOrderItemStatusData = {
  updatedItems: ActivityItem[];
};

type CheckInData = {
  tableName: string;
};

type ActivityData =
  | CheckInData
  | CreateOrderData
  | UpdateOrderItemStatusData
  | Record<string, any>;

export type ActivityLog = {
  type: string;
  data: ActivityData;
};

type ActivityDetailsProps = {
  activity: ActivityLog;
};

/* ================= HELPERS ================= */

const getSizeText = (size: number | string): string => {
  const sizeMap: Record<number, string> = {
    1: "S",
    2: "M",
    3: "L",
  };

  const key = Number(size);
  return sizeMap[key] ?? String(size);
};

const formatPrice = (price: number): string => {
  return `${new Intl.NumberFormat("vi-VN").format(price)}đ`;
};

/* ================= COMPONENT ================= */

export const ActivityDetails: React.FC<ActivityDetailsProps> = ({
  activity,
}) => {
  const data = activity.data as any;

  /* ===== Check-in ===== */
  if (activity.type === "CheckIn") {
    return (
      <div className="text-sm text-gray-900">
        {(data as CheckInData)?.tableName ?? "-"}
      </div>
    );
  }

  /* ===== Create Order ===== */
  if (activity.type === "CreateOrder") {
    const orderData = data as CreateOrderData;

    return (
      <div>
        <div className="text-sm font-medium text-gray-900">
          {orderData.itemCount} món – {formatPrice(orderData.totalPrice)}
        </div>

        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
          {Array.isArray(orderData.items) &&
            orderData.items.map((item, idx) => (
              <div key={idx}>
                • {item.productName} ({getSizeText(item.sizeName)})
                {item.toppingCount && item.toppingCount > 0 && (
                  <> +{item.toppingCount} topping</>
                )}
              </div>
            ))}
        </div>
      </div>
    );
  }

  /* ===== Update Order Item Status ===== */
  if (activity.type === "UpdateOrderItemStatus") {
    const updateData = data as UpdateOrderItemStatusData;
    const item = updateData?.updatedItems?.[0];

    if (!item) {
      return (
        <div className="text-sm text-gray-500">Đã cập nhật trạng thái món</div>
      );
    }

    return (
      <div>
        <div className="text-sm text-gray-900">
          {item.productName} – {getSizeText(item.sizeName)}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <StatusBadge status={item.previousStatus ?? ""} />
          <span className="text-gray-400 text-xs">→</span>
          <StatusBadge status={item.newStatus ?? ""} />
        </div>
      </div>
    );
  }

  /* ===== Fallback ===== */
  return <div className="text-sm text-gray-500">-</div>;
};

export default ActivityDetails;
