"use client"
import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
    Clock,
    MapPin,
    CreditCard,
    RefreshCw,
    AlertCircle,
    ShoppingBag,
    CheckCircle,
    Utensils,
    Truck,
    XCircle,
    StickyNote,
    Sparkles,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import {CgPerformance} from "react-icons/cg";

import {InForProductOrderDetail, OrderRespontGetByID} from "@/entites/respont/OrderRespont";
import {useGetOrderByIdAndTaibleId, useGetOrderWithIdTableAndToken} from "@/hooks/customHooks/useOrderHooks";
import formatCurrency from "@/unit/unit";
import {Payment} from "@/app/features/components/Payment";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";
import {useTableContext} from "@/hooks/context/Context";
import {Topping} from "@/entites/respont/Topping";
import {VscFeedback} from "react-icons/vsc";
import {FeedbackDialog} from "@/components/common/FeedbackDialog";
import {useCreateFeedback} from "@/hooks/customHooks/useFeedbackHooks";
import {FeedbackRequest} from "@/entites/request/FeedbackRequest";

export type GroupedProduct = {
    productName: string;
    productId: string;
    imageUrl: string;
    items: InForProductOrderDetail[];
    totalQuantity: number;
    totalPrice: number;
};

type OrderDisplay = {
    handleChange: (number: number) => void;
}

export const OrderDisplay = ({handleChange}: OrderDisplay) => {
    const [orderData, setOrderData] = useState<OrderRespontGetByID[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null);
    const [lastFetch, setLastFetch] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const {run} = useGetOrderByIdAndTaibleId();
    const {run: runGet} = useGetOrderWithIdTableAndToken();
    const [oerderId, setOerderId] = useState<string>('');
    const [detail, setDetail] = useState<InForProductOrderDetail[] | undefined>()
    const [groupedProducts, setGroupedProducts] = useState<GroupedProduct[]>([]);
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
    const [openFeedback, setOpenFeedback] = useState<boolean>(false);
    const [DetailType, setDetailType] = useState<InForProductOrderDetail>();
    const [listIdorderItem, setListIdorderItem] = useState<string[]>([])
    const {run: runCallPayment} = useCreateFeedback();

    const token = useDeviceToken();
    const table = useTableContext();

    useEffect(() => {
        (async () => {
            const res = await runGet(table.tableId, token.deviceToken);
            if (res)
                setOrderData(res.data as OrderRespontGetByID[]);
        })()
    }, []);

    const createKeyFromOrderDetail = (item: InForProductOrderDetail): string => {
        let toppingString = '';
        item.toppings.forEach(topping => {
            toppingString += `${topping.id}+${topping.price}-`;
        });
        return `${item.productId}_${item.productSizeId}_${toppingString}_${item.note}`;
    };

    const handleOpenFeedback = (item: InForProductOrderDetail) => {
        const key = createKeyFromOrderDetail(item);
        const similarProductIds: string[] = [];

        orderData.forEach(value => {
            value.items.forEach(process => {
                var a = createKeyFromOrderDetail(process);
                if (key === a) {
                    similarProductIds.push(process.id);
                }
            })
        })
        setListIdorderItem(similarProductIds);
        setDetailType(item);
        setOpenFeedback(true)
    }

    function countShoppingCart(arr: InForProductOrderDetail[]) {
        const map = new Map<string, { shc: InForProductOrderDetail; quantity: number }>();

        for (const item of arr) {
            let toppingString = '';
            item.toppings.forEach(value => {
                toppingString += `${value.id}+${value.price}-`;
            });
            const key = `${item.id}_${item.productId}_${item.productSizeId}_${toppingString}`;
            if (!map.has(key)) {
                map.set(key, {shc: item, quantity: 1});
            } else {
                map.get(key)!.quantity += 1;
            }
        }

        return Array.from(map.values());
    }

    // Group products by product name
    const groupProductsByName = (items: InForProductOrderDetail[]): GroupedProduct[] => {
        const productMap = new Map<string, GroupedProduct>();

        items.forEach(item => {
            const key = item.productName;

            if (!productMap.has(key)) {
                productMap.set(key, {
                    productName: item.productName,
                    productId: item.productId,
                    imageUrl: item.imageUrl,
                    items: [item],
                    totalQuantity: 1,
                    totalPrice: item.price
                });
            } else {
                const existing = productMap.get(key)!;
                existing.items.push(item);
                existing.totalQuantity += 1;
                existing.totalPrice += item.price;
            }
        });

        return Array.from(productMap.values());
    };

    const toggleProductExpansion = (productName: string) => {
        setExpandedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productName)) {
                newSet.delete(productName);
            } else {
                newSet.add(productName);
            }
            return newSet;
        });
    };

    useEffect(() => {
        if (orderData.length > 0) {
            const allItems: InForProductOrderDetail[] = [];

            orderData.forEach(order => {
                allItems.push(...order.items);
            });

            setDetail(allItems);
            setGroupedProducts(groupProductsByName(allItems));

            // Call handleChange with total number of items
            handleChange(allItems.length);
        } else {
            setDetail(undefined);
            setGroupedProducts([]);
            handleChange(0);
        }
    }, [orderData, handleChange]);

    const handlePayment = async (idOrderItem: string) => {
        const request: FeedbackRequest = {
            idTable: table.tableId,
            note: "Thanh Toan Tien",
            idOrderItem: []
        }
        const a = await runCallPayment(request)
        console.log(a)
    }

    useEffect(() => {
        const sorted = [...orderData].sort(
            (a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
        );
        setOrderData(sorted);
    }, []);

    const getPaymentStatusColor = useMemo(() => (status: string) => {
        switch (status) {
            case 'Pending':
                return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'Paid':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'Failed':
                return 'bg-red-50 text-red-700 border border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-200';
        }
    }, []);

    if (loading && orderData.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="px-4 py-8">
                    <div className="max-w-sm mx-auto">
                        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
                            <div
                                className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <div
                                    className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Đang tải đơn hàng</h2>
                            <p className="text-gray-500">Vui lòng đợi trong giây lát...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!loading && orderData.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="px-4 py-8">
                    <div className="max-w-sm mx-auto">
                        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
                            <div
                                className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
                                <ShoppingBag size={24} className="text-gray-400"/>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn hàng</h2>
                            <p className="text-gray-500 mb-6">Hiện tại chưa có đơn hàng nào</p>
                            <button
                                disabled={isRefreshing}
                                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
                            >
                                <RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`}/>
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
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-100 z-40">
                    <div className="px-4 py-4">
                        <div className="max-w-sm mx-auto flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Đơn Hàng</h1>
                                <p className="text-sm text-gray-500 mt-0.5">{orderData.length} đơn hàng</p>
                            </div>
                            <button
                                disabled={isRefreshing || loading}
                                className="flex items-center px-4 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 transition-all duration-200 shadow-sm"
                            >
                                <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`}/>
                                Làm mới
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 py-6">
                    <div className="max-w-sm mx-auto space-y-4">
                        {lastFetch && (
                            <div className="text-xs text-gray-400 text-center">
                                Cập nhật: {lastFetch.toLocaleTimeString('vi-VN')}
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0"/>
                                    <div>
                                        <h3 className="text-sm font-semibold text-red-800">Có lỗi xảy ra</h3>
                                        <p className="text-sm text-red-700 mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(loading || isRefreshing) && orderData.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                                    <span className="text-sm font-medium text-blue-700">Đang cập nhật...</span>
                                </div>
                            </div>
                        )}

                        {orderData.map((order, index) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                            >
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-5 text-white">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <MapPin size={18} className="text-blue-100"/>
                                                <span className="font-bold text-xl">{order.tableName}</span>
                                            </div>
                                            <span className="text-blue-100 text-sm">
                                                {new Date(order.createdTime).toLocaleString("vi-VN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-blue-100 text-xs font-medium mb-1">TỔNG CỘNG</div>
                                            <div className="text-2xl font-bold">{formatCurrency(order.totalPrice)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <OrderStatus status={order.status}/>
                                        <button
                                            onClick={() => handlePayment(order.id)}
                                            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${getPaymentStatusColor(order.paymentStatus)} hover:scale-105`}
                                        >
                                            <CreditCard size={12} className="inline mr-2"/>
                                            {order.paymentStatus}
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    {groupedProducts.map((product, productIndex) => (
                                        <div key={productIndex}
                                             className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                                            {/* Product Header - Clickable */}
                                            <div
                                                onClick={() => toggleProductExpansion(product.productName)}
                                                className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200"
                                            >
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.productName}
                                                    className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTYiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTMyIDQ0QzM4IDI0IDQ0IDI4IDQ0IDMyUzM4IDQwIDMyIDQwUzIwIDM2IDIwIDMyUzI2IDI0IDMyIDI0VjQ0WiIgZmlsbD0iI0Q1RDlERCIvPgo8L3N2Zz4K';
                                                    }}
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                                            {product.productName}
                                                        </h3>
                                                        <div className="flex items-center space-x-2">
                                                            <span
                                                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-xl text-sm font-medium">
                                                                x{product.totalQuantity}
                                                            </span>
                                                            {expandedProducts.has(product.productName) ?
                                                                <ChevronUp size={20} className="text-gray-400"/> :
                                                                <ChevronDown size={20} className="text-gray-400"/>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-lg font-bold text-emerald-600">
                                                            {
                                                                formatCurrency(
                                                                    product.totalPrice +
                                                                    product.items.reduce(
                                                                        (sum, item) =>
                                                                            sum +
                                                                            item.toppings.reduce((toppingSum, topping) => toppingSum + topping.price, 0),
                                                                        0
                                                                    )
                                                                )
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dropdown Content */}
                                            {expandedProducts.has(product.productName) && (
                                                <div className="mt-4 space-y-4 pl-4">
                                                    {product.items.map((item, itemIndex) => (
                                                        <div key={item.id}
                                                             className="bg-gray-50 rounded-2xl p-4 relative">
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex-1">
                                                                    <div
                                                                        className="flex items-center flex-wrap gap-2 mb-2">
                                                                        <span
                                                                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-xl text-sm font-medium">
                                                                            {item.sizeName}
                                                                        </span>
                                                                        <OrderStatus status={item.status}/>
                                                                    </div>
                                                                    <span
                                                                        className="text-lg font-bold text-emerald-600">
                                                                        {formatCurrency(item.price)}
                                                                    </span>
                                                                </div>
                                                                <VscFeedback
                                                                    onClick={() => handleOpenFeedback(item)}
                                                                    className="text-black text-3xl bg-gray-200 animate-shake cursor-pointer rounded-full p-2 hover:animate-pulse"
                                                                />
                                                            </div>

                                                            {item.note && (
                                                                <div
                                                                    className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4">
                                                                    <div className="flex items-start space-x-2">
                                                                        <StickyNote size={16}
                                                                                    className="text-amber-600 mt-0.5 flex-shrink-0"/>
                                                                        <div>
                                                                            <span
                                                                                className="text-amber-800 text-sm font-medium">Ghi chú: </span>
                                                                            <span
                                                                                className="text-amber-700 text-sm">{item.note}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {item.toppings?.length > 0 && (
                                                                <div className="bg-white rounded-2xl p-4">
                                                                    <div className="flex items-center mb-3">
                                                                        <Sparkles size={16}
                                                                                  className="text-purple-500 mr-2"/>
                                                                        <span className="font-semibold text-gray-800">
                                                                            Topping ({item.toppings?.length})
                                                                        </span>
                                                                    </div>
                                                                    <div className="space-y-3">
                                                                        {Array.from(
                                                                            item.toppings.reduce((map, topping) => {
                                                                                if (!map.has(topping.id)) {
                                                                                    map.set(topping.id, {
                                                                                        ...topping,
                                                                                        quantity: 1
                                                                                    });
                                                                                } else {
                                                                                    map.get(topping.id)!.quantity += 1;
                                                                                }
                                                                                return map;
                                                                            }, new Map<string, Topping & {
                                                                                quantity: number
                                                                            }>())
                                                                        ).map(([id, topping]) => (
                                                                            <div
                                                                                key={id}
                                                                                className="flex items-center justify-between bg-gray-50 rounded-xl p-3 shadow-sm"
                                                                            >
                                                                                <div
                                                                                    className="flex items-center space-x-3">
                                                                                    <img
                                                                                        src={topping.imageUrl}
                                                                                        alt={topping.name}
                                                                                        className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                                                                                        onError={(e) => {
                                                                                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMTAiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTIwIDI4QzI0IDIwIDI4IDIyIDI4IDI0UzI0IDI4IDIwIDI4UzEyIDI2IDEyIDI0UzE2IDIwIDIwIDIwVjI4WiIgZmlsbD0iI0Q1RDlERCIvPgo8L3N2Zz4K';
                                                                                        }}
                                                                                    />
                                                                                    <span
                                                                                        className="font-medium text-gray-900">{topping.name} (x{topping.quantity})</span>
                                                                                </div>
                                                                                <span
                                                                                    className="font-bold text-emerald-600">
                                                                                    {formatCurrency(topping.price * topping.quantity)}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
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
            <FeedbackDialog
                isOpen={openFeedback}
                productInfo={DetailType}
                listIds={listIdorderItem}
                onClose={() => setOpenFeedback(false)}
            />
        </>
    );
};

enum OrderStatusEnum {
    Pending = 'Pending',
    Confirmed = 'Confirmed',
    Preparing = 'Preparing',
    Delivering = 'Delivering',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
    Served = 'Served',
    Ready = 'Ready'
}

const OrderStatus: React.FC<{ status: string }> = ({status}) => {
    const getStatusInfo = useMemo(() => {
        switch (status) {
            case OrderStatusEnum.Pending:
                return {
                    text: 'Chờ xác nhận',
                    color: 'bg-amber-100 text-amber-800',
                    icon: Clock
                };
            case OrderStatusEnum.Confirmed:
                return {
                    text: 'Đã xác nhận',
                    color: 'bg-blue-100 text-blue-800',
                    icon: CheckCircle
                };
            case OrderStatusEnum.Preparing:
                return {
                    text: 'Đang pha chế',
                    color: 'bg-orange-100 text-orange-800',
                    icon: Utensils
                };
            case OrderStatusEnum.Delivering:
                return {
                    text: 'Đang phục vụ',
                    color: 'bg-purple-100 text-purple-800',
                    icon: Truck
                };
            case OrderStatusEnum.Completed:
                return {
                    text: 'Hoàn thành',
                    color: 'bg-emerald-100 text-emerald-800',
                    icon: CheckCircle
                };
            case OrderStatusEnum.Cancelled:
                return {
                    text: 'Đã hủy',
                    color: 'bg-red-100 text-red-800',
                    icon: XCircle
                };
            case OrderStatusEnum.Served:
                return {
                    text: 'Đã phục vụ',
                    color: 'bg-green-100 text-green-800',
                    icon: CheckCircle
                };
            case OrderStatusEnum.Ready:
                return {
                    text: 'Sẵn sàng',
                    color: 'bg-emerald-100 text-emerald-800',
                    icon: CgPerformance
                };
            default:
                return {
                    text: 'Không rõ',
                    color: 'bg-gray-100 text-gray-800',
                    icon: AlertCircle
                };
        }
    }, [status]);

    const {text, color, icon: Icon} = getStatusInfo;

    return (
        <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${color}`}>
            <Icon size={12} className="mr-1.5"/>
            {text}
        </div>
    );
};