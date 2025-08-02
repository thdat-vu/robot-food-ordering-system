import React, {useEffect, useState, useCallback} from 'react';
import {Bell, Users, Clock, User , CreditCard,UserCheck} from 'lucide-react';
import {TableData} from "@/entites/moderator/FeedbackModole";
import {useGetAllFeedbackHome} from "@/hooks/moderator/useFeedbackHooks";
import ModeratorFeedbackFromTable from "@/app/moderator/ModeratorFeedbackFromTable";
import { Truck, DollarSign } from 'lucide-react';

const ModeratorScreen: React.FC = () => {
    const [data, setData] = useState<Record<string, TableData>>({});
    const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
    const [tablesWithBell, setTablesWithBell] = useState<Record<string, boolean>>({});
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [idTable, setIdTable] = useState<string>('');

    const {run} = useGetAllFeedbackHome();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);


    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await run();

                if (!res || typeof res !== 'object') {
                    console.warn('Invalid response from API:', res);
                    return;
                }

                const newData = res.data;

                if (!newData || typeof newData !== 'object') {
                    console.warn('Invalid data from API:', newData);
                    return;
                }

                setData(newData);

                setTablesWithBell(prev => {
                    const updated = {...prev};

                    Object.keys(newData).forEach(key => {
                        updated[key] = newData[key].counter > 0;
                    });

                    const validKeys = Object.keys(newData);
                    const filteredUpdated = Object.keys(updated).reduce((acc, key) => {
                        if (validKeys.includes(key)) {
                            acc[key] = updated[key];
                        }
                        return acc;
                    }, {} as Record<string, boolean>);

                    return filteredUpdated;
                });

            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
        const interval = setInterval(loadData, 500);
        return () => clearInterval(interval);
    }, []);


    const handleBellClick = useCallback((tableId: string) => {
        const tableData = data[tableId];
        if (tableData) {
            setSelectedTable(tableData);
            setOpenDialog(true);
        }
    }, [data]);

    const handleStatusChange = useCallback((tableId: string, allConfirmed: boolean) => {
        setTablesWithBell((prev) => ({
            ...prev,
            [tableId]: !allConfirmed,
        }));
    }, []);

    const handleCloseDialog = useCallback(() => {
        setOpenDialog(false);
        setSelectedTable(null);
    }, []);

    const handle = (id: string) => {
        setIdTable(id)
        setOpenDialog(true);
    }

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const totalNotifications = Object.values(data).reduce((sum, table) => sum + (table.counter || 0), 0);
    const activeTables = Object.values(data).filter(table => (table.counter || 0) > 0).length;
    const totalTables = Object.keys(data).length;

    if (isLoading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 flex items-center justify-center p-4">
                <div className="bg-white/95 backdrop-blur-lg p-12 rounded-3xl shadow-2xl border border-white/20">
                    <div className="text-center">
                        <div className="relative mb-8">
                            <div
                                className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-purple-500 mx-auto"></div>
                            <div
                                className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-purple-300 animate-pulse mx-auto"></div>
                        </div>
                        <h3 className="text-purple-800 text-2xl font-bold mb-2">Đang tải dữ liệu...</h3>
                        <p className="text-gray-600 text-lg">Vui lòng đợi trong giây lát</p>
                        <div className="mt-6 flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                                 style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                                 style={{animationDelay: '0.2s'}}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (totalTables === 0) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 flex items-center justify-center p-4">
                <div
                    className="bg-white/95 backdrop-blur-lg p-12 rounded-3xl shadow-2xl border border-white/20 text-center">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-purple-800 text-2xl font-bold mb-2">Chưa có dữ liệu bàn</h3>
                    <p className="text-gray-600 text-lg">Hệ thống sẽ tự động cập nhật khi có thông tin mới</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center bg-white/20 backdrop-blur-lg rounded-full px-8 py-4 mb-6 border border-white/30">
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <h1 className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                                BẢNG QUẢN LÝ MODERATOR
                            </h1>
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <p className="text-white/90 text-lg font-medium mb-4">
                        Theo dõi và xử lý thông báo từ khách hàng
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                        <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/30">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-white"/>
                                <div className="text-left">
                                    <div
                                        className="text-white font-mono text-lg font-bold">{formatTime(currentTime)}</div>
                                    <div className="text-white/80 text-xs">{formatDate(currentTime)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/30">
                            <div className="flex items-center space-x-2">
                                <Bell className="w-5 h-5 text-yellow-300"/>
                                <div className="text-left">
                                    <div className="text-white font-bold text-lg">{totalNotifications}</div>
                                    <div className="text-white/80 text-xs">Thông báo</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/30">
                            <div className="flex items-center space-x-2">
                                <Users className="w-5 h-5 text-green-300"/>
                                <div className="text-left">
                                    <div className="text-white font-bold text-lg">{activeTables}/{totalTables}</div>
                                    <div className="text-white/80 text-xs">Bàn cần xử lý</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                    {Object.entries(data)
                        .sort(([, a], [, b]) => a.tableName.localeCompare(b.tableName, 'vi'))
                        .map(([tableId, tableData]) => {
                            const hasNotification = (tableData.counter || 0) > 0;
                            const hasBell = tablesWithBell[tableId] || hasNotification;

                            return (
                                <div
                                    key={tableId}
                                    className={`group relative aspect-square rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 hover:rotate-1 ${
                                        hasNotification
                                            ? 'bg-gradient-to-br from-red-400 to-pink-500 shadow-lg shadow-red-500/30 animate-pulse'
                                            : 'bg-gradient-to-br from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400'
                                    } border-4 ${
                                        hasNotification
                                            ? 'border-red-300'
                                            : 'border-yellow-400'
                                    }`}
                                    onClick={() => handle(tableId)}
                                >

                                    <div className={`text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-center ${
                                        hasNotification ? 'text-white' : 'text-amber-800'
                                    }`}>
                                        {tableData.tableName}
                                    </div>

                                    <div className={`text-3xl md:text-4xl lg:text-5xl font-black ${
                                        hasNotification ? 'text-white' : 'text-gray-800'
                                    }`}>
                                        {tableData.counter || 0}
                                    </div>

                                    <div className={`text-sm md:text-lg font-bold text-center ${
                                        hasNotification ? 'text-white/90' : 'text-gray-700'
                                    }`}>
                                        thông báo

                                        
                                    </div>
                                     <div className="absolute bottom-2 left-2 flex items-center gap-1 text-black text-sm font-semibold">
                                            <UserCheck  size={14} />
                                            <span> {tableData.deliveredCount}/{tableData.totalItems} </span>
                                        </div>

                                        {/* Bottom-right: thanh toán */}
                                        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-black text-sm font-semibold">
                                            <CreditCard size={14} />
                                            <span> {tableData.paidCount}/{tableData.totalItems} </span>
                                        </div>
                                 
                                    {hasNotification && (
                                        <div
                                            className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg animate-bounce">
                                            !
                                        </div>
                                    )}

                                    {hasNotification && (
                                        <div
                                            className="absolute top-2 left-2 text-white font-semibold text-xs bg-red-600 px-2 py-1 rounded-full">
                                            Cần xử lý
                                        </div>
                                    )}

                                    <div
                                        className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                            );
                        })}
                </div>
            </div>

            <ModeratorFeedbackFromTable idTable={idTable} open={openDialog} onClose={() => setOpenDialog(false)}/>
        </div>
    );
};

export default ModeratorScreen;