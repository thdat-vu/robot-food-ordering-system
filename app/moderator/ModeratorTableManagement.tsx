import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Clock, DollarSign, Users, Eye, AlertCircle, CheckCircle } from 'lucide-react';

interface TableItem {
    id: string;
    name: string;
    status: string;
    qrCode: string;
}
export interface Pagination {
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }

interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    productSizeId: string;
    sizeName: string;
    note: string;
    remarkNote: string;
    quantity: number;
    price: number;
    status: string;
    imageUrl: string;
    createdTime: string;
    toppings: {
        id: string;
        name: string;
        price: number;
        imageUrl: string;
    }[];
}

interface OrderData {
    id: string;
    tableId: string;
    tableName: string;
    status: string;
    paymentStatus: string;
    totalPrice: number;
    createdTime: Date;
    items: OrderItem[];
}

export default function ModeratorTableManagement() {
    const [data, setData] = useState<TableItem[]>([]);
    // States
    const [open, setOpen] = useState<boolean>(false);
    const [selectedQr, setSelectedQr] = useState<string>("");
    const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
    const [expandedOrders, setExpandedOrders] = useState<{[key: string]: boolean}>({});
    const [orderData, setOrderData] = useState<{[key: string]: OrderData[]}>({});
    const [loadingOrders, setLoadingOrders] = useState<{[key: string]: boolean}>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [pendingStatus, setPendingStatus] = useState<{ [key: string]: string }>({});


    
    
    
   
    useEffect(() => {
        const fetchTables = async () => {
          try {
            setLoading(true);
            const response = await fetch("https://be-robo.zd-dev.xyz/api/Table");
            if (!response.ok) throw new Error("Failed to fetch tables");
    
            const json = await response.json();
            console.log("API raw:", json);
    
            // ✅ items + pagination
            const rawTables = json.items || [];
    
            const transformedData: TableItem[] = rawTables.map((TableItem: any) => ({
              id: String(TableItem.id),
              name: TableItem.name || "Unknown",
              status: String(TableItem.status ?? ""),
              qrCode: TableItem.qrCode
                ? TableItem.qrCode
                : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${(TableItem.name || "Unknown")
                    .toLowerCase()
                    .replace(/\s+/g, "")}`,
            }));
    
            setData(transformedData);
            setPagination({
              pageNumber: json.pageNumber,
              totalPages: json.totalPages,
              totalCount: json.totalCount,
              pageSize: json.pageSize,
              hasNextPage: json.hasNextPage,
              hasPreviousPage: json.hasPreviousPage
            });
          } catch (err) {
            console.error("Error fetching tables:", err);
            setError("Failed to load tables");
          } finally {
            setLoading(false);
          }
        };
    
        fetchTables();
      }, []);
    
    

    // Fetch orders for a specific table
    const fetchOrdersForTable = async (tableId: string) => {
        if (loadingOrders[tableId]) return; // Prevent duplicate fetches
        if (orderData[tableId] && orderData[tableId].length > 0) {
            console.log(`Orders for table ${tableId} already loaded, skipping fetch.`);
            return; // Orders already loaded
        }
        try {
            setLoadingOrders(prev => ({ ...prev, [tableId]: true }));
            const response = await fetch(`https://be-robo.zd-dev.xyz/api/Order/table/${tableId}`);
            if (!response.ok) throw new Error('Failed to fetch orders');
            const orders = await response.json();
            console.log(`Orders for table ${tableId}:`, orders.data);
            
            setOrderData(prev => ({
                ...prev,
                [tableId]: orders?.data || []
            }));
        } catch (err) {
            console.error('Error fetching orders:', err);
            setOrderData(prev => ({
                ...prev,
                [tableId]: []
            }));
        } finally {
            setLoadingOrders(prev => ({ ...prev, [tableId]: false }));
        }
    };

    const handleOpen = (table: TableItem) => {
        setSelectedTable(table);
        setSelectedQr(table.qrCode);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedQr("");
        setSelectedTable(null);
    };

    const handleToggleStatus = (table: TableItem) => {
        const currentStatus = table.status.toString();
        const newStatus = currentStatus === "0" ? "1" : "0";
    
        // Lưu trạng thái tạm (chưa xác nhận)
        setPendingStatus(prev => ({
            ...prev,
            [table.id]: newStatus
        }));
    
        // Mở order cho review
        if (!expandedOrders[table.id]) {
            setExpandedOrders(prev => ({
                ...prev,
                [table.id]: true
            }));
    
            // Fetch order data nếu chưa có
            if (!orderData[table.id]) {
                fetchOrdersForTable(table.id);
            }
        }
    };
    
    const confirmStatusChange = (tableId: string) => {
        const table = data.find(t => t.id === tableId);
        if (!table) return;
    
        const newStatus = pendingStatus[tableId] ?? table.status;
    
        // Cập nhật data chính thức
        setData(prevData =>
            prevData.map(item =>
                item.id === tableId ? { ...item, status: newStatus } : item
            )
        );
    
        // Xóa pending và đóng orders
        setPendingStatus(prev => {
            const { [tableId]: _, ...rest } = prev;
            return rest;
        });
        setExpandedOrders(prev => ({
            ...prev,
            [tableId]: false
        }));
    
        console.log("Status confirmed for table:", table.name, "->", newStatus);
    };
    
    const cancelStatusChange = (tableId: string) => {
        // Hủy trạng thái tạm
        setPendingStatus(prev => {
            const { [tableId]: _, ...rest } = prev;
            return rest;
        });
    
        // Đóng orders
        setExpandedOrders(prev => ({
            ...prev,
            [tableId]: false
        }));
    };
    
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available':
            case '0':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'occupied':
            case '1':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'reserved':
            case '2':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available':
            case '0':
                return 'Available';
            case 'occupied':
            case '1':
                return 'Occupied';
            case 'reserved':
            case '2':
                return 'Reserved';
            default:
                return status;
        }
    };

    const getOrderStatusColor = (status: string) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'preparing': 'bg-blue-100 text-blue-800 border-blue-200',
            'ready': 'bg-green-100 text-green-800 border-green-200',
            'served': 'bg-purple-100 text-purple-800 border-purple-200',
            'completed': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[status.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getPaymentStatusColor = (status: string) => {
        const colors = {
            'pending': 'bg-orange-100 text-orange-800 border-orange-200',
            'paid': 'bg-green-100 text-green-800 border-green-200',
            'refunded': 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Table & Order Management</h1>
                    <p className="text-gray-600">Manage restaurant tables, QR codes, and orders</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">{data.length}</div>
                        <div className="text-sm text-gray-600">Total Tables</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-red-600">{data.filter(table => table.status === "1").length}</div>
                        <div className="text-sm text-gray-600">Occupied Tables</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-green-600">
                            ${Object.values(orderData).flat().reduce((total, order) => total + order.totalPrice, 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-purple-600">{Object.values(orderData).flat().length}</div>
                        <div className="text-sm text-gray-600">Orders in Progress</div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <h2 className="text-xl font-semibold text-white">Tables & Orders Overview</h2>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading tables...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tables</h3>
                                <p className="text-gray-500 mb-4">{error}</p>
                                <button
                                    onClick={fetchTables}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tables Found</h3>
                                <p className="text-gray-500">No tables are currently available.</p>
                            </div>
                        ) : (
                            <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                        Table Info
                                    </th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                        QR Code
                                    </th>
                                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                        Status Control
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.map((row, index) => (
                                    <React.Fragment key={row.id}>
                                        {/* Main table row */}
                                        <tr className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                                        {row.name.charAt(row.name.length - 1)}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-900 font-medium">{row.name}</span>
                                                        {orderData[row.id] && orderData[row.id].length > 0 && (
                                                            <div className="text-sm text-gray-500 flex items-center mt-1">
                                                                <Users className="w-3 h-3 mr-1" />
                                                                {orderData[row.id].reduce((acc, order) => acc + order.items.length, 0)} items
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(row.status)}`}>
                                                    {getStatusText(row.status)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                                    onClick={() => handleOpen(row)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View QR
                                                </button>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <label className="inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={row.status === "0"}
                                                            onChange={() => handleToggleStatus(row)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600"></div>
                                                    </label>
                                                    <span className="text-xs text-gray-500">Change Status</span>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded order details */}
                                        {expandedOrders[row.id] && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400">
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                                                <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
                                                                Status Change Review for {row.name}
                                                            </h3>
                                                            <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                                                                Changing to: <span className={`font-medium ${row.status === "0" ? "text-green-600" : "text-red-600"}`}>
                                                                    {getStatusText(row.status)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-4">
                                                            Please review the current orders for this table before confirming the status change.
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        {loadingOrders[row.id] ? (
                                                            <div className="text-center py-8">
                                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-2"></div>
                                                                <p className="text-gray-600">Loading orders for review...</p>
                                                            </div>
                                                        ) : orderData[row.id] && orderData[row.id].length > 0 ? (
                                                            <>
                                                                <div className="bg-white p-4 rounded-lg border border-yellow-200">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <h4 className="font-medium text-gray-900 flex items-center">
                                                                            <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                                                            Active Orders ({orderData[row.id].length})
                                                                        </h4>
                                                                        <div className="text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300">
                                                                            Review Required
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {orderData[row.id].map((order) => (
                                                                        <div key={order.id} className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-3">
                                                                            {/* Order header */}
                                                                            <div className="flex justify-between items-start mb-3 p-2 bg-white rounded border">
                                                                                <div className="flex items-center space-x-3">
                                                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                                        <span className="text-blue-600 font-bold text-sm">#{order.id.substring(6, 8)}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <h5 className="font-medium text-gray-900">Order #{order.id.substring(0, 8)}...</h5>
                                                                                        <div className="flex items-center space-x-2 mt-1">
                                                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(order.status)}`}>
                                                                                                {order.status}
                                                                                            </span>
                                                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                                                                {order.paymentStatus}

                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <div className="text-lg font-semibold text-gray-900 flex items-center justify-end">
                                                                                        <DollarSign className="w-4 h-4 mr-1" />
                                                                                        {order.totalPrice.toFixed(2)}
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-500">
                                                                                        {Math.floor((new Date().getTime() - new Date(order.createdTime).getTime()) / 60000)} min ago
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Compact order items */}
                                                                            <div className="space-y-2">
                                                                                {order.items.map((item) => (
                                                                                    <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                                                                        <div className="flex items-center space-x-3">
                                                                                            <img
                                                                                                src={item.imageUrl}
                                                                                                alt={item.productName}
                                                                                                className="w-8 h-8 rounded object-cover"
                                                                                            />
                                                                                            <div>
                                                                                                <div className="font-medium text-sm text-gray-900">{item.productName}</div>
                                                                                                <div className="text-xs text-gray-500">
                                                                                                    {item.sizeName} × {item.quantity}
                                                                                                    {item.toppings.length > 0 && ` + ${item.toppings.length} toppings`}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="flex items-center space-x-2">
                                                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(item.status)}`}>
                                                                                                {item.status}
                                                                                            </span>
                                                                                            <span className="text-sm font-medium text-gray-900">
                                                                                                {(item.price * item.quantity) }
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Confirmation buttons */}
                                                                <div className="flex justify-end space-x-3 mt-4 p-4 bg-white rounded-lg border border-gray-200">
                                                                    <button
                                                                        onClick={() => cancelStatusChange(row.id)}
                                                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                                                        </svg>
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => confirmStatusChange(row.id)}
                                                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                                        Confirm Status Change
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
                                                                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                                                    </div>
                                                                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Orders</h4>
                                                                    <p className="text-gray-500 text-sm mb-4">This table has no pending orders. Safe to change status.</p>
                                                                </div>
                                                                
                                                                {/* Confirmation buttons for tables without orders */}
                                                                <div className="flex justify-end space-x-3 mt-4 p-4 bg-white rounded-lg border border-gray-200">
                                                                    <button
                                                                        onClick={() => cancelStatusChange(row.id)}
                                                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                                                        </svg>
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => confirmStatusChange(row.id)}
                                                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                                        Confirm Status Change
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Modal */}
            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl relative max-w-md w-full transform transition-all duration-300 scale-100">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">QR Code - {selectedTable?.name}</h2>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
                                onClick={handleClose}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="bg-gray-50 rounded-xl p-6 mb-4 text-center">
                                <img
                                    src={selectedQr}
                                    alt="QR Code"
                                    className="w-full h-64 object-contain rounded-lg mb-4"
                                />
                                <div className="bg-white rounded-lg p-4 shadow-sm border">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedTable?.name}</h3>
                                    <p className="text-gray-600 text-sm mb-1">Scan QR code to order</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTable?.status || '')}`}>
                                            {getStatusText(selectedTable?.status || '')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                Print and place this QR code on the table for customers to scan
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                                </svg>
                                Print QR Code
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}