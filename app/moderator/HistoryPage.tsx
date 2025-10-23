"use client"
import React, {useEffect, useState} from "react";
import {AlertTriangle, CheckCircle2, Clock, XCircle, RefreshCw, Calendar} from "lucide-react";
import {OrderData} from "@/entites/moderator/tableModel";
import {getApiUrl} from "@/env.config";
import OrderCard from "@/components/moderator/OrderCard";

interface HistoryPageProps {
    idTable: string;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({idTable}) => {
    const [orderData, setOrderData] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const API_BASE = getApiUrl();

    // Fetch orders khi component mount hoặc idTable thay đổi
    useEffect(() => {
        if (idTable) {
            fetchOrders();
        }
    }, [idTable]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/Order/table/${idTable}`);
            if (!response.ok) throw new Error('Failed to fetch orders');
            const result = await response.json();
            setOrderData(result?.data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setOrderData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleOrderExpand = (orderId: string) => {
        setExpandedOrderId(prev => prev === orderId ? null : orderId);
    };

    // Tính toán số lượng theo status
    const statusCounts = {
        pending: orderData.filter(o => o.status === 'Pending').length,
        preparing: orderData.filter(o => o.status === 'Preparing').length,
        completed: orderData.filter(o => o.status === 'Completed').length,
        cancelled: orderData.filter(o => o.status === 'Cancelled').length,
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header với stats */}
            {/*<div className="mb-6">*/}
            {/*    <div className="flex items-center justify-between mb-4">*/}
            {/*        <h2 className="text-2xl font-bold text-gray-800">Lịch sử đơn hàng</h2>*/}
            {/*        <button*/}
            {/*            onClick={fetchOrders}*/}
            {/*            disabled={loading}*/}
            {/*            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50"*/}
            {/*        >*/}
            {/*            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>*/}
            {/*            <span>Làm mới</span>*/}
            {/*        </button>*/}
            {/*    </div>*/}

            {/*    /!* Stats Grid *!/*/}
            {/*    <div className="grid grid-cols-4 gap-4">*/}
            {/*        <div*/}
            {/*            className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl px-4 py-3 text-center border-2 border-yellow-200 shadow-sm">*/}
            {/*            <div className="flex items-center justify-center space-x-2 mb-1">*/}
            {/*                <Clock className="w-5 h-5 text-yellow-600"/>*/}
            {/*                <span className="text-2xl font-bold text-yellow-700">*/}
            {/*                    {statusCounts.pending}*/}
            {/*                </span>*/}
            {/*            </div>*/}
            {/*            <span className="text-sm text-yellow-700 font-medium">Chờ xử lý</span>*/}
            {/*        </div>*/}

            {/*        <div*/}
            {/*            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl px-4 py-3 text-center border-2 border-orange-200 shadow-sm">*/}
            {/*            <div className="flex items-center justify-center space-x-2 mb-1">*/}
            {/*                <AlertTriangle className="w-5 h-5 text-orange-600"/>*/}
            {/*                <span className="text-2xl font-bold text-orange-700">*/}
            {/*                    {statusCounts.preparing}*/}
            {/*                </span>*/}
            {/*            </div>*/}
            {/*            <span className="text-sm text-orange-700 font-medium">Đang chuẩn bị</span>*/}
            {/*        </div>*/}

            {/*        <div*/}
            {/*            className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl px-4 py-3 text-center border-2 border-green-200 shadow-sm">*/}
            {/*            <div className="flex items-center justify-center space-x-2 mb-1">*/}
            {/*                <CheckCircle2 className="w-5 h-5 text-green-600"/>*/}
            {/*                <span className="text-2xl font-bold text-green-700">*/}
            {/*                    {statusCounts.completed}*/}
            {/*                </span>*/}
            {/*            </div>*/}
            {/*            <span className="text-sm text-green-700 font-medium">Hoàn thành</span>*/}
            {/*        </div>*/}

            {/*        <div*/}
            {/*            className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl px-4 py-3 text-center border-2 border-red-200 shadow-sm">*/}
            {/*            <div className="flex items-center justify-center space-x-2 mb-1">*/}
            {/*                <XCircle className="w-5 h-5 text-red-600"/>*/}
            {/*                <span className="text-2xl font-bold text-red-700">*/}
            {/*                    {statusCounts.cancelled}*/}
            {/*                </span>*/}
            {/*            </div>*/}
            {/*            <span className="text-sm text-red-700 font-medium">Đã hủy</span>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div
                                className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-emerald-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải đơn hàng...</p>
                        </div>
                    </div>
                ) : orderData.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                Chưa có đơn hàng
                            </h3>
                            <p className="text-gray-500">
                                Chưa có đơn hàng nào cho bàn này
                            </p>
                        </div>
                    </div>
                ) : (
                    <OrderCard
                        tableId={idTable}
                        orders={orderData}
                        onToggleExpand={handleToggleOrderExpand}
                        expandedOrderId={expandedOrderId}
                        showDateFilter={true}
                    />
                )}
            </div>

            {orderData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                        Tổng cộng: <span className="font-bold text-emerald-600">{orderData.length}</span> đơn hàng
                    </p>
                </div>
            )}
        </div>
    );
};