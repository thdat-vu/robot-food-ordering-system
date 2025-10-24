"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UtensilsCrossed,
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  ChefHat,
  Shield,
  User,
  Filter,
  Download,
  MoreVertical,
  Eye,
  TrendingUp,
  Clock,
  DollarSign,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getPaymentPolicy, updatePaymentPolicy } from "@/lib/api/settings";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"accounts" | "dishes" | "config">("accounts");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"prepay" | "postpay">("postpay");
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingPolicy(true);
        const policy = await getPaymentPolicy();
        if (!mounted) return;
        setPaymentMethod(policy === "Prepay" ? "prepay" : "postpay");
      } finally {
        setLoadingPolicy(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const [resultDialog, setResultDialog] = useState<{open: boolean; success: boolean; message: string}>(
    { open: false, success: true, message: "" }
  );
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean; target: "prepay" | "postpay" | null}>(
    { open: false, target: null }
  );

  // Restriction dialog: prevent switching from "prepay" to "postpay" until next midnight
  const [restrictionDialog, setRestrictionDialog] = useState<{ open: boolean; availableAt: Date | null }>({ open: false, availableAt: null });

  const getNextMidnight = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  };

  const formatVnDate = (d: Date | null) => {
    if (!d) return "";
    const dateStr = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `00:00 ngày ${dateStr}`;
  };

  const handleSelectPolicy = async (v: "prepay" | "postpay") => {
    // If currently "prepay" and user wants to switch to "postpay", block until next midnight
    if (paymentMethod === "prepay" && v === "postpay") {
      const nextMidnight = getNextMidnight();
      setRestrictionDialog({ open: true, availableAt: nextMidnight });
      return;
    }
    setConfirmDialog({ open: true, target: v });
  };

  const confirmChangePolicy = async () => {
    if (!confirmDialog.target) return;
    const v = confirmDialog.target;
    const nextLabel = v === "prepay" ? "Thanh toán trước" : "Thanh toán sau";
    const prev = paymentMethod;
    setConfirmDialog({ open: false, target: null });
    setPaymentMethod(v);
    try {
      await updatePaymentPolicy(v === "prepay" ? "Prepay" : "Postpay");
      setResultDialog({ open: true, success: true, message: `Đã chuyển sang "${nextLabel}" thành công.` });
    } catch (e: any) {
      setPaymentMethod(prev);
      setResultDialog({ open: true, success: false, message: `Cập nhật thất bại. Vui lòng thử lại.` });
    }
  };

  const [addAccountModal, setAddAccountModal] = useState(false);
  const [addAccountForm, setAddAccountForm] = useState({
    name: "",
    phone: "",
    role: "waiter",
    status: "active",
  });

  const [addDishModal, setAddDishModal] = useState(false);
  const [addDishForm, setAddDishForm] = useState({
    name: "",
    category: "",
    price: "",
    prepTime: "",
    description: "",
    status: "available",
  });

  const [editAccountModal, setEditAccountModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    role: "",
    status: "",
  });

  const accounts = [
    {
      id: 1,
      name: "John Smith",
      role: "chef",
      phone: "+84 123 456 789",
      status: "active",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "waiter",
      phone: "+84 987 654 321",
      status: "active",
      joinDate: "2024-02-20",
    },
    {
      id: 3,
      name: "Mike Wilson",
      role: "moderator",
      phone: "+84 555 123 456",
      status: "active",
      joinDate: "2024-03-10",
    },
    {
      id: 4,
      name: "Emily Brown",
      role: "chef",
      phone: "+84 444 789 012",
      status: "inactive",
      joinDate: "2023-12-05",
    },
    {
      id: 5,
      name: "David Lee",
      role: "waiter",
      phone: "+84 333 456 789",
      status: "active",
      joinDate: "2024-01-25",
    },
  ];

  const dishes = [
    {
      id: 1,
      name: "Grilled Salmon",
      category: "Main Course",
      price: 250000,
      status: "available",
      prepTime: "25 min",
      orders: 145,
    },
    {
      id: 2,
      name: "Caesar Salad",
      category: "Appetizer",
      price: 120000,
      status: "available",
      prepTime: "10 min",
      orders: 89,
    },
    {
      id: 3,
      name: "Beef Steak",
      category: "Main Course",
      price: 350000,
      status: "out of stock",
      prepTime: "30 min",
      orders: 203,
    },
    {
      id: 4,
      name: "Tiramisu",
      category: "Dessert",
      price: 95000,
      status: "available",
      prepTime: "5 min",
      orders: 67,
    },
    {
      id: 5,
      name: "Tom Yum Soup",
      category: "Soup",
      price: 150000,
      status: "available",
      prepTime: "20 min",
      orders: 112,
    },
  ];

  const configs = [
    {
      id: 1,
      key: "Restaurant Name",
      value: "The Golden Fork",
      category: "General",
      description: "Display name",
    },
    {
      id: 2,
      key: "Opening Hours",
      value: "10:00 AM - 10:00 PM",
      category: "General",
      description: "Business hours",
    },
    {
      id: 3,
      key: "Tax Rate",
      value: "10%",
      category: "Financial",
      description: "VAT percentage",
    },
    {
      id: 4,
      key: "Service Charge",
      value: "5%",
      category: "Financial",
      description: "Service fee",
    },
    {
      id: 5,
      key: "Max Table Capacity",
      value: "50",
      category: "Operations",
      description: "Total tables",
    },
    {
      id: 6,
      key: "Reservation Lead Time",
      value: "2 hours",
      category: "Operations",
      description: "Minimum booking time",
    },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "chef":
        return <ChefHat className="w-4 h-4" />;
      case "moderator":
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
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleEditAccount = (account: any) => {
    setSelectedAccount(account);
    setEditFormData({
      name: account.name,
      phone: account.phone,
      role: account.role,
      status: account.status,
    });
    setEditAccountModal(true);
  };

  const handleDeleteAccount = (account: any) => {
    setSelectedAccount(account);
    setDeleteAccountModal(true);
  };

  const handleSaveEdit = () => {
    console.log("[v0] Saving account:", editFormData);
    // TODO: Implement actual save logic
    setEditAccountModal(false);
  };

  const handleConfirmDelete = () => {
    console.log("[v0] Deleting account:", selectedAccount);
    // TODO: Implement actual delete logic
    setDeleteAccountModal(false);
  };

  const handleCreateAccount = () => {
    console.log("[v0] Creating new account:", addAccountForm);
    // TODO: Implement actual create logic
    setAddAccountModal(false);
    // Reset form
    setAddAccountForm({
      name: "",
      phone: "",
      role: "waiter",
      status: "active",
    });
  };

  const handleCreateDish = () => {
    console.log("[v0] Creating new dish:", addDishForm);
    // TODO: Implement actual create logic
    setAddDishModal(false);
    // Reset form
    setAddDishForm({
      name: "",
      category: "",
      price: "",
      prepTime: "",
      description: "",
      status: "available",
    });
  };

  const secondaryNav = [
    { key: "accounts", label: "Tài Khoản", icon: Users },
    { key: "dishes", label: "Món Ăn", icon: UtensilsCrossed },
    { key: "config", label: "Cấu Hình", icon: Settings },
  ];

  return (
    <DashboardLayout
      role="admin"
      secondaryNav={secondaryNav}
      activeSecondary={activeTab}
      onSecondaryChange={(k) => setActiveTab(k as any)}
      hidePrimaryNav
    >
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Bảng Điều Khiển Quản Trị
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Quản lý toàn diện tài khoản, thực đơn và cấu hình hệ thống
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Lọc</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng Tài Khoản
              </CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">24</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <p className="text-xs text-green-500">+4 tuần này</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Món Ăn
              </CardTitle>
              <UtensilsCrossed className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">87</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <p className="text-xs text-green-500">+12 tháng này</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Thời Gian Chuẩn Bị TB
              </CardTitle>
              <Clock className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">18 phút</div>
              <p className="text-xs text-muted-foreground mt-1">
                Trung bình tất cả món
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Doanh Thu Hôm Nay
              </CardTitle>
              <DollarSign className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12.5M ₫</div>
              <p className="text-xs text-muted-foreground mt-1">
                Từ 156 đơn hàng
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3" />

          <Separator />

          <CardContent className="pt-6">
            {activeTab === "accounts" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên, số điện thoại hoặc vai trò..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    className="gap-2"
                    onClick={() => setAddAccountModal(true)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Thêm Tài Khoản
                  </Button>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                            Người Dùng
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                            Liên Hệ
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                            Vai Trò
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                            Trạng Thái
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                            Ngày Tham Gia
                          </th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                            Thao Tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {accounts.map((account) => (
                          <tr
                            key={account.id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  {getRoleIcon(account.role)}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-foreground">
                                    {account.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground sm:hidden">
                                    {account.phone}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">
                              {account.phone}
                            </td>
                            <td className="p-4">
                              <Badge
                                className={getRoleBadgeColor(account.role)}
                              >
                                {account.role}
                              </Badge>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              <Badge
                                variant={
                                  account.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {account.status === "active"
                                  ? "Hoạt động"
                                  : "Không hoạt động"}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                              {new Date(account.joinDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditAccount(account)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleDeleteAccount(account)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>Hiển thị 5 trong 24 tài khoản</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Trước
                    </Button>
                    <Button variant="outline" size="sm">
                      Sau
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "dishes" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm món ăn theo tên hoặc danh mục..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    className="gap-2"
                    onClick={() => setAddDishModal(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Món
                  </Button>
                </div>

                <div className="grid gap-4">
                  {dishes.map((dish) => (
                    <Card
                      key={dish.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-semibold text-foreground text-lg">
                                  {dish.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {dish.category}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  dish.status === "available"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {dish.status === "available"
                                  ? "Có sẵn"
                                  : "Hết hàng"}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {dish.prepTime}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <TrendingUp className="w-4 h-4" />
                                {dish.orders} đơn
                              </div>
                              <div className="font-semibold text-primary text-base">
                                {dish.price.toLocaleString("vi-VN")} ₫
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 bg-transparent"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">Xem</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 bg-transparent"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="hidden sm:inline">Sửa</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>Hiển thị 5 trong 87 món ăn</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Trước
                    </Button>
                    <Button variant="outline" size="sm">
                      Sau
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "config" && (
              <div className="space-y-6">
                {/* Payment Policy - move BEFORE financial settings */}
                <div className="space-y-3">
                  <div className="font-medium text-foreground">Phương Thức Thanh Toán</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Chọn thời điểm khách hàng thanh toán
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        paymentMethod === "prepay"
                          ? "border-2 border-primary bg-primary/5"
                          : "border-2 border-transparent hover:border-muted-foreground/20"
                      }`}
                      onClick={() => handleSelectPolicy("prepay")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="font-semibold text-foreground">
                                Thanh toán trước
                              </div>
                              {paymentMethod === "prepay" && (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Khách thanh toán trước khi nhận món
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        paymentMethod === "postpay"
                          ? "border-2 border-primary bg-primary/5"
                          : "border-2 border-transparent hover:border-muted-foreground/20"
                      }`}
                      onClick={() => handleSelectPolicy("postpay")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="font-semibold text-foreground">
                                Thanh toán sau
                              </div>
                              {paymentMethod === "postpay" && (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Khách thanh toán sau khi dùng xong
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {[
                  { key: "General", label: "Cài Đặt Chung" },
                  { key: "Financial", label: "Cài Đặt Tài Chính" },
                  { key: "Operations", label: "Cài Đặt Vận Hành" },
                ].map((category) => (
                  <div key={category.key}>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        {category.label}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {
                          configs.filter((c) => c.category === category.key)
                            .length
                        }{" "}
                        mục
                      </Badge>
                    </div>
                    <div className="grid gap-3">
                      {configs
                        .filter((config) => config.category === category.key)
                        .map((config) => (
                          <Card
                            key={config.id}
                            className="hover:shadow-sm transition-shadow"
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex-1">
                                  <div className="font-medium text-foreground mb-1">
                                    {config.key}
                                  </div>
                                  <div className="text-sm text-muted-foreground mb-2">
                                    {config.description}
                                  </div>
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-muted text-sm font-mono">
                                    {config.value}
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 w-full sm:w-auto bg-transparent"
                                >
                                  <Edit className="w-4 h-4" />
                                  Chỉnh Sửa
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      {/* Payment section moved above */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm change payment policy */}
      <Dialog open={confirmDialog.open} onOpenChange={(v) => setConfirmDialog(prev => ({...prev, open: v}))}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Bạn có chắc muốn thay đổi?</DialogTitle>
            <DialogDescription>
              Thao tác này sẽ cập nhật chính sách thanh toán hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, target: null })}>Hủy</Button>
            <Button onClick={confirmChangePolicy}>Đồng ý</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restriction dialog for switching to postpay */}
      <Dialog open={restrictionDialog.open} onOpenChange={(v) => setRestrictionDialog(prev => ({...prev, open: v}))}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Không thể đổi ngay</DialogTitle>
            <DialogDescription>
              Hệ thống đang ở chế độ "Thanh toán trước". Bạn chỉ có thể đổi sang "Thanh toán sau" từ {formatVnDate(restrictionDialog.availableAt)}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setRestrictionDialog({ open: false, availableAt: null })}>Đã hiểu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resultDialog.open} onOpenChange={(v) => setResultDialog(prev => ({...prev, open: v}))}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{resultDialog.success ? "Cập nhật thành công" : "Cập nhật thất bại"}</DialogTitle>
            <DialogDescription>{resultDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setResultDialog(prev => ({...prev, open: false}))}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addAccountModal} onOpenChange={setAddAccountModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm Tài Khoản Mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản mới cho nhân viên nhà hàng
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-name">Họ và tên *</Label>
              <Input
                id="add-name"
                value={addAccountForm.name}
                onChange={(e) =>
                  setAddAccountForm({ ...addAccountForm, name: e.target.value })
                }
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-phone">Số điện thoại *</Label>
              <Input
                id="add-phone"
                value={addAccountForm.phone}
                onChange={(e) =>
                  setAddAccountForm({
                    ...addAccountForm,
                    phone: e.target.value,
                  })
                }
                placeholder="+84 123 456 789"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-role">Vai trò *</Label>
              <Select
                value={addAccountForm.role}
                onValueChange={(value) =>
                  setAddAccountForm({ ...addAccountForm, role: value })
                }
              >
                <SelectTrigger id="add-role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chef">Bếp trưởng</SelectItem>
                  <SelectItem value="waiter">Phục vụ</SelectItem>
                  <SelectItem value="moderator">Kiểm duyệt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-status">Trạng thái</Label>
              <Select
                value={addAccountForm.status}
                onValueChange={(value) =>
                  setAddAccountForm({ ...addAccountForm, status: value })
                }
              >
                <SelectTrigger id="add-status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAccountModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateAccount}>Tạo Tài Khoản</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addDishModal} onOpenChange={setAddDishModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm Món Ăn Mới</DialogTitle>
            <DialogDescription>
              Thêm món ăn mới vào thực đơn nhà hàng
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="dish-name">Tên món ăn *</Label>
              <Input
                id="dish-name"
                value={addDishForm.name}
                onChange={(e) =>
                  setAddDishForm({ ...addDishForm, name: e.target.value })
                }
                placeholder="Nhập tên món ăn"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dish-category">Danh mục *</Label>
              <Select
                value={addDishForm.category}
                onValueChange={(value) =>
                  setAddDishForm({ ...addDishForm, category: value })
                }
              >
                <SelectTrigger id="dish-category">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Appetizer">Khai vị</SelectItem>
                  <SelectItem value="Main Course">Món chính</SelectItem>
                  <SelectItem value="Soup">Súp</SelectItem>
                  <SelectItem value="Dessert">Tráng miệng</SelectItem>
                  <SelectItem value="Beverage">Đồ uống</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dish-price">Giá (VNĐ) *</Label>
              <Input
                id="dish-price"
                type="number"
                value={addDishForm.price}
                onChange={(e) =>
                  setAddDishForm({ ...addDishForm, price: e.target.value })
                }
                placeholder="150000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dish-preptime">Thời gian chuẩn bị *</Label>
              <Input
                id="dish-preptime"
                value={addDishForm.prepTime}
                onChange={(e) =>
                  setAddDishForm({ ...addDishForm, prepTime: e.target.value })
                }
                placeholder="20 phút"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dish-description">Mô tả</Label>
              <Textarea
                id="dish-description"
                value={addDishForm.description}
                onChange={(e) =>
                  setAddDishForm({
                    ...addDishForm,
                    description: e.target.value,
                  })
                }
                placeholder="Mô tả ngắn về món ăn..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dish-status">Trạng thái</Label>
              <Select
                value={addDishForm.status}
                onValueChange={(value) =>
                  setAddDishForm({ ...addDishForm, status: value })
                }
              >
                <SelectTrigger id="dish-status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Có sẵn</SelectItem>
                  <SelectItem value="out of stock">Hết hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDishModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateDish}>Thêm Món</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editAccountModal} onOpenChange={setEditAccountModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Tài Khoản</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tài khoản của {selectedAccount?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Họ và tên</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Số điện thoại</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, phone: e.target.value })
                }
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Vai trò</Label>
              <Select
                value={editFormData.role}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, role: value })
                }
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chef">Bếp trưởng</SelectItem>
                  <SelectItem value="waiter">Phục vụ</SelectItem>
                  <SelectItem value="moderator">Kiểm duyệt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Trạng thái</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, status: value })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditAccountModal(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveEdit}>Lưu Thay Đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAccountModal} onOpenChange={setDeleteAccountModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác Nhận Xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản của{" "}
              <span className="font-semibold text-foreground">
                {selectedAccount?.name}
              </span>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteAccountModal(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Xóa Tài Khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
