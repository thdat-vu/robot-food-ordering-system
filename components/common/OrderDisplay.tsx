"use client"
import React, {useEffect, useState, useCallback, useRef, useMemo} from 'react';
import {
    Clock,
    MapPin,
    CreditCard,
    Plus,
    RefreshCw,
    AlertCircle,
    ShoppingBag,
    CheckCircle,
    Utensils,
    Truck,
    XCircle
} from 'lucide-react';
import {OrderRespontGetByID} from "@/entites/respont/OrderRespont";
import {Order} from "@/entites/Props/Order";
import {useGetOrderByIdAndTaibleId} from "@/hooks/customHooks/useOrderHooks";
import {loadListFromLocalStorage} from "@/store/ShoppingCart";
import formatCurrency from "@/unit/unit";
import {Payment} from "@/app/features/components/Payment";


export const OrderDisplay = () => {
    const [orderData, setOrderData] = useState<OrderRespontGetByID[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null);
    const [lastFetch, setLastFetch] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const {run} = useGetOrderByIdAndTaibleId();
    const [oerderId, setOerderId] = useState<string>('');

    // (() => {
    //     localStorage.removeItem("order-ss")
    // })()


    const loadRequests = useCallback((): Order[] => {
        try {
            return loadListFromLocalStorage<Order>("order-ss") || [];
        } catch (error) {
            console.error('Error loading requests from localStorage:', error);
            return [];
        }
    }, []);


    const fetchOrders = useCallback(async (requests: Order[], isManualRefresh = false) => {
        if (requests.length === 0) {
            setOrderData([]);
            setLoading(false);
            return;
        }
        if (isManualRefresh) {
            setIsRefreshing(true);
        } else {
            setLoading(true);
        }

        setError(null);

        try {
            const promises = requests.map(async (order) => {
                try {
                    const res = await run(order.id, order.tableId);
                    return res?.data || null;
                } catch (err) {
                    console.error(`Error fetching order ${order.id}:`, err);
                    return null;
                }
            });

            const results = await Promise.allSettled(promises);
            const validResults = results
                .filter((result): result is PromiseFulfilledResult<any> =>
                    result.status === 'fulfilled' && result.value !== null
                )
                .map(result => result.value)
                .flat()
                .filter((item): item is OrderRespontGetByID =>
                    item && typeof item === 'object' && 'id' in item
                );

            console.log('Flattened results:', validResults);
            setOrderData(validResults);
            setLastFetch(new Date());

            const failedCount = results.filter(result =>
                result.status === 'rejected' ||
                (result.status === 'fulfilled' && result.value === null)
            ).length;

            if (failedCount > 0) {
                setError(`Không thể tải ${failedCount} đơn hàng`);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Có lỗi xảy ra khi tải đơn hàng');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [run]);


    const handleRefresh = useCallback(async () => {
        if (isRefreshing || loading) return;
        const requests = loadRequests();
        await fetchOrders(requests, true);
    }, [loadRequests, fetchOrders, isRefreshing, loading]);


    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const initialLoad = async () => {
            if (!isMounted) return;
            const requests = loadRequests();
            await fetchOrders(requests);
        };

        timeoutId = setTimeout(initialLoad, 100);

        intervalRef.current = setInterval(async () => {
            if (!isMounted) return;
            const requests = loadRequests();
            await fetchOrders(requests);
        }, 6000);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);


    const handlePayment = (idOrderItem: string) => {
        setIsPaymentOpen(true);
        setOerderId(idOrderItem);
    }

    useEffect(() => {
        const sorted = [...orderData].sort(
            (a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
        );
        setOrderData(sorted);
    }, []);


    const getStatusColor = useMemo(() => (status: string) => {
        switch (status) {
            case 'Pending':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Completed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Cancelled':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    }, []);


    const getPaymentStatusColor = useMemo(() => (status: string) => {
        switch (status) {
            case 'Pending':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'Paid':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Failed':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    }, []);


    if (loading && orderData.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
                <div className="max-w-sm mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="text-center">
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <div
                                    className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang tải đơn hàng</h2>
                            <p className="text-gray-500">Vui lòng đợi trong giây lát...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    if (!loading && orderData.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
                <div className="max-w-sm mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="text-center">
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <ShoppingBag size={24} className="text-gray-400"/>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng</h2>
                            <p className="text-gray-500 mb-6">Hiện tại chưa có đơn hàng nào được theo dõi</p>
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`}/>
                                {isRefreshing ? 'Đang tải...' : 'Tải lại'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10">
                    <div className="max-w-sm mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Đơn Hàng</h1>
                                <p className="text-sm text-gray-500">{orderData.length} đơn hàng</p>
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing || loading}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`}/>
                                <span className="hidden sm:inline">Làm mới</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-sm mx-auto px-4 py-6 space-y-4">
                    {lastFetch && (
                        <div className="text-xs text-gray-500 text-center">
                            Cập nhật: {lastFetch.toLocaleTimeString('vi-VN')}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0"/>
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {(loading || isRefreshing) && orderData.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <div
                                    className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                                <span className="text-sm font-medium text-blue-700">Đang cập nhật...</span>
                            </div>
                        </div>
                    )}

                    {orderData.map((order, index) => (
                        <div
                            key={index}

                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="bg-green-400 from-blue-600 via-blue-700 to-purple-700 p-5 text-black">
                                <div className="flex justify-between items-start  p-3 rounded-xl">
                                    <div className="flex flex-col">
                                        <div className="flex items-center space-x-1">
                                            <MapPin size={16}/>
                                            <span className="font-semibold text-lg">Bàn {order.tableName}</span>
                                        </div>
                                        <span className="text-sm opacity-80">
                                              {new Date(order.createdTime).toLocaleString("vi-VN", {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  second: "2-digit",
                                                  day: "2-digit",
                                                  month: "2-digit",
                                                  year: "numeric",
                                              })}
                                            </span>
                                    </div>

                                    {/* Bên phải */}
                                    <div className="text-right">
                                        <div className="text-xs opacity-90 uppercase tracking-wide">Tổng cộng</div>
                                        <div className="text-xl font-bold">{formatCurrency(order.totalPrice)}</div>
                                    </div>
                                </div>


                                <div className="flex items-center gap-3">
                                    <OrderStatus status={order.status}/>
                                    <button
                                        onClick={() => handlePayment(order.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}
                                     bg-white/20 border-white/30 hover:bg-gray-500 hover:text-amber-50`}>
                                        <CreditCard size={12} className="inline mr-1.5"/>
                                        {order.paymentStatus}
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                {order.items?.map((item, index) => (
                                    <div key={item.id}
                                         className={`${index > 0 ? 'border-t border-gray-100 pt-5' : ''}`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 text-lg leading-tight">{item.productName}</h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                <span
                                                    className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-medium">
                                                    {item.sizeName}
                                                </span>
                                                    <span
                                                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                                </div>
                                            </div>
                                        </div>

                                        {item.toppings?.length > 0 && (
                                            <div className="mt-4">
                                                <div className="flex items-center mb-3">
                                                    <Plus size={16} className="text-gray-400 mr-1.5"/>
                                                    <span
                                                        className="text-sm font-semibold text-gray-700">Toppings ({item.toppings.length})</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {item.toppings.map((topping) => (
                                                        <div key={topping.id}
                                                             className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                                                            <div className="flex items-center space-x-3">
                                                                <img
                                                                    src={topping.urlImg}
                                                                    alt={topping.name}
                                                                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMyNCA0IDI4IDggMjggMTJTMjQgMjAgMjAgMjBTMTIgMTYgMTIgMTJTMTYgNCAyMCA0VjI4WiIgZmlsbD0iI0Q1RDlERCIvPgo8L3N2Zz4K';
                                                                    }}
                                                                />
                                                                <span
                                                                    className="font-medium text-gray-900">{topping.name}</span>
                                                            </div>
                                                            <span className="text-sm font-semibold text-emerald-600">
                                                            {formatCurrency(topping.price)}
                                                        </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Payment
                id=""
                orderId={oerderId}
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                onSave={() => {
                }}
            />
        </>
    );
};


enum OrderStatusEnum {
    Pending = 'Pending',        // Đang chờ xác nhận
    Confirmed = 'Confirmed',    // Đã xác nhận
    Preparing = 'Preparing',    // Đang chuẩn bị món
    Delivering = 'Delivering',  // Bắt đầu phục vụ
    Completed = 'Completed',    // Đã giao / hoàn thành
    Cancelled = 'Cancelled'     // Đã hủy
}

const OrderStatus: React.FC<{ status: string }> = ({status}) => {

    const getStatusInfo = useMemo(() => {
        switch (status) {
            case OrderStatusEnum.Pending:
                return {
                    text: 'Đang chờ xác nhận',
                    color: 'bg-amber-50 text-amber-700 border-amber-200',
                    icon: Clock
                };
            case OrderStatusEnum.Confirmed:
                return {
                    text: 'Đã xác nhận',
                    color: 'bg-blue-50 text-blue-700 border-blue-200',
                    icon: CheckCircle
                };
            case OrderStatusEnum.Preparing:
                return {
                    text: 'Đang chuẩn bị món',
                    color: 'bg-orange-50 text-orange-700 border-orange-200',
                    icon: Utensils
                };
            case OrderStatusEnum.Delivering:
                return {
                    text: 'Bắt đầu phục vụ',
                    color: 'bg-purple-50 text-purple-700 border-purple-200',
                    icon: Truck
                };
            case OrderStatusEnum.Completed:
                return {
                    text: 'Đã hoàn thành',
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    icon: CheckCircle
                };
            case OrderStatusEnum.Cancelled:
                return {
                    text: 'Đã hủy',
                    color: 'bg-red-50 text-red-700 border-red-200',
                    icon: XCircle
                };
            default:
                return {
                    text: 'Không xác định',
                    color: 'bg-gray-50 text-gray-700 border-gray-200',
                    icon: AlertCircle
                };
        }
    }, [status]);

    const {text, color, icon: Icon} = getStatusInfo;

    return (
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${color}`}>
            <Icon size={12} className="mr-1.5"/>
            {text}
        </div>
    );
};
const getOrderStatusText = (status: string): string => {
    switch (status) {
        case OrderStatusEnum.Pending:
            return 'Đang chờ xác nhận';
        case OrderStatusEnum.Confirmed:
            return 'Đã xác nhận';
        case OrderStatusEnum.Preparing:
            return 'Đang chuẩn bị món';
        case OrderStatusEnum.Delivering:
            return 'Bắt đầu phục vụ';
        case OrderStatusEnum.Completed:
            return 'Đã hoàn thành';
        case OrderStatusEnum.Cancelled:
            return 'Đã hủy';
        default:
            return 'Không xác định';
    }
};

const getOrderStatusColor = (status: string): string => {
    switch (status) {
        case OrderStatusEnum.Pending:
            return 'bg-amber-50 text-amber-700 border-amber-200';
        case OrderStatusEnum.Confirmed:
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case OrderStatusEnum.Preparing:
            return 'bg-orange-50 text-orange-700 border-orange-200';
        case OrderStatusEnum.Delivering:
            return 'bg-purple-50 text-purple-700 border-purple-200';
        case OrderStatusEnum.Completed:
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case OrderStatusEnum.Cancelled:
            return 'bg-red-50 text-red-700 border-red-200';
        default:
            return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};
