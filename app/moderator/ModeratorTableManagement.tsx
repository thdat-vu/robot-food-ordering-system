import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Clock, DollarSign, Users, Eye, AlertCircle, CheckCircle ,ChevronLeft, X, Search } from 'lucide-react';
import OrderDetailDialog, { TableItem, OrderItem, OrderData } from "./OrderDetailDialog";
import Pagination from "@/lib/utils/Pagination";
import axios from 'axios';

// Remove duplicate interfaces since they're imported from OrderDetailDialog

interface Paginations {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
export default function ModeratorTableManagement() {
    const [data, setData] = useState<TableItem[]>([]);
    // QR Modal States
    const [open, setOpen] = useState<boolean>(false);
    const [selectedQr, setSelectedQr] = useState<string>("");
    const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
    
    // Order & Table States
    const [orderData, setOrderData] = useState<{[key: string]: OrderData[]}>({});
    const [loadingOrders, setLoadingOrders] = useState<{[key: string]: boolean}>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
  
    const [pendingStatus, setPendingStatus] = useState<{ [key: string]: number }>({});

    
    

    // Order Dialog States
    const [orderDialogOpen, setOrderDialogOpen] = useState<boolean>(false);
    const [selectedTableForOrders, setSelectedTableForOrders] = useState<TableItem | null>(null);
    const [searchName, setSearchName] = useState("");
    const [status, setStatus] = useState("");
    const [pagination, setPagination] = useState<Paginations>({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });



      useEffect(() => {
        fetchTables();
      }, [pagination.pageNumber, pagination.pageSize, searchName, status]);

    // Debounce function to limit API calls
    const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };
    // Debounced fetch function
    const fetchTables = async () => {
        try {
          setLoading(true);
    
        const url = new URL("https://be-robo.zd-dev.xyz/api/Table");
          url.searchParams.append("PageNumber", String(pagination.pageNumber));
          url.searchParams.append("PageSize", String(pagination.pageSize));
          if (searchName) url.searchParams.append("tableName", searchName);
          if (status) url.searchParams.append("status", status);


          const response = await fetch(url.toString());
          console.log(response  )
          
          if (!response.ok) throw new Error("Failed to fetch tables");
    
          const json = await response.json();
          const rawTables = json.items || [];
            console.log("Raw tables data:", rawTables);
    
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
          console.log("Transformed table data:", transformedData.length, transformedData);
          setPagination(prev => ({
            ...prev,
            pageNumber: json.pageNumber,
            totalPages: json.totalPages,
            totalCount: json.totalCount,
            pageSize: json.pageSize,
            hasNextPage: json.hasNextPage,
            hasPreviousPage: json.hasPreviousPage,
          }));                                                 
        } catch (err) {
          console.error("Error fetching tables:", err);
          setError("Failed to load tables");
        } finally {
          setLoading(false);
        }
      };
    
      const debouncedFetchTables = useCallback(debounce(fetchTables, 300), [pagination.pageNumber, pagination.pageSize, searchName, status]);
    

    
    // Fetch orders for a specific table
    const fetchOrdersForTable = async (tableId: string) => {
        if (loadingOrders[tableId]) return;
        if (orderData[tableId] && orderData[tableId].length > 0) {
            console.log(`Orders for table ${tableId} already loaded, skipping fetch.`);
            return;
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
    const deboundfetchOrdersForTable = useCallback(debounce(fetchOrdersForTable, 300), []);

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

  // Thêm helper functions
const getStatusValue = (status: string | number): number => {
    const strStatus = status.toString().toLowerCase();
    switch (strStatus) {
        case 'available':
        case '0':
            return 0;
        case 'occupied':  
        case '1':
            return 1;
        case 'reserved':
        case '2':
            return 2;
        default:
            return 0;
    }
};

const getNextStatus = (currentStatus: string | number): number => {
    const current = getStatusValue(currentStatus);
    // Toggle between Available (0) and Occupied (1)
    return current === 0 ? 1 : 0;
};

// Update handleToggleStatus
const handleToggleStatus = (table: TableItem) => {
    const currentStatus = table.status;
    const newStatus = getNextStatus(currentStatus);
    
    console.log(`Changing status from ${currentStatus} to ${newStatus}`);

    setPendingStatus(prev => ({
        ...prev,
        [table.id]: newStatus
    }));

    setSelectedTableForOrders(table);
    
    if (!orderData[table.id]) {
        fetchOrdersForTable(table.id);
    }
    
    setOrderDialogOpen(true);
};

// Update confirmStatusChange
const confirmStatusChange = async () => {
    if (!selectedTableForOrders) return;

    const { id: tableId, name: tableName } = selectedTableForOrders;
    const newStatus = pendingStatus[tableId];
    
    if (newStatus === undefined) {
        console.error("No pending status found");
        return;
    }
    
    console.log(`Confirming status change for table: ${tableName} -> ${newStatus}`);

    try {
        const response = await axios.put(`https://be-robo.zd-dev.xyz/api/Table/${tableId}`, { 
            status: newStatus 
        });
        
        console.log("API Response:", response.data);

        // Update local state with the new status
        setData(prev => prev.map(item =>
            item.id === tableId ? { ...item, status: newStatus.toString() } : item
        ));

        console.log(`Status updated successfully for table: ${tableName}`);
    } catch (err) {
        console.error("Failed to update table status:", err);
        // Có thể thêm toast notification ở đây
    } finally {
        setPendingStatus(prev => {
            const { [tableId]: _, ...rest } = prev;
            return rest;
        });
        setOrderDialogOpen(false);
        setSelectedTableForOrders(null);
    }
};
    

    const cancelStatusChange = () => {
        if (!selectedTableForOrders) return;

        const tableId = selectedTableForOrders.id;
        
        // Clear pending status
        setPendingStatus(prev => {
            const { [tableId]: _, ...rest } = prev;
            return rest;
        });

        // Close dialog
        setOrderDialogOpen(false);
        setSelectedTableForOrders(null);
    };
    // Thêm debounce hook


    const getStatusColor = (status: string | number) => {
        switch (status.toString()) {
            case 'Available':
            case '0':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Occupied':
            case '1':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Reserved':
            case '2':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    

    const getStatusText = (status: string | number) => {
        const strStatus = status.toString().toLowerCase(); // convert sang string và lowercase
        switch (strStatus) {
            case 'available':
            case '0':
                return 'Trống';
            case 'occupied':
            case '1':
                return 'Có Khách';
            case 'reserved':
            case '2':
                return 'Đã Đặt';
            default:
                return strStatus; // trả lại status gốc nếu không match
        }
    };
    const isAvailableStatus = (status: string | number): boolean => {
        const statusValue = getStatusValue(status);
        return statusValue === 0; // Available = 0
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND"
        }).format(amount);
      };
      const handlePageChange = (newPage: number) => {
        setPagination(prev => ({
            ...prev,
            pageNumber: newPage
        }));
    };

    const clearFilters = () => {
        setSearchName("");
        setStatus("");
        setPagination(prev => ({
            ...prev,
            pageNumber: 1
        }));
    };

    const hasActiveFilters = searchName || status;


    return (
        
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Bàn & Đơn Hàng</h1>
                    <p className="text-gray-600">Quản lý bàn nhà hàng, mã QR và đơn hàng</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">{pagination.totalCount}</div>
                        <div className="text-sm text-gray-600">Tổng Số Bàn</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-red-600">{data.filter(table => table.status === "Occupied").length}
                            
                            
                        </div>
                        <div className="text-sm text-gray-600">Bàn Có Khách</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(Object.values(orderData).flat().reduce((total, order) => total + order.totalPrice, 0))}
                        </div>
                        <div className="text-sm text-gray-600">Tổng Doanh Thu</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-2xl font-bold text-purple-600">{Object.values(orderData).flat().length}</div>
                        <div className="text-sm text-gray-600">Đơn Hàng Đang Xử Lý</div>
                    </div>
                </div>
                  {/* Search and Filter Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên bàn..."
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="lg:w-64">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="0">Trống</option>
                                    <option value="1">Có Khách</option>
                                    <option value="2">Đã Đặt</option>
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium"
                                >
                                    <X className="w-4 h-4" />
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>

                        {/* Active Filters Display */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                                <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
                                {searchName && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                        Tên: "{searchName}"
                                        <button onClick={() => setSearchName("")} className="hover:bg-blue-200 rounded-full p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {status && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                        Trạng thái: {getStatusText(status)}
                                        <button onClick={() => setStatus("")} className="hover:bg-green-200 rounded-full p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>


                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <h2 className="text-xl font-semibold text-white">Tổng Quan Các Bàn</h2>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Đang tải bàn...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi Tải Bàn</h3>
                                <p className="text-gray-500 mb-4">{error}</p>
                                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" 
                                 onClick={fetchTables}
                                >
                                    Thử Lại
                                </button>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Không Tìm Thấy Bàn</h3>
                                <p className="text-gray-500">Hiện tại không có bàn nào.</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                            Thông Tin Bàn
                                        </th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                            Trạng Thái
                                        </th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                            Mã QR
                                        </th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                            
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {data.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-200">
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
                                                                {orderData[row.id].reduce((acc, order) => acc + order.items.length, 0)} món
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
                                                    Xem QR
                                                </button>
                                            </td>
                                            
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <label className="inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={isAvailableStatus(row.status)}
                                                            onChange={() => handleToggleStatus(row)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 
                                                            peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 
                                                            peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                                                            peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 
                                                            after:start-[2px] after:bg-white after:border-gray-300 after:border 
                                                            after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 
                                                            peer-checked:bg-green-600 dark:peer-checked:bg-green-600">
                                                        </div>
                                                    </label>
                                                    <span className="text-xs text-gray-500">Thay Đổi Trạng Thái</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                        )}
                      <Pagination
                            pageNumber={pagination.pageNumber}
                            totalPages={pagination.totalPages}
                            hasNextPage={pagination.hasNextPage}
                            hasPreviousPage={pagination.hasPreviousPage}
                            onPageChange={(page) =>
                                setPagination((prev) => ({ ...prev, pageNumber: page }))
                            }
                            />
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl relative max-w-md w-full transform transition-all duration-300 scale-100">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Mã QR - {selectedTable?.name}</h2>
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
                                    <p className="text-gray-600 text-sm mb-1">Quét mã QR để đặt món</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTable?.status || '')}`}>
                                            {getStatusText(selectedTable?.status || '')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                In và đặt mã QR này trên bàn để khách hàng quét
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

            {/* Order Detail Dialog */}
            <OrderDetailDialog
                isOpen={orderDialogOpen}
                onClose={cancelStatusChange}
                table={selectedTableForOrders}
                orders={selectedTableForOrders ? (orderData[selectedTableForOrders.id] || []) : []}
                loading={selectedTableForOrders ? (loadingOrders[selectedTableForOrders.id] || false) : false}
                onConfirmStatusChange={confirmStatusChange}
                onCancelStatusChange={cancelStatusChange}
                newStatus={selectedTableForOrders ? (pendingStatus[selectedTableForOrders.id] || selectedTableForOrders.status) : ""}
            />
        </div>
    );
}