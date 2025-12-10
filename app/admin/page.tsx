"use client";

import {DashboardLayout} from "@/components/dashboard-layout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {PiPicnicTableBold} from "react-icons/pi";

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
import {useEffect, useState} from "react";
import {getPaymentPolicy, updatePaymentPolicy} from "@/lib/api/settings";
import {ProductionPage} from "@/components/admin/ProductionPage";
import {AccountPage} from "@/components/admin/AccountPage";
import {ConfigPage} from "@/components/admin/ConfigPage";
import {TableManagerPage} from "@/components/admin/TableManagerPage";
import AuthGuard from "@/components/common/AuthGuard";


export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"accounts" | "dishes" | "config" | "table">("accounts");
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"prepay" | "postpay">("postpay");
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
                console.log("user info from local storage:",);
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
        {key: "accounts", label: "Tài Khoản", icon: Users},
        {key: "dishes", label: "Món Ăn", icon: UtensilsCrossed},
        {key: "table", label: "Cấu hình bàn", icon: PiPicnicTableBold},
        {key: "config", label: "Cấu Hình", icon: Settings},
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
                    {/*<div className="flex gap-2">*/}
                    {/*    <Button*/}
                    {/*        variant="outline"*/}
                    {/*        size="sm"*/}
                    {/*        className="gap-2 bg-transparent"*/}
                    {/*    >*/}
                    {/*        <Download className="w-4 h-4"/>*/}
                    {/*        <span className="hidden sm:inline">Xuất</span>*/}
                    {/*    </Button>*/}
                    {/*    <Button*/}
                    {/*        variant="outline"*/}
                    {/*        size="sm"*/}
                    {/*        className="gap-2 bg-transparent"*/}
                    {/*    >*/}
                    {/*        <Filter className="w-4 h-4"/>*/}
                    {/*        <span className="hidden sm:inline">Lọc</span>*/}
                    {/*    </Button>*/}
                    {/*</div>*/}
                </div>

                <Card>
                    <CardHeader className="pb-3"/>

                    <Separator/>

                    <CardContent className="pt-6">
                        {activeTab === "accounts" && (
                            <AccountPage/>
                        )}

                        {activeTab === "dishes" && (
                            <ProductionPage/>
                        )}

                        {activeTab === "config" && (
                            <ConfigPage/>
                        )}

                        {activeTab === "table" && (
                            <TableManagerPage/>
                        )}

                    </CardContent>
                </Card>
            </div>


            <div>
                {/* Confirm change payment policy */}


            </div>
            </DashboardLayout>
        </AuthGuard>
    );
}
