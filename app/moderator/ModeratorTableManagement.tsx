<<<<<<< HEAD
import React, {useEffect, useState} from "react";

interface TableItem {
    id: string;
    name: string;
    status: string;
    qrCode: string;
=======
import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Clock, DollarSign, Users, Eye, AlertCircle, CheckCircle, ChevronLeft, X, Search, Menu } from 'lucide-react';
import OrderDetailDialog, { OrderData, TableItem } from "./OrderDetailDialog";

import Pagination from "@/lib/utils/Pagination";
import axios from 'axios';
import * as signalR from "@microsoft/signalr";
import { useToastModerator } from "@/hooks/use-toast-moderator";
import { useSignalR } from "@/hooks/useSignalR";

interface Paginations {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
>>>>>>> parent of 5ccdfb8 ( update moderater page)
}

export default function ModeratorTableManagement() {
    const [data, setData] = useState<TableItem[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [selectedQr, setSelectedQr] = useState<string>("");
    const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
<<<<<<< HEAD
=======
    
    // Order & Table States
    const [orderData, setOrderData] = useState<{ [key: string]: OrderData[] }>({});
    const [loadingOrders, setLoadingOrders] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const [pendingStatus, setPendingStatus] = useState<{ [key: string]: number }>({});

    // Order Dialog States
    const [orderDialogOpen, setOrderDialogOpen] = useState<boolean>(false);
    const [selectedTableForOrders, setSelectedTableForOrders] = useState<TableItem | null>(null);
    const [searchName, setSearchName] = useState("");
    const [status, setStatus] = useState("");
    
    // Mobile view state
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    const [pagination, setPagination] = useState<Paginations>({
        pageNumber: 1,
        pageSize: 20,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    });
>>>>>>> parent of 5ccdfb8 ( update moderater page)

    useEffect(() => {
        fetch("https://be-robo.zd-dev.xyz/api/table")
            .then((res) => res.json())
            .then((json) => setData(json.items))
            .catch((err) => console.error(err));
    }, []);

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
      
        // UI update trước cho mượt
        setData((prevData) =>
          prevData.map((item) =>
            item.id === table.id ? { ...item, status: newStatus } : item
          )
        );
      
        // Backend update (chỉ gửi id + status)
        fetch(`https://be-robo.zd-dev.xyz/api/Table/${table.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: table.id,
            status: Number(newStatus),
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
          })
          .then((json) => console.log("Status updated:", json))
          .catch((err) => {
            console.error("Error updating status:", err);
            // rollback nếu fail
            setData((prevData) =>
              prevData.map((item) =>
                item.id === table.id ? { ...item, status: currentStatus } : item
              )
            );
          });
      };
      
    

<<<<<<< HEAD
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available':
            case '0':
=======
    // Helper functions
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
        return current === 0 ? 1 : 0;
    };

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

            setData(prev => prev.map(item =>
                item.id === tableId ? { ...item, status: newStatus.toString() } : item
            ));

            console.log(`Status updated successfully for table: ${tableName}`);
        } catch (err) {
            console.error("Failed to update table status:", err);
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
        
        setPendingStatus(prev => {
            const { [tableId]: _, ...rest } = prev;
            return rest;
        });

        setOrderDialogOpen(false);
        setSelectedTableForOrders(null);
    };

    const getStatusColor = (status: string | number) => {
        switch (status.toString()) {
            case 'Available':
            case '0':
>>>>>>> parent of 5ccdfb8 ( update moderater page)
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Table Management</h1>
                    <p className="text-gray-600">Manage restaurant tables and QR codes</p>
                </div>

<<<<<<< HEAD
                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <h2 className="text-xl font-semibold text-white">Tables Overview</h2>
=======
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

    // SignalR connection
    // useSignalR({
    //     url: "https://be-robo.zd-dev.xyz/orderNotificationHub",
    //     groupName: "Moderators",
    //     hubMethods: {
    //         OrderItemStatusChanged: (notification) => {
    //             console.log("📩 Moderator nhận:", notification);
    //             addToast(
    //                 `Món ${notification.productName} (${notification.newStatus})`,
    //                 "System notification"
    //             );
    //         }
    //     }
    // });

    // Mobile Card Component
    const TableCard = ({ table }: { table: TableItem }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {table.name.charAt(table.name.length - 1)}
>>>>>>> parent of 5ccdfb8 ( update moderater page)
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                    Table Name
                                </th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                    QR Code
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {data.map((row, index) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            <div
                                                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                                {row.name.charAt(0)}
                                            </div>
                                            <span className="text-gray-900 font-medium">{row.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                      <span 
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(row.status)}`}>
                        {getStatusText(row.status)}
                      </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <button
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                            onClick={() => handleOpen(row)}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                                            </svg>
                                            View QR
                                        </button>
                                    </td>
                                    <td>
                                            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                                            <label className="inline-flex items-center me-5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={row.status === "0"}   // 0 = Available
                                                onChange={() => handleToggleStatus(row)}
                                                className="sr-only peer"
                                            />
                                            <div
                                                className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700
                                                        peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800
                                                        peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                                                        peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5
                                                        after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full
                                                        after:h-5 after:w-5 after:transition-all dark:border-gray-600
                                                        peer-checked:bg-green-600 dark:peer-checked:bg-green-600">
                                            </div>
                                            <span
                                                className={`ms-3 text-sm font-medium border px-2 py-1 rounded-full ${getStatusColor(row.status)}`}
                                            >
                                                {getStatusText(row.status)}
                                            </span>
                                            </label>

                                        </div>
                                        </td>



                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {data.length === 0 && (
                            <div className="text-center py-12">
                                <div
                                    className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No tables found</h3>
                                <p className="text-gray-500">Loading table data...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

<<<<<<< HEAD
            {/* Enhanced Modal */}
            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div
                        className="bg-white rounded-2xl shadow-2xl relative max-w-md w-full transform transition-all duration-300 scale-100">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">QR Code - {selectedTable?.name}</h2>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
                                onClick={handleClose}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
=======
            {/* Card Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm"
                    onClick={() => handleOpen(table)}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem QR
                </button>
                
                <div className="flex-1 flex flex-col items-center">
                    <label className="inline-flex items-center cursor-pointer mb-1">
                        <input
                            type="checkbox"
                            checked={isAvailableStatus(table.status)}
                            onChange={() => handleToggleStatus(table)}
                            className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 
                            peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 
                            peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                            peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 
                            after:start-[2px] after:bg-white after:border-gray-300 after:border 
                            after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 
                            peer-checked:bg-green-600 dark:peer-checked:bg-green-600">
>>>>>>> parent of 5ccdfb8 ( update moderater page)
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="bg-gray-50 rounded-xl p-6 mb-4 text-center">
                                <img
                                    src={selectedQr}
                                    alt="QR Code"
                                    className="w-full h-64 object-contain rounded-lg mb-4"
                                />
                                {/* Table Info */}
                                <div className="bg-white rounded-lg p-4 shadow-sm border">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedTable?.name}</h3>
                                    <p className="text-gray-600 text-sm mb-1">Scan QR code to order</p>
                                    <div className="flex items-center justify-center gap-2">
                    <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTable?.status || '')}`}>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                                </svg>
                                Print QR Code
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
<<<<<<< HEAD
=======

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 lg:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Quản Lý Bàn & Đơn Hàng
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Quản lý bàn nhà hàng, mã QR và đơn hàng
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                            {pagination.totalCount}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Tổng Số Bàn</div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-xl sm:text-2xl font-bold text-red-600">
                            {data.filter(table => table.status === "Occupied").length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Bàn Có Khách</div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-lg sm:text-2xl font-bold text-green-600">
                            {formatCurrency(
                                Object.values(orderData)
                                    .flat()
                                    .filter(order => order.paymentStatus === "Paid")
                                    .reduce((total, order) => total + order.totalPrice, 0)
                            )}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Tổng Doanh Thu</div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-xl sm:text-2xl font-bold text-purple-600">
                            {Object.values(orderData).flat().length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Đơn Hàng Đang Xử Lý</div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="p-4">
                        <div className="flex flex-col gap-4">
                            {/* Search Input */}
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

                            {/* Filter Row */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                {/* Status Filter */}
                                <div className="flex-1 sm:max-w-xs">
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

                                {/* View Mode Toggle (Desktop/Tablet only) */}
                                <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                                            viewMode === 'grid' 
                                                ? 'bg-white text-gray-900 shadow-sm' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                                            viewMode === 'table' 
                                                ? 'bg-white text-gray-900 shadow-sm' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        Table
                                    </button>
                                </div>

                                {/* Clear Filters Button */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                    >
                                        <X className="w-4 h-4" />
                                        <span className="hidden sm:inline">Xóa bộ lọc</span>
                                        <span className="sm:hidden">Xóa</span>
                                    </button>
                                )}
                            </div>

                            {/* Active Filters Display */}
                            {hasActiveFilters && (
                                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                                    <span className="text-sm text-gray-600">Bộ lọc:</span>
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
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <h2 className="text-lg sm:text-xl font-semibold text-white">Tổng Quan Các Bàn</h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải bàn...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi Tải Bàn</h3>
                            <p className="text-gray-500 mb-4">{error}</p>
                            <button 
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" 
                                onClick={fetchTables}
                            >
                                Thử Lại
                            </button>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Không Tìm Thấy Bàn</h3>
                            <p className="text-gray-500">Hiện tại không có bàn nào.</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile/Tablet Grid View */}
                            <div className={`${viewMode === 'table' ? 'hidden md:hidden' : 'block md:hidden'} p-4`}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {data.map((table) => (
                                        <TableCard key={table.id} table={table} />
                                    ))}
                                </div>
                            </div>

                            {/* Desktop/Large Tablet Table View */}
                            <div className={`${viewMode === 'grid' ? 'hidden md:block' : 'hidden md:block'} overflow-x-auto`}>
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
                                                Thao Tác
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
                            </div>

                            {/* Pagination */}
                            <div className="p-4 border-t border-gray-200">
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
                        </>
                    )}
                </div>
            </div>

            {/* QR Code Modal - Responsive */}
            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl relative w-full max-w-md transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                Mã QR - {selectedTable?.name}
                            </h2>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
                                onClick={handleClose}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-6">
                            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 text-center">
                                <img
                                    src={selectedQr}
                                    alt="QR Code"
                                    className="w-full max-w-64 h-64 object-contain rounded-lg mb-4 mx-auto"
                                />
                                <div className="bg-white rounded-lg p-4 shadow-sm border">
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                                        {selectedTable?.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">Quét mã QR để đặt món</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTable?.status || '')}`}>
                                            {getStatusText(selectedTable?.status || '')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 text-center px-2">
                                In và đặt mã QR này trên bàn để khách hàng quét
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={handleClose}
                                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                                </svg>
                                In QR Code
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
>>>>>>> parent of 5ccdfb8 ( update moderater page)
}