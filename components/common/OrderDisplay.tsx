"use client"
import React, {useEffect, useState, useRef} from 'react';
import {
    MapPin,
    CreditCard,
    RefreshCw,
    AlertCircle,
    ShoppingBag,
    Package,
    Clock,
    ArrowLeft,
    Sparkles,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import {RiBillLine} from "react-icons/ri";

import {InForProductOrderDetail, OrderRespontGetByID} from "@/entites/respont/OrderRespont";
import {useGetOrderWithIdTableAndToken} from "@/hooks/customHooks/useOrderHooks";
import formatCurrency from "@/unit/unit";
import {Payment} from "@/app/features/components/Payment";
import {useTableContext} from "@/hooks/context/Context";
import {VscFeedback} from "react-icons/vsc";
import {FeedbackDialog} from "@/components/common/FeedbackDialog";
import {useCreateFeedback} from "@/hooks/customHooks/useFeedbackHooks";
import {FeedbackRequest} from "@/entites/request/FeedbackRequest";
import {OrderStatus} from "@/components/common/OrderStatus";
import {MobileDialog} from "@/components/common/MobileDialog";
import {Table} from "@/entites/respont/Table";
import {loadListFromLocalStorage} from "@/store/ShoppingCart";
import {TABLE_STORE, TOKEN_Bro_VALUE} from "@/name-value-env";
import {BaseEntityData, BaseEntityResponse_v2} from "@/entites/BaseEntity";
import {useRouter} from "next/navigation";
import {useGetSetting} from "@/hooks/customHooks/useSettingHooks";
import {Feedback} from "@/components/common/Feedback";
import {BillDialog} from "@/components/common/BillDialog";
import {BillPDFPreview} from "@/components/common/BillPDFPreview";

type OrderDisplay = {
    handleChange: (number: number) => void;
}

export const OrderDisplay = ({handleChange}: OrderDisplay) => {
    const router = useRouter();
    const [orderData, setOrderData] = useState<OrderRespontGetByID | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const {run: runGet} = useGetOrderWithIdTableAndToken();
    const [orderId, setOrderId] = useState<string>('');
    const [openFeedback, setOpenFeedback] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<InForProductOrderDetail>();
    const [listIdorderItem, setListIdorderItem] = useState<string[]>([]);
    const {run: runCallPayment} = useCreateFeedback();
    const [open, setOpen] = useState<boolean>(false);
    const [dialogData, setDialogData] = useState<{ status: boolean, text: string }>();
    const table = useTableContext();
    const [token, setToken] = useState<string>();
    const [idTable, setIdTable] = useState<string>();
    const [expandedProducts, setExpandedProducts] = useState<{ [key: string]: boolean }>({});
    const {run} = useGetSetting();
    const [paymentmeth, setPaymentmeth] = useState<number>(1)
    const [isCooldown, setIsCooldown] = useState(false);
    const [openDialogFeedBack, setOpenDialogFeedBack] = useState<boolean>(false);
    const [idOrderId, setIdOrderId] = useState<string>()

    // Thêm ref để track interval và prevent multiple intervals
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    // Helper function to shorten size names
    const getSizeShortName = (sizeName: string): string => {
        const sizeMap: { [key: string]: string } = {
            'Large': 'L',
            'Medium': 'M',
            'Small': 'S',
            'large': 'L',
            'medium': 'M',
            'small': 'S',
            'Lớn': 'L',
            'Vừa': 'M',
            'Nhỏ': 'S'
        };
        return sizeMap[sizeName] || sizeName;
    };

    useEffect(() => {
        const temp: Table[] = loadListFromLocalStorage(TABLE_STORE);
        if (temp.length > 0) {
            setIdTable(temp[0].id);
        }
        const tokenValue = localStorage.getItem(TOKEN_Bro_VALUE);
        if (tokenValue) {
            setToken(tokenValue);
        }
    }, []);

    // Hàm fetch data - KHÔNG thay đổi loading state khi background refresh
    const fetchOrderData = async (isBackgroundUpdate = false) => {
        if (!idTable || !token) return;

        // Chỉ set loading khi lần đầu tiên load hoặc manual refresh
        if (!isBackgroundUpdate) {
            setLoading(true);
        }

        try {
            const res: BaseEntityData<OrderRespontGetByID> = await runGet(idTable, token);

            // Kiểm tra component còn mounted không
            if (!isMountedRef.current) return;

            if (res.code === 'SUCCESS') {
                setIdOrderId(res.data.id);

                // So sánh data mới với data cũ trước khi update
                // Chỉ update khi có thay đổi thực sự
                const hasChanges = JSON.stringify(orderData) !== JSON.stringify(res.data);

                if (hasChanges) {
                    setOrderData(res.data as OrderRespontGetByID);
                    const itemCount = res.data.items?.length || 0;
                    handleChange(itemCount);
                }
            }
        } catch (err) {
            console.error('Fetch error:', err);
            // Chỉ show error khi không phải background update
            if (!isBackgroundUpdate) {
                setError('Không thể tải đơn hàng');
            }
        } finally {
            if (!isBackgroundUpdate) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const res: BaseEntityResponse_v2<number> = await run();
                if (res.statusCode == '200') {
                    setPaymentmeth(res.data);
                }
            } catch (error) {
                setPaymentmeth(1);
            }
        })()
    }, []);

    // Effect để fetch data lần đầu
    useEffect(() => {
        if (idTable && token) {
            fetchOrderData(false); // Initial load
        }
    }, [idTable, token]);

    // Effect riêng cho auto-refresh sau mỗi 3 giây
    useEffect(() => {
        // Clear interval cũ nếu có
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Chỉ setup interval khi đã có data
        if (idTable && token && orderData) {
            intervalRef.current = setInterval(() => {
                fetchOrderData(true); // Background update - không hiển thị loading
            }, 3000); // 3 giây
        }

        // Cleanup function
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [idTable, token, orderData]); // Dependencies để re-setup interval khi cần

    // Cleanup khi component unmount
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchOrderData(false); // Manual refresh - hiển thị loading
        setIsRefreshing(false);
    };

    const handleGoBack = () => {
        router.back();
    };

    const createKeyFromOrderDetail = (item: InForProductOrderDetail): string => {
        let toppingString = '';
        const sortedToppings = [...(item.toppings || [])].sort((a, b) => a.id.localeCompare(b.id));
        sortedToppings.forEach(topping => {
            toppingString += `${topping.id}-`;
        });
        return `${item.productId}_${item.productSizeId}_${toppingString}_${item.note || ''}`;
    };

    const handleOpenFeedback = (items: InForProductOrderDetail[]) => {
        const firstId = items[0]?.id;
        setListIdorderItem([firstId]);
        setSelectedItem(items[0]);
        setOpenFeedback(true);
    };

    const handlePayment = async () => {
        if (isCooldown) {
            setDialogData({status: false, text: "Vui lòng chờ 30 giây trước khi gọi lại"});
            setOpen(true);
            return;
        }

        if (!orderData?.id) return;

        const request: FeedbackRequest = {
            tableId: table.tableId,
            complainNote: "Thanh Toan Tien",
            orderItemIds: [],
            title: "",
        };

        try {
            setIsCooldown(true);
            const res = await runCallPayment(request);
            console.log(res);
            setDialogData({status: true, text: "Gọi thanh toán thành công"});
            setOpen(true);

            setTimeout(() => setIsCooldown(false), 30000);
        } catch (err) {
            setDialogData({status: false, text: "Gọi thanh toán thất bại"});
            setOpen(true);
            setTimeout(() => setIsCooldown(false), 30000);
        }
    };

    const groupedItems = () => {
        if (!orderData?.items) return [];

        const groups: { [key: string]: InForProductOrderDetail[] } = {};

        orderData.items.forEach(item => {
            const key = createKeyFromOrderDetail(item);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });

        return Object.entries(groups).map(([key, items]) => ({
            key,
            items,
            count: items.length
        }));
    };

    const toggleExpand = (key: string) => {
        setExpandedProducts(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const paymentStatus = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'Chưa thanh toán';
            case 'Paid':
                return 'Thanh toán thành công';
            case 'Failed':
                return 'Thất bại';
            case 'Refunded':
                return 'Đã hoàn tiền'
            default:
                return '';
        }
    }

    if (loading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center max-w-sm w-full">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5">
                        <div
                            className="absolute inset-0 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-2xl animate-pulse"></div>
                        <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
                            <div
                                className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-3 border-green-200 border-t-green-600"></div>
                        </div>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-green-800 mb-2">Đang tải đơn hàng</h2>
                    <p className="text-gray-500 text-sm">Vui lòng đợi trong giây lát...</p>
                </div>
            </div>
        );
    }

    if (!orderData?.items) {
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
                            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''}/>
                            {isRefreshing ? 'Đang tải...' : 'Tải lại'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const grouped = groupedItems();

    return (
        <>
            <div className="min-h-screen bg-white pb-8 sm:pb-8">
                <div className="bg-white rounded-b-3xl shadow-lg overflow-hidden">
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
                                        {new Date(orderData?.createdTime).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 pt-7 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="w-full sm:w-auto">
                                <p className="text-white/80 text-xs mb-0.5">Tổng thanh toán</p>
                                <p className="text-xl sm:text-2xl font-bold">{formatCurrency(orderData?.totalPrice)}</p>
                                <p className="text-sm sm:text-base font-semibold mt-1">{paymentStatus(orderData.paymentStatus)}</p>
                            </div>
                            {
                                (orderData.paymentStatus !== 'Paid' && paymentmeth === 2) ? (
                                    <button
                                        onClick={handlePayment}
                                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-green-600 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all text-sm"
                                    >
                                        <CreditCard size={18}/>
                                        Thanh toán
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setOpenDialogFeedBack(true)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-green-600 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all text-sm"
                                    >
                                        <RiBillLine size={18}/>
                                        Xem hóa đơn
                                    </button>
                                )
                            }
                        </div>
                    </div>

                    <div className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <div
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <Package size={14} className="text-white sm:w-4 sm:h-4"/>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-green-800">
                                Danh sách món ({orderData?.items.length})
                            </h3>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            {grouped.map((group) => {
                                const item = group.items[0];
                                const isExpanded = expandedProducts[group.key];
                                const isSingle = group.count === 1;

                                return (
                                    <div key={group.key}>
                                        <div
                                            className="bg-white border border-green-100 rounded-xl p-3 sm:p-4 hover:shadow-md hover:border-green-300 transition-all">
                                            <div className="flex gap-2 sm:gap-3">
                                                <div className="relative flex-shrink-0">
                                                    <div
                                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-green-100">
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.productName}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTUwIDcwQzYwIDQwIDcwIDQ1IDcwIDUwUzYwIDYwIDUwIDYwUzMwIDU1IDMwIDUwUzQwIDQwIDUwIDQwVjcwWiIgZmlsbD0iI0Q1RDlERCIvPgo8L3N2Zz4K';
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
                                                        <button
                                                            onClick={() => handleOpenFeedback(isSingle ? [item] : group.items)}
                                                            className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-amber-100 hover:bg-amber-200 text-amber-600 rounded-lg flex items-center justify-center transition-all"
                                                        >
                                                            <VscFeedback size={14} className="sm:w-4 sm:h-4"/>
                                                        </button>
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
                                                            className="p-2 bg-amber-50 border border-amber-200 rounded-lg mb-2">
                                                            <p className="text-xs sm:text-sm text-amber-900">
                                                                <span className="font-semibold">💭 </span>
                                                                {item.note}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {item.toppings && item.toppings.length > 0 && (
                                                        <div
                                                            className="p-2 bg-green-50 border border-green-200 rounded-lg">
                                                            <p className="text-xs sm:text-sm font-bold text-green-800 mb-1.5 flex items-center gap-1">
                                                                <Sparkles size={11} className="sm:w-3 sm:h-3"/>
                                                                Topping ({item.toppings.length})
                                                            </p>
                                                            <div className="space-y-1.5">
                                                                {item.toppings.map((topping) => (
                                                                    <div key={topping.id}
                                                                         className="flex items-center justify-between bg-white rounded-lg p-1.5 sm:p-2">
                                                                        <span
                                                                            className="text-xs sm:text-sm font-medium text-green-700">{topping.name}</span>
                                                                        <span
                                                                            className="text-xs sm:text-sm font-bold text-green-900">
                                                                            {formatCurrency(topping.price)}
                                                                        </span>
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
                    </div>
                </div>
            </div>

            <Payment
                id=""
                orderId={orderId}
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                onSave={() => {
                }}
            />

            <FeedbackDialog
                isOpen={openFeedback}
                productInfo={selectedItem}
                listIds={listIdorderItem}
                onClose={() => setOpenFeedback(false)}
            />

            {dialogData && (
                <MobileDialog
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    status={dialogData.status ? "success" : "error"}
                    message={dialogData.text}
                />
            )}

            {idOrderId && idTable && (
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