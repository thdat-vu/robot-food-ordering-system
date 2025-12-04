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

                {/*<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">*/}
                {/*    <Card className="border-l-4 border-l-primary">*/}
                {/*        <CardHeader className="flex flex-row items-center justify-between pb-2">*/}
                {/*            <CardTitle className="text-sm font-medium text-muted-foreground">*/}
                {/*                Tổng Tài Khoản*/}
                {/*            </CardTitle>*/}
                {/*            <Users className="w-4 h-4 text-primary"/>*/}
                {/*        </CardHeader>*/}
                {/*        <CardContent>*/}
                {/*            <div className="text-2xl font-bold text-foreground">24</div>*/}
                {/*            <div className="flex items-center gap-1 mt-1">*/}
                {/*                <TrendingUp className="w-3 h-3 text-green-500"/>*/}
                {/*                <p className="text-xs text-green-500">+4 tuần này</p>*/}
                {/*            </div>*/}
                {/*        </CardContent>*/}
                {/*    </Card>*/}

                {/*    <Card className="border-l-4 border-l-orange-500">*/}
                {/*        <CardHeader className="flex flex-row items-center justify-between pb-2">*/}
                {/*            <CardTitle className="text-sm font-medium text-muted-foreground">*/}
                {/*                Món Ăn*/}
                {/*            </CardTitle>*/}
                {/*            <UtensilsCrossed className="w-4 h-4 text-orange-500"/>*/}
                {/*        </CardHeader>*/}
                {/*        <CardContent>*/}
                {/*            <div className="text-2xl font-bold text-foreground">87</div>*/}
                {/*            <div className="flex items-center gap-1 mt-1">*/}
                {/*                <TrendingUp className="w-3 h-3 text-green-500"/>*/}
                {/*                <p className="text-xs text-green-500">+12 tháng này</p>*/}
                {/*            </div>*/}
                {/*        </CardContent>*/}
                {/*    </Card>*/}

                {/*    <Card className="border-l-4 border-l-blue-500">*/}
                {/*        <CardHeader className="flex flex-row items-center justify-between pb-2">*/}
                {/*            <CardTitle className="text-sm font-medium text-muted-foreground">*/}
                {/*                Thời Gian Chuẩn Bị TB*/}
                {/*            </CardTitle>*/}
                {/*            <Clock className="w-4 h-4 text-blue-500"/>*/}
                {/*        </CardHeader>*/}
                {/*        <CardContent>*/}
                {/*            <div className="text-2xl font-bold text-foreground">18 phút</div>*/}
                {/*            <p className="text-xs text-muted-foreground mt-1">*/}
                {/*                Trung bình tất cả món*/}
                {/*            </p>*/}
                {/*        </CardContent>*/}
                {/*    </Card>*/}

                {/*    <Card className="border-l-4 border-l-green-500">*/}
                {/*        <CardHeader className="flex flex-row items-center justify-between pb-2">*/}
                {/*            <CardTitle className="text-sm font-medium text-muted-foreground">*/}
                {/*                Doanh Thu Hôm Nay*/}
                {/*            </CardTitle>*/}
                {/*            <DollarSign className="w-4 h-4 text-green-500"/>*/}
                {/*        </CardHeader>*/}
                {/*        <CardContent>*/}
                {/*            <div className="text-2xl font-bold text-foreground">12.5M ₫</div>*/}
                {/*            <p className="text-xs text-muted-foreground mt-1">*/}
                {/*                Từ 156 đơn hàng*/}
                {/*            </p>*/}
                {/*        </CardContent>*/}
                {/*    </Card>*/}
                {/*</div>*/}

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
    );
}
