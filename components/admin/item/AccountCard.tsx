import { ChefHat, Shield, User } from "lucide-react";

export type AccountRow = {
  id: string;
  name: string;
  role: "waiter" | "chef" | "moderator" | "admin";
  phone: string;
  status: string;
  joinDate: string;
  avatar?: string;
  email?: string;
  employmentCode?: string;
};

export const normalizeRole = (
  roleName?: string
): "waiter" | "chef" | "moderator" | "admin" => {
  const role = roleName?.toLowerCase() || "";
  if (role.includes("chef") || role.includes("bếp")) return "chef";
  if (role.includes("waiter") || role.includes("phục vụ")) return "waiter";
  if (role.includes("moderator") || role.includes("kiểm duyệt"))
    return "moderator";
  if (role.includes("admin")) return "admin";
  return "waiter";
};

export const AccountCard = ({
  account,
  onEdit,
  onDelete,
}: {
  account: AccountRow;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "chef":
        return <ChefHat className="w-4 h-4" />;
      case "moderator":
        return <Shield className="w-4 h-4" />;
      case "admin":
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "chef":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "waiter":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "moderator":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "admin":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const initial = (account.name?.trim()?.charAt(0) || "?").toUpperCase();

  return (
    <div className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
      {/* Left: avatar + info */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {account.avatar ? (
            <img
              src={account.avatar}
              alt={account.name}
              className="w-full h-full object-cover"
            />
          ) : (
            initial
          )}
        </div>

        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">
            {account.name}
          </div>

          {account.employmentCode && (
            <div className="text-xs text-gray-400">
              Mã NV:{" "}
              <span className="font-medium text-gray-500">
                {account.employmentCode}
              </span>
            </div>
          )}

          <div className="text-sm text-gray-500 truncate">
            {account.email || account.phone}
          </div>
        </div>
      </div>

      {/* Right: role + actions */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-1 ${getRoleBadgeColor(
              account.role
            )}`}
          >
            {getRoleIcon(account.role)}
            <span className="capitalize">{account.role}</span>
          </div>

          {/* Optional badge employment code next to role */}
          {account.employmentCode && (
            <span className="px-2 py-1 text-xs font-semibold rounded-full border bg-slate-100 text-slate-600">
              {account.employmentCode}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Sửa
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};
