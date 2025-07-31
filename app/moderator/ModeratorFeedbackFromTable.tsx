"use client"
import React, {useEffect, useState} from "react";
import {
    X,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    Calendar,
    Filter,
    Search,
    RefreshCw,
    Trash2,
    ArrowUpDown
} from "lucide-react";
import {FeedbackgGetTableId} from "@/entites/moderator/FeedbackModole";
import {useCheckSS, useGetFeedbackByIdtable} from "@/hooks/moderator/useFeedbackHooks";

type Prop = {
    idTable: string;
    open: boolean;
    onClose: () => void;
    tableName?: string;
}

export const ModeratorFeedbackFromTable: React.FC<Prop> = ({
                                                               idTable,
                                                               onClose,
                                                               open,
                                                               tableName = `Bàn ${idTable}`
                                                           }) => {
    const [data, setData] = useState<FeedbackgGetTableId[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'processed'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFeedbacks, setSelectedFeedbacks] = useState<Set<string>>(new Set());
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [listId, setListId] = useState<string[]>([])

    const {run} = useGetFeedbackByIdtable();
    const {run: runCheck} = useCheckSS();

    useEffect(() => {
        if (open && idTable) {
            const timeout = setTimeout(() => {
                loadFeedbackData();
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [idTable, open]);

    useEffect(() => {
        setListId(Array.from(selectedFeedbacks));
    }, [selectedFeedbacks]);

    const handleCheck = async () => {
        if (listId.length === 0) {
            alert('Vui lòng chọn ít nhất một phản hồi để đánh dấu đã xử lý');
            return;
        }

        setIsChecking(true);
        try {
            await runCheck(idTable, listId);

            setData(prevData =>
                prevData.map(feedback =>
                    listId.includes(feedback.idFeedback)
                        ? {...feedback, isPeeding: false}
                        : feedback
                )
            );

            setSelectedFeedbacks(new Set());
            setListId([]);

            alert(`Đã đánh dấu ${listId.length} phản hồi là đã xử lý`);

        } catch (error) {
            console.error('Error checking feedbacks:', error);
            alert('Có lỗi xảy ra khi đánh dấu phản hồi. Vui lòng thử lại.');
        } finally {
            setIsChecking(false);
        }
    };

    const handleSingleCheck = async (feedbackId: string) => {
        setIsChecking(true);
        try {
            await runCheck(tableName, [feedbackId]);

            setData(prevData =>
                prevData.map(feedback =>
                    feedback.idFeedback === feedbackId
                        ? {...feedback, isPeeding: false}
                        : feedback
                )
            );

            setSelectedFeedbacks(prev => {
                const newSet = new Set(prev);
                newSet.delete(feedbackId);
                return newSet;
            });

            alert('Đã đánh dấu phản hồi là đã xử lý');

        } catch (error) {
            console.error('Error checking single feedback:', error);
            alert('Có lỗi xảy ra khi đánh dấu phản hồi. Vui lòng thử lại.');
        } finally {
            setIsChecking(false);
        }
    };


    const loadFeedbackData = async () => {
        setIsLoading(true);
        try {
            const res = await run(idTable);
            const sorted = (res.data as FeedbackgGetTableId[]).sort((a, b) => {
                return sortOrder === 'newest'
                    ? new Date(b.createData).getTime() - new Date(a.createData).getTime()
                    : new Date(a.createData).getTime() - new Date(b.createData).getTime();
            });
            setData(sorted);
        } catch (error) {
            console.error('Error fetching feedback:', error);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRelativeTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        return `${days} ngày trước`;
    };

    const filteredData = data.filter(item => {
        const matchesFilter = selectedFilter === 'all' ||
            (selectedFilter === 'pending' && item.isPeeding) ||
            (selectedFilter === 'processed' && !item.isPeeding);

        const matchesSearch = searchQuery === '' ||
            item.feedBack.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.idFeedback.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const pendingCount = data.filter(item => item.isPeeding).length;
    const processedCount = data.filter(item => !item.isPeeding).length;

    const handleCheckboxChange = (feedbackId: string, isPeeding: boolean) => {
        if (!isPeeding) return;

        setSelectedFeedbacks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(feedbackId)) {
                newSet.delete(feedbackId);
            } else {
                newSet.add(feedbackId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const pendingIds = filteredData.filter(item => item.isPeeding).map(item => item.idFeedback);
        if (selectedFeedbacks.size === pendingIds.length && pendingIds.length > 0) {
            setSelectedFeedbacks(new Set());
        } else {
            setSelectedFeedbacks(new Set(pendingIds));
        }
    };

    const handleSortToggle = () => {
        const newOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
        setSortOrder(newOrder);
        const sorted = [...data].sort((a, b) => {
            return newOrder === 'newest'
                ? new Date(b.createData).getTime() - new Date(a.createData).getTime()
                : new Date(a.createData).getTime() - new Date(b.createData).getTime();
        });
        setData(sorted);
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const highlightSearchText = (text: string, search: string) => {
        if (!search) return text;
        const regex = new RegExp(`(${search})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden border border-gray-200">
                <div
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative z-10">
                        <button
                            onClick={onClose}
                            className="absolute top-0 right-0 p-3 hover:bg-white/20 rounded-full transition-all duration-200 hover:rotate-90"
                        >
                            <X className="w-6 h-6"/>
                        </button>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-lg">
                                    <MessageSquare className="w-8 h-8"/>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold mb-1">Quản lý phản hồi khách hàng</h2>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-blue-100 text-sm"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div
                                className="bg-white/20 backdrop-blur-lg rounded-2xl px-4 py-3 text-center border border-white/30">
                                <div className="flex items-center justify-center space-x-2 mb-1">
                                    <AlertCircle className="w-5 h-5 text-yellow-300"/>
                                    <span className="text-2xl font-bold">{pendingCount}</span>
                                </div>
                                <span className="text-sm text-blue-100">Chưa xử lý</span>
                            </div>
                            <div
                                className="bg-white/20 backdrop-blur-lg rounded-2xl px-4 py-3 text-center border border-white/30">
                                <div className="flex items-center justify-center space-x-2 mb-1">
                                    <CheckCircle className="w-5 h-5 text-green-300"/>
                                    <span className="text-2xl font-bold">{processedCount}</span>
                                </div>
                                <span className="text-sm text-blue-100">Đã xử lý</span>
                            </div>
                            <div
                                className="bg-white/20 backdrop-blur-lg rounded-2xl px-4 py-3 text-center border border-white/30">
                                <div className="flex items-center justify-center space-x-2 mb-1">
                                    <MessageSquare className="w-5 h-5 text-blue-300"/>
                                    <span className="text-2xl font-bold">{filteredData.length}</span>
                                </div>
                                <span className="text-sm text-blue-100">Hiển thị</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                        <div className="relative flex-1 max-w-2xl">
                            <div className="relative">
                                <Search
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm trong nội dung phản hồi hoặc ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium placeholder-gray-400 bg-white shadow-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        <X className="w-5 h-5"/>
                                    </button>
                                )}
                            </div>
                            {searchQuery && (
                                <div className="mt-2 text-sm text-gray-600">
                                    Tìm thấy <span
                                    className="font-semibold text-blue-600">{filteredData.length}</span> kết quả cho
                                    "{searchQuery}"
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleSortToggle}
                                className="flex items-center space-x-2 px-4 py-3 bg-white rounded-2xl border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm"
                            >
                                <ArrowUpDown className="w-5 h-5 text-gray-500"/>
                                <span className="font-medium text-gray-700">
                                    {sortOrder === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
                                </span>
                            </button>

                            <div className="flex bg-white rounded-2xl p-1 shadow-sm border-2 border-gray-200">
                                {[
                                    {key: 'all', label: 'Tất cả', count: data.length, color: 'blue'},
                                    {key: 'pending', label: 'Chưa xử lý', count: pendingCount, color: 'amber'},
                                    {key: 'processed', label: 'Đã xử lý', count: processedCount, color: 'green'}
                                ].map(filter => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setSelectedFilter(filter.key as any)}
                                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                                            selectedFilter === filter.key
                                                ? `bg-${filter.color}-500 text-black shadow-lg transform scale-105`
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {filter.label}
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs  ${
                                            selectedFilter === filter.key
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {filter.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={loadFeedbackData}
                                disabled={isLoading}
                                className="p-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all duration-200 shadow-sm disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}/>
                            </button>
                        </div>
                    </div>

                    {selectedFeedbacks.size > 0 && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        {selectedFeedbacks.size}
                                    </div>
                                    <span className="text-blue-800 font-semibold">
                                        phản hồi đã được chọn
                                    </span>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleCheck}
                                        disabled={isChecking || selectedFeedbacks.size === 0}
                                        className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 flex items-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isChecking ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin"/>
                                                <span>Đang xử lý...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4"/>
                                                <span>Đánh dấu đã xử lý</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto max-h-[55vh] bg-gray-50">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-16">
                            <div className="text-center">
                                <div
                                    className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500 mx-auto mb-6"></div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Đang tải phản hồi...</h3>
                                <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
                            </div>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex items-center justify-center p-16">
                            <div className="text-center">
                                <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-6"/>
                                <h3 className="text-2xl font-semibold text-gray-600 mb-3">
                                    {searchQuery ? 'Không tìm thấy kết quả' : 'Không có phản hồi'}
                                </h3>
                                <p className="text-gray-500 text-lg">
                                    {searchQuery
                                        ? `Không có phản hồi nào chứa "${searchQuery}"`
                                        : 'Chưa có phản hồi nào cho bàn này'}
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            {filteredData.some(item => item.isPeeding) && (
                                <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                    <label className="flex items-center space-x-4 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedFeedbacks.size === filteredData.filter(item => item.isPeeding).length && filteredData.filter(item => item.isPeeding).length > 0}
                                            onChange={handleSelectAll}
                                            className="w-6 h-6 text-blue-600 rounded border-2 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="font-semibold text-gray-700 text-lg">
                                            Chọn tất cả phản hồi chưa xử lý trong danh sách này
                                            <span
                                                className="text-blue-600">({filteredData.filter(item => item.isPeeding).length})</span>
                                        </span>
                                    </label>
                                </div>
                            )}

                            <div className="space-y-6">
                                {filteredData.map((feedback, index) => (
                                    <div
                                        key={feedback.idFeedback}
                                        className={`border-2 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                                            feedback.isPeeding
                                                ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 hover:border-orange-300'
                                                : 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-300'
                                        } ${selectedFeedbacks.has(feedback.idFeedback) ? 'ring-4 ring-blue-400 shadow-lg' : ''}`}
                                    >
                                        <div className="flex items-start space-x-6">
                                            <div className="flex-shrink-0 pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFeedbacks.has(feedback.idFeedback)}
                                                    onChange={() => handleCheckboxChange(feedback.idFeedback, feedback.isPeeding)}
                                                    disabled={!feedback.isPeeding || isChecking}
                                                    className={`w-6 h-6 text-blue-600 rounded-lg border-2 border-gray-300 focus:ring-blue-500 transition-all duration-200 ${
                                                        !feedback.isPeeding || isChecking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                                                    }`}
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <span
                                                            className="bg-white px-4 py-2 rounded-full text-sm font-bold text-gray-600 shadow-sm">
                                                            #{index + 1}
                                                        </span>
                                                        <div
                                                            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                                                                feedback.isPeeding
                                                                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                                                    : 'bg-green-100 text-green-800 border border-green-200'
                                                            }`}>
                                                            {feedback.isPeeding ? (
                                                                <AlertCircle className="w-4 h-4"/>
                                                            ) : (
                                                                <CheckCircle className="w-4 h-4"/>
                                                            )}
                                                            <span>
                                                                {feedback.isPeeding ? 'Chưa xử lý' : 'Đã xử lý'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end space-y-1">
                                                        <div className="flex items-center space-x-2 text-gray-500">
                                                            <Calendar className="w-4 h-4"/>
                                                            <span className="text-sm font-medium">
                                                                {formatDate(feedback.createData)}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            {getRelativeTime(feedback.createData)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div
                                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
                                                    <p
                                                        className="text-gray-800 leading-relaxed text-lg"
                                                        dangerouslySetInnerHTML={{
                                                            __html: highlightSearchText(feedback.feedBack, searchQuery)
                                                        }}
                                                    />
                                                </div>

                                                {feedback.isPeeding && (
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => handleSingleCheck(feedback.idFeedback)}
                                                            disabled={isChecking}
                                                            className="px-6 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all duration-200 flex items-center space-x-3 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                        >
                                                            {isChecking ? (
                                                                <>
                                                                    <RefreshCw className="w-5 h-5 animate-spin"/>
                                                                    <span className="font-semibold">Đang xử lý...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-5 h-5"/>
                                                                    <span
                                                                        className="font-semibold">Đánh dấu đã xử lý</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white px-8 py-6 border-t-2 border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <p className="text-gray-600 font-medium">
                                Hiển thị <span className="font-bold text-blue-600">{filteredData.length}</span> / <span
                                className="font-bold">{data.length}</span> phản hồi
                            </p>
                            {searchQuery && (
                                <p className="text-sm text-gray-500">
                                    Kết quả tìm kiếm cho: "<span className="font-semibold">{searchQuery}</span>"
                                </p>
                            )}
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-100 transition-all duration-200 font-semibold"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={loadFeedbackData}
                                disabled={isLoading}
                                className="px-8 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all duration-200 font-semibold disabled:opacity-50 flex items-center space-x-2"
                            >
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}/>
                                <span>Làm mới</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModeratorFeedbackFromTable