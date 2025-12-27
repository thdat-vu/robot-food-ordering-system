import { Clock, ShoppingCart, UserCheck, Package } from "lucide-react";

type ActivityTypeBadgeProps = {
  type: string;
};

export const ActivityTypeBadge: React.FC<ActivityTypeBadgeProps> = ({
  type,
}) => {
  const configs: Record<
    string,
    {
      icon: React.ElementType;
      label: string;
      className: string;
    }
  > = {
    CheckIn: {
      icon: UserCheck,
      label: "Check-in",
      className: "bg-green-100 text-green-700",
    },
    CreateOrder: {
      icon: ShoppingCart,
      label: "Tạo đơn hàng",
      className: "bg-blue-100 text-blue-700",
    },
    UpdateOrderItemStatus: {
      icon: Package,
      label: "Cập nhật món",
      className: "bg-amber-100 text-amber-700",
    },
  };

  const config = configs[type] ?? {
    icon: Clock,
    label: type,
    className: "bg-gray-100 text-gray-700",
  };

  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${config.className}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium text-gray-900">{config.label}</span>
    </div>
  );
};
