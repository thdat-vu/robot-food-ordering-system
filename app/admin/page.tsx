"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PiPicnicTableBold } from "react-icons/pi";
import { UtensilsCrossed, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { getPaymentPolicy } from "@/lib/api/settings";
import { ProductionPage } from "@/components/admin/ProductionPage";
import { AccountPage } from "@/components/admin/AccountPage";
import { ConfigPage } from "@/components/admin/ConfigPage";
import { TableManagerPage } from "@/components/admin/TableManagerPage";
import AuthGuard from "@/components/common/AuthGuard";
import { CiViewTable } from "react-icons/ci";
import DashboardPage from "@/components/admin/item/Dashboad";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "accounts" | "dishes" | "config" | "table" | "dashboad"
  >("dishes");
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"prepay" | "postpay">(
    "postpay"
  );
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingPolicy(true);
        const policy = await getPaymentPolicy();

        const stored = localStorage.getItem("userInfo");
        if (stored) {
          setUser(JSON.parse(stored) as DecodedToken);
        }
        console.log("user info from local storage:");
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

  const [addDishModal, setAddDishModal] = useState(false);

  const secondaryNav = [
    // {key: "accounts", label: "Tài Khoản", icon: Users},
    { key: "dishes", label: "Món Ăn", icon: UtensilsCrossed },
    { key: "table", label: "Cấu hình bàn", icon: PiPicnicTableBold },
    { key: "config", label: "Cấu Hình", icon: Settings },
    { key: "dashboad", label: "Thống kê", icon: CiViewTable },
  ];

  return (
    <AuthGuard allowRoles={["Admin"]}>
      <DashboardLayout
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
          </div>

          <Card>
            <CardHeader className="pb-3" />

            <Separator />

            <CardContent className="pt-6">
              {activeTab === "accounts" && <AccountPage />}

              {activeTab === "dishes" && <ProductionPage />}

              {activeTab === "config" && <ConfigPage />}

              {activeTab === "table" && <TableManagerPage />}

              {activeTab === "dashboad" && <DashboardPage />}
            </CardContent>
          </Card>
        </div>

        <div>{/* Confirm change payment policy */}</div>
      </DashboardLayout>
    </AuthGuard>
  );
}
