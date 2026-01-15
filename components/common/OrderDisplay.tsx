"use client";

import React, {useEffect, useMemo, useRef, useState, useCallback} from "react";
import {
    MapPin,
    CreditCard,
    RefreshCw,
    ShoppingBag,
    Package,
    Clock,
    ArrowLeft,
    Sparkles,
} from "lucide-react";
import {RiBillLine} from "react-icons/ri";

import {InForProductOrderDetail, OrderRespontGetByID} from "@/entites/respont/OrderRespont";
import {useGetOrderWithIdTableAndToken} from "@/hooks/customHooks/useOrderHooks";
import formatCurrency from "@/unit/unit";
import {Payment} from "@/app/features/components/Payment";
import {useTableContext} from "@/hooks/context/Context";
import {useCreateFeedback} from "@/hooks/customHooks/useFeedbackHooks";
import {FeedbackRequest} from "@/entites/request/FeedbackRequest";
import {MobileDialog} from "@/components/common/MobileDialog";
import {Table} from "@/entites/respont/Table";
import {loadListFromLocalStorage} from "@/store/ShoppingCart";
import {TABLE_STORE, TOKEN_Bro_VALUE} from "@/name-value-env";
import {BaseEntityData, BaseEntityResponse_v2} from "@/entites/BaseEntity";
import {useRouter} from "next/navigation";
import {useGetSetting} from "@/hooks/customHooks/useSettingHooks";
import {BillDialog} from "@/components/common/BillDialog";
import BasicSpeedDial from "@/components/common/ComplainSpeedDial";
import {OrderStatus} from "@/components/common/OrderStatus";
import {StatusLegendMenu} from "@/components/common/StatusLegendMenu";

type OrderDisplayProps = {
    handleChange: (number: number) => void;
};

type Grouped = {
    key: string;
    items: InForProductOrderDetail[];
    count: number;
};

type GroupedWithKey = Grouped & {
    __key: string;
};

export const OrderDisplay = ({handleChange}: OrderDisplayProps) => {
    const router = useRouter();
    const table = useTableContext();

    const [orderData, setOrderData] = useState<OrderRespontGetByID | null>(null);

    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
    const [paymentOrderId, setPaymentOrderId] = useState<string>("");

    const [openDialogFeedBack, setOpenDialogFeedBack] = useState<boolean>(false);

    const [open, setOpen] = useState<boolean>(false);
    const [dialogData, setDialogData] = useState<{ status: boolean; text: string }>();

    const [token, setToken] = useState<string>();
    const [idTable, setIdTable] = useState<string>();

    const [paymentmeth, setPaymentmeth] = useState<number>(1);
    const [expandedProducts, setExpandedProducts] = useState<{ [key: string]: boolean }>({});

    const {run: runGet} = useGetOrderWithIdTableAndToken();
    const {run: runCallPayment} = useCreateFeedback();
    const {run: runSetting} = useGetSetting();

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    const lastSigRef = useRef<string>("");

    const cooldownRef = useRef<NodeJS.Timeout | null>(null);
    const [isCooldown, setIsCooldown] = useState(false);

    const getSizeShortName = (sizeName: string): string => {
        const s = (sizeName || "").toLowerCase();
        if (s.includes("large") || s.includes("lớn")) return "L";
        if (s.includes("medium") || s.includes("vừa")) return "M";
        if (s.includes("small") || s.includes("nhỏ")) return "S";
        return sizeName;
    };

    const paymentStatusText = (status: string) => {
        switch (status) {
            case "Pending":
                return "Chưa thanh toán";
            case "Paid":
                return "Thanh toán thành công";
            case "Failed":
                return "Thất bại";
            case "Refunded":
                return "Đã hoàn tiền";
            default:
                return "";
        }
    };

    const computeSignature = (d: OrderRespontGetByID) => {
        const itemsSig =
            d.items?.map((i) => `${i.id}:${i.status}:${i.productId}:${i.productSizeId}`).join("|") ?? "";
        return `${d.id}|${d.totalPrice}|${d.paymentStatus}|${d.status}|${d.items?.length ?? 0}|${itemsSig}`;
    };

    const createKeyFromOrderDetail = (item: InForProductOrderDetail): string => {
        const sortedToppings = [...(item.toppings || [])].sort((a, b) => a.id.localeCompare(b.id));
        const toppingString = sortedToppings.map((t) => t.id).join("-");
        return `${item.productId}_${item.productSizeId}_${toppingString}_${item.note || ""}`;
    };

    const groupedItems = useCallback((): Grouped[] => {
        if (!orderData?.items) return [];

        const groups: { [key: string]: InForProductOrderDetail[] } = {};
        for (const it of orderData.items) {
            const k = createKeyFromOrderDetail(it);
            if (!groups[k]) groups[k] = [];
            groups[k].push(it);
        }

        return Object.entries(groups).map(([key, items]) => ({
            key,
            items,
            count: items.length,
        }));
    }, [orderData]);

    const grouped: GroupedWithKey[] = useMemo(() => {
        const base = groupedItems();
        const seen = new Map<string, number>();
        return base.map((g) => {
            const n = (seen.get(g.key) ?? 0) + 1;
            seen.set(g.key, n);
            return {...g, __key: `${g.key}__${n}`};
        });
    }, [groupedItems]);

    const toggleExpand = (key: string) => {
        setExpandedProducts((prev) => ({...prev, [key]: !prev[key]}));
    };

    useEffect(() => {
        const temp: Table[] = loadListFromLocalStorage(TABLE_STORE);
        if (temp?.length > 0) setIdTable(temp[0].id);

        const tokenValue = localStorage.getItem(TOKEN_Bro_VALUE);
        if (tokenValue) setToken(tokenValue);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const res: BaseEntityResponse_v2<number> = await runSetting();
                if (res.statusCode === "200") setPaymentmeth(res.data);
            } catch {
                setPaymentmeth(1);
            }
        })();
    }, [runSetting]);

    const fetchOrderData = useCallback(
        async (isBackgroundUpdate = false) => {
           if (!idTable || !token) return;

            if (isBackgroundUpdate) setIsUpdating(true);

            try {
                const res: BaseEntityData<OrderRespontGetByID> = await runGet(idTable, token);
                if (!isMountedRef.current) return;

                if (res.code === "SUCCESS" && res.data?.id) {
                    const sig = computeSignature(res.data);
                    if (sig !== lastSigRef.current) {
                        lastSigRef.current = sig;
                        setOrderData(res.data);
                        handleChange(res.data.items?.length || 0);
                    }
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                if (!isMountedRef.current) return;
                setInitialLoading(false);
                setIsUpdating(false);
            }
        },
        [idTable, token, handleChange]
    );

    useEffect(() => {

        if (idTable && token) fetchOrderData(false);

    }, [idTable, token]);

    useEffect(() => {

        if (intervalRef.current) clearInterval(intervalRef.current);

        if (idTable && token) {
            intervalRef.current = setInterval(() => {
                fetchOrderData(true);
                console.log()
            }, 10000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
        };

    }, [idTable, token]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (cooldownRef.current) clearTimeout(cooldownRef.current);
        };
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchOrderData(false);
        setIsRefreshing(false);
    };

    const handleGoBack = () => router.back();

    const openPayment = () => {
        if (!orderData?.id) return;
        setPaymentOrderId(orderData.id);
        setIsPaymentOpen(true);
    };

    const callStaffPayment = async () => {
        if (isCooldown) {
            setDialogData({status: false, text: "Vui lòng chờ 30 giây trước khi gọi lại"});
            setOpen(true);
            return;
        }
        if (!orderData?.id) return;

        const request: FeedbackRequest = {
            tableId: table.tableId,
            complainNote: "Thanh Toan Tien",
            title: "",
        };

        try {
            setIsCooldown(true);
            await runCallPayment(request);
            setDialogData({status: true, text: "Gọi thanh toán thành công"});
            setOpen(true);
        } catch {
            setDialogData({status: false, text: "Gọi thanh toán thất bại"});
            setOpen(true);
        } finally {
            if (cooldownRef.current) clearTimeout(cooldownRef.current);
            cooldownRef.current = setTimeout(() => setIsCooldown(false), 30000);
        }
    };

    if (initialLoading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center max-w-sm w-full">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5">
                        <div
                            className="absolute inset-0 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-2xl animate-pulse"/>
                        <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
                            <div
                                className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-green-200 border-t-green-600"/>
                        </div>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-green-800 mb-2">Đang tải đơn hàng</h2>
                    <p className="text-gray-500 text-sm">Vui lòng đợi trong giây lát...</p>
                </div>
            </div>
        );
    }

    if (!orderData?.items || orderData.items.length === 0) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center max-w-sm w-full">
                    <div
                        className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 bg-green-100 rounded-2xl flex items-center justify-center">
                        <ShoppingBag size={32} className="text-green-600 sm:w-9 sm:h-9"/>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Chưa có đơn hàng</h2>
                    <p className="text-gray-500 text-sm mb-6">Hiện tại chưa có đơn hàng nào</p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleGoBack}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm"
                        >
                            <ArrowLeft size={16}/>
                            Quay lại
                        </button>

                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-md disabled:opacity-50 transition-all text-sm"
                        >
                            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""}/>
                            {isRefreshing ? "Đang tải..." : "Tải lại"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const showStaffPaymentButton = orderData.paymentStatus !== "Paid" && paymentmeth === 2;
    const showOnlinePaymentButton = orderData.paymentStatus !== "Paid" && paymentmeth === 1;

    return (
        <>
            <div className="min-h-screen bg-white pb-8">
                <div className="bg-white rounded-b-3xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div
                        className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-4 sm:p-5 pt-6 sm:pt-8 mt-4 sm:mt-6 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                    className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <MapPin size={18} className="sm:w-5 sm:h-5"/>
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold">{orderData?.tableName}</h2>
                                    <p className="text-white/90 text-xs flex items-center gap-1">
                                        <Clock size={11} className="sm:w-3 sm:h-3"/>
                                        {new Date(orderData?.createdTime).toLocaleString("vi-VN")}
                                    </p>
                                </div>
                            </div>

                            {isUpdating && (
                                <div
                                    className="px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"/>
                                    Đang cập nhật...
                                </div>
                            )}
                        </div>

                        <div
                            className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 pt-7 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="w-full sm:w-auto">
                                <p className="text-white/80 text-xs mb-0.5">Tổng thanh toán</p>
                                <p className="text-xl sm:text-2xl font-bold">{formatCurrency(orderData?.totalPrice)}</p>
                                <p className="text-sm sm:text-base font-semibold mt-1">
                                    {paymentStatusText(orderData.paymentStatus)}
                                </p>
                            </div>

                            {showOnlinePaymentButton ? (
                                <button
                                    onClick={openPayment}
                                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-green-600 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all text-sm"
                                >
                                    <CreditCard size={18}/>
                                    Thanh toán (VNPay)
                                </button>
                            ) : showStaffPaymentButton ? (
                                <button
                                    onClick={callStaffPayment}
                                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-green-600 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all text-sm"
                                >
                                    <CreditCard size={18}/>
                                    Gọi thanh toán
                                </button>
                            ) : (
                                <button
                                    onClick={() => setOpenDialogFeedBack(true)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-green-600 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all text-sm"
                                >
                                    <RiBillLine size={18}/>
                                    Xem hóa đơn
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-green-50 border-b border-green-100">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <div
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package size={14} className="text-white sm:w-4 sm:h-4"/>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-green-800 flex-1">
                                Danh sách món ({orderData?.items.length})
                            </h3>
                            <StatusLegendMenu/>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            {grouped.map((group) => {
                                const item = group.items[0];
                                const isExpanded = !!expandedProducts[group.key];
                                const isSingle = group.count === 1;

                                return (
                                    <div key={group.__key}>
                                        <div
                                            className="bg-white border border-green-100 rounded-2xl p-3 sm:p-4 hover:shadow-md hover:border-green-300 transition-all">
                                            <div className="flex gap-2 sm:gap-3">
                                                <div className="relative flex-shrink-0">
                                                    <div
                                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-green-100">
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.productName}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTUwIDcwQzYwIDQwIDcwIDQ1IDcwIDUwUzYwIDYwIDUwIDYwUzMwIDU1IDMwIDUwUzQwIDQwIDUwIDQwVjcwWiIgZmlsbD0iI0Q1RDlERCIvPgo8L3N2Zz4K";
                                                            }}
                                                        />
                                                    </div>

                                                    {!isSingle && (
                                                        <div
                                                            className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                                                            x{group.count}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                                                            {item.productName}
                                                        </h4>

                                                        {group.items.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleExpand(group.key)}
                                                                className="text-xs font-bold text-green-700 px-2 py-1 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100"
                                                            >
                                                                {isExpanded ? "Thu gọn" : "Chi tiết"}
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                                        <span
                                                            className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded-lg text-xs sm:text-sm font-bold">
                                                          {getSizeShortName(item.sizeName)}
                                                        </span>
                                                        <OrderStatus status={item.status}/>
                                                    </div>

                                                    <p className="text-lg sm:text-xl font-bold text-green-600 mb-2">
                                                        {formatCurrency(isSingle ? item.price : item.price * group.count)}
                                                    </p>

                                                    {item.note && (
                                                        <div
                                                            className="p-2 bg-amber-50 border border-amber-200 rounded-xl mb-2">
                                                            <p className="text-xs sm:text-sm text-amber-900">
                                                                <span className="font-semibold">💭 </span>
                                                                {item.note}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {item.toppings && item.toppings.length > 0 && (
                                                        <div
                                                            className="p-2 bg-green-50 border border-green-200 rounded-xl">
                                                            <p className="text-xs sm:text-sm font-bold text-green-800 mb-1.5 flex items-center gap-1">
                                                                <Sparkles size={11} className="sm:w-3 sm:h-3"/>
                                                                Topping ({item.toppings.length})
                                                            </p>
                                                            <div className="space-y-1.5">
                                                                {item.toppings.map((topping, idx) => (
                                                                    <div
                                                                        key={`${topping.id}-${idx}`}
                                                                        className="flex items-center justify-between bg-white rounded-lg p-1.5 sm:p-2"
                                                                    >
                                                                        <span
                                                                            className="text-xs sm:text-sm font-medium text-green-700">
                                                                          {topping.name}
                                                                        </span>
                                                                        <span
                                                                            className="text-xs sm:text-sm font-bold text-green-900">
                                                                          {formatCurrency(topping.price)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {isExpanded && group.items.length > 1 && (
                                                        <div
                                                            className="mt-3 p-2 bg-white rounded-xl border border-gray-100">
                                                            <p className="text-xs font-bold text-gray-700 mb-2">
                                                                Danh sách món trong nhóm ({group.items.length})
                                                            </p>
                                                            <div className="space-y-2">
                                                                {group.items.map((it, idx) => (
                                                                    <div
                                                                        key={`${it.id}-${idx}`}
                                                                        className="flex items-center justify-between text-xs sm:text-sm bg-gray-50 rounded-lg px-2 py-2"
                                                                    >
                                                                        <span
                                                                            className="text-gray-700 font-medium truncate pr-2">
                                                                          #{idx + 1} • {it.productName} • {getSizeShortName(it.sizeName)}
                                                                        </span>
                                                                        <OrderStatus status={it.status}/>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-green-200 text-green-700 font-bold hover:bg-green-50 disabled:opacity-60"
                            >
                                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""}/>
                                {isRefreshing ? "Đang tải..." : "Tải lại"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-4 right-4 z-50">
                    <BasicSpeedDial/>
                </div>
            </div>

            {isPaymentOpen && paymentOrderId && (
                <Payment
                    id=""
                    orderId={paymentOrderId}
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                    onSave={() => {
                    }}
                />
            )}

            {dialogData && (
                <MobileDialog
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    status={dialogData.status ? "success" : "error"}
                    message={dialogData.text}
                />
            )}

            {orderData?.id && idTable && (
                <BillDialog
                    isOpen={openDialogFeedBack}
                    onClose={() => setOpenDialogFeedBack(false)}
                    id={idTable}
                    tableId={idTable}
                    tableName={orderData.tableName}
                    status={orderData.status}
                    paymentStatus={orderData.paymentStatus}
                    totalPrice={orderData.totalPrice}
                    items={orderData.items}
                    createdTime={orderData.createdTime}
                />
            )}
        </>
    );
};
