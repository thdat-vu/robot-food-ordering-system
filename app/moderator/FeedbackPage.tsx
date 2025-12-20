"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Calendar,
  Search,
  RefreshCw,
  ArrowUpDown,
} from "lucide-react";

import { FeedbackgGetTableId } from "@/entites/moderator/FeedbackModole";
import { CheckSS } from "@/api/moderator/FeedbackApi";
import {
  useCheckSS,
  useGetFeedbackByIdtable,
} from "@/hooks/moderator/useFeedbackHooks";
import { useToastModerator } from "@/hooks/use-toast-moderator";
import { ToastContainer } from "@/components/moderator/ToastContainer";
import { FeedbackTable } from "@/components/moderator/FeedbackTable";

interface FeedbackPageProps {
  idTable: string;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ idTable }) => {
  const { toasts, addToast, removeToast } = useToastModerator();
  const [data, setData] = useState<FeedbackgGetTableId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "pending" | "processed"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeedbacks, setSelectedFeedbacks] = useState<Set<string>>(
    new Set()
  );
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [listId, setListId] = useState<string[]>([]);

  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [showSuggestions, setShowSuggestions] = useState<{
    [key: string]: boolean;
  }>({});

  const { run } = useGetFeedbackByIdtable();
  const { run: runCheck } = useCheckSS();

  // Gợi ý phản hồi
  const responseSuggestions = [
    "Nhân viên đã tiếp nhận và khắc phục sự cố",
    "Cảm ơn bạn đã góp ý. Chúng tôi đã ghi nhận và sẽ cải thiện chất lượng phục vụ.",
    "Xin lỗi vì sự bất tiện này. Chúng tôi sẽ khắc phục ngay lập tức.",
    "Cảm ơn bạn đã phản hồi. Chúng tôi đã chuyển thông tin cho bếp để cải thiện.",
    "Chúng tôi rất tiếc về trải nghiệm này và sẽ đảm bảo không tái diễn.",
    "Cảm ơn bạn đã chia sẻ. Ý kiến của bạn rất quan trọng với chúng tôi.",
    "Chúng tôi đã nhận được phản hồi và sẽ có biện pháp khắc phục phù hợp.",
    "Xin lỗi về chất lượng món ăn. Chúng tôi sẽ trao đổi với đầu bếp về vấn đề này.",
    "Cảm ơn bạn đã thông báo. Chúng tôi sẽ kiểm tra và cải thiện quy trình phục vụ.",
  ];

  useEffect(() => {
    if (idTable) {
      loadFeedbackData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idTable]);

  useEffect(() => {
    setListId(Array.from(selectedFeedbacks));
  }, [selectedFeedbacks]);

  // Set default response value cho từng complain
  useEffect(() => {
    if (data.length > 0) {
      const defaultResponses = data.reduce((acc, feedback) => {
        if (!responses[feedback.complainId]) {
          acc[feedback.complainId] =
            "Nhân viên đã tiếp nhận và khắc phục sự cố";
        }
        return acc;
      }, {} as { [key: string]: string });

      if (Object.keys(defaultResponses).length > 0) {
        setResponses((prev) => ({
          ...prev,
          ...defaultResponses,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const loadFeedbackData = async () => {
    setIsLoading(true);

    try {
      const res = await run(idTable);
      const list = res?.data ?? [];

      if (!list.length) {
        if (res.statusCodes && res.statusCodes !== "404" && res.message) {
          addToast(res.message, "error");
        }
        setData([]);
        setIsLoading(false);
        return;
      }

      const sorted = (list as FeedbackgGetTableId[]).sort((a, b) =>
        sortOrder === "newest"
          ? new Date(b.createData).getTime() - new Date(a.createData).getTime()
          : new Date(a.createData).getTime() - new Date(b.createData).getTime()
      );

      setData(sorted);
    } catch (error: any) {
      console.error("Error fetching feedback:", error);

      const errorMessage =
        error?.response?.data?.errorMessage ||
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi không xác định khi tải feedback";

      addToast(errorMessage, "error");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseChange = (feedbackId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [feedbackId]: value,
    }));
  };

  const handleSuggestionClick = (feedbackId: string, suggestion: string) => {
    setResponses((prev) => ({
      ...prev,
      [feedbackId]: suggestion,
    }));
    setShowSuggestions((prev) => ({
      ...prev,
      [feedbackId]: false,
    }));
  };

  const toggleSuggestions = (feedbackId: string) => {
    setShowSuggestions((prev) => ({
      ...prev,
      [feedbackId]: !prev[feedbackId],
    }));
  };

  const handleCheck = async () => {
    if (listId.length === 0) {
      addToast(
        "Vui lòng chọn ít nhất một phản hồi để đánh dấu đã xử lý",
        "error"
      );
      return;
    }

    setIsChecking(true);
    try {
      const responseText = "Nhân viên đã tiếp nhận và khắc phục sự cố";
      await runCheck(idTable, listId, responseText);

      setData((prevData) =>
        prevData.map((feedback) =>
          listId.includes(feedback.complainId)
            ? { ...feedback, isPending: false }
            : feedback
        )
      );

      setSelectedFeedbacks(new Set());
      setListId([]);

      addToast(`Đã đánh dấu ${listId.length} phản hồi là đã xử lý`, "success");
    } catch (error) {
      console.error("Error checking feedbacks:", error);
      addToast(
        "Có lỗi xảy ra khi đánh dấu phản hồi. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setIsChecking(false);
    }
  };

  const handleSingleCheck = async (feedbackId: string) => {
    setIsChecking(true);
    try {
      const responseText =
        responses[feedbackId] || "Nhân viên đã tiếp nhận và khắc phục sự cố";
      await runCheck(idTable, [feedbackId], responseText);

      setData((prevData) =>
        prevData.map((feedback) =>
          feedback.complainId === feedbackId
            ? { ...feedback, isPending: false }
            : feedback
        )
      );

      setSelectedFeedbacks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(feedbackId);
        return newSet;
      });

      addToast("Đã đánh dấu phản hồi là đã xử lý", "success");
    } catch (error) {
      console.error("Error checking single feedback:", error);
      addToast(
        "Có lỗi xảy ra khi đánh dấu phản hồi. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setIsChecking(false);
    }
  };

  const parseDate = (date: string | Date) => {
    if (date instanceof Date) return date;
    const [day, month, yearAndTime] = date.split("/");
    const [year, time] = yearAndTime.split(" ");
    return new Date(`${year}-${month}-${day}T${time}`);
  };

  const formatDate = (date: Date | string) => {
    const parsedDate = parseDate(date);
    if (isNaN(parsedDate.getTime())) return "Không xác định";

    return parsedDate.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (date: Date | string) => {
    const parsedDate = parseDate(date);
    if (isNaN(parsedDate.getTime())) return "Không xác định";

    const now = new Date();
    const diff = now.getTime() - parsedDate.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const clearSearch = () => setSearchQuery("");

  const highlightSearchText = (text: string, search: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.replace(
      regex,
      '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
    );
  };

  // 👉 Xác định feedback là "yêu cầu nhanh"
  // 👉 Xác định feedback là "yêu cầu nhanh" - PHIÊN BẢN ĐẦY ĐỦ
  const isQuickRequest = (feedback: FeedbackgGetTableId): boolean => {
    const text = (feedback.feedBack || "").toLowerCase();

    // Danh sách các danh từ chỉ đồ dùng/gia vị
    const quickItems = [
      "mắm",
      "tương",
      "xì dầu",
      "ớt",
      "muối",
      "tiêu",
      "chanh",
      "tỏi",
      "đá",
      "nước",
      "khăn",
      "giấy",
      "đũa",
      "muỗng",
      "thìa",
      "chén",
      "bát",
    ];

    // Danh sách các động từ chỉ yêu cầu
    const quickActions = ["thêm", "them", "cho", "xin", "lấy", "lay", "mang"];

    // Kiểm tra nếu có sự kết hợp giữa "Hành động" và "Đồ vật"
    const matchesAction = quickActions.some((action) => text.includes(action));
    const matchesItem = quickItems.some((item) => text.includes(item));

    // Đặc biệt ưu tiên các câu bắt đầu bằng "thêm" hoặc chứa từ khóa nhạy cảm
    return (
      (matchesAction && matchesItem) ||
      text.includes("gấp") ||
      text.includes("ngay")
    );
  };

  // 👉 Đã gửi yêu cầu nhanh trước đó chưa
  const hasSentQuickRequest = (feedback: FeedbackgGetTableId): boolean => {
    return (feedback.resolutionNote || "").includes("Yêu cầu nhanh:");
  };

  const filteredData = data.filter((item) => {
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "pending" && item.isPending) ||
      (selectedFilter === "processed" && !item.isPending);

    const matchesSearch =
      searchQuery === "" ||
      item.feedBack.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.complainId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.idTable.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingCount = data.filter((item) => item.isPending).length;
  const processedCount = data.filter((item) => !item.isPending).length;

  // 👉 Những phản hồi pending mà cho phép chọn (không phải yêu cầu nhanh)
  const selectablePendingIds = filteredData
    .filter((item) => item.isPending && !isQuickRequest(item))
    .map((item) => item.complainId);

  const handleCheckboxChange = (feedbackId: string, isPending: boolean) => {
    if (!isPending) return;

    setSelectedFeedbacks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(feedbackId)) newSet.delete(feedbackId);
      else newSet.add(feedbackId);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const pendingIds = filteredData
      .filter((item) => item.isPending && !isQuickRequest(item))
      .map((item) => item.complainId);

    if (selectedFeedbacks.size === pendingIds.length && pendingIds.length > 0) {
      setSelectedFeedbacks(new Set());
    } else {
      setSelectedFeedbacks(new Set(pendingIds));
    }
  };

  const handleSortToggle = () => {
    const newOrder = sortOrder === "newest" ? "oldest" : "newest";
    setSortOrder(newOrder);

    const sorted = [...data].sort((a, b) => {
      return newOrder === "newest"
        ? new Date(b.createData).getTime() - new Date(a.createData).getTime()
        : new Date(a.createData).getTime() - new Date(b.createData).getTime();
    });

    setData(sorted);
  };

  // ✅ handler gửi yêu cầu nhanh (giữ y như code bạn đang làm)
  const handleSendQuickRequest = async (
    feedbackId: string,
    feedbackText: string
  ) => {
    setIsChecking(true);
    try {
      await CheckSS(
        idTable,
        [feedbackId],
        `Yêu cầu nhanh: ${feedbackText}`,
        true
      );
      addToast("Đã gửi yêu cầu nhanh đến phục vụ", "success");
      await loadFeedbackData();
    } catch (e) {
      addToast("Không thể gửi yêu cầu nhanh", "error");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="h-full flex flex-col">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl px-4 py-3 text-center border-2 border-yellow-200">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-700">
                {pendingCount}
              </span>
            </div>
            <span className="text-sm text-yellow-700 font-medium">
              Chưa xử lý
            </span>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl px-4 py-3 text-center border-2 border-green-200">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-700">
                {processedCount}
              </span>
            </div>
            <span className="text-sm text-green-700 font-medium">Đã xử lý</span>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl px-4 py-3 text-center border-2 border-blue-200">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-700">
                {filteredData.length}
              </span>
            </div>
            <span className="text-sm text-blue-700 font-medium">Hiển thị</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div className="relative flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm phản hồi, món ăn hoặc ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base font-medium placeholder-gray-400 bg-white shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {searchQuery && (
                <div className="mt-2 text-sm text-gray-600">
                  Tìm thấy{" "}
                  <span className="font-semibold text-blue-600">
                    {filteredData.length}
                  </span>{" "}
                  kết quả cho "{searchQuery}"
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleSortToggle}
                className="flex items-center space-x-2 px-4 py-3 bg-white rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                <ArrowUpDown className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">
                  {sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}
                </span>
              </button>

              <div className="flex bg-white rounded-xl p-1 shadow-sm border-2 border-gray-200">
                {[
                  {
                    key: "all",
                    label: "Tất cả",
                    count: data.length,
                    color: "blue",
                  },
                  {
                    key: "pending",
                    label: "Chưa xử lý",
                    count: pendingCount,
                    color: "amber",
                  },
                  {
                    key: "processed",
                    label: "Đã xử lý",
                    count: processedCount,
                    color: "green",
                  },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedFilter(filter.key as any)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap text-sm ${
                      selectedFilter === filter.key
                        ? `bg-${filter.color}-500 text-white shadow-lg transform scale-105`
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {filter.label}
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        selectedFilter === filter.key
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={loadFeedbackData}
                disabled={isLoading}
                className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {selectedFeedbacks.size > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
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
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Đánh dấu đã xử lý</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Đang tải phản hồi...
                </h3>
                <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center p-16">
              <div className="text-center">
                <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-600 mb-3">
                  {searchQuery ? "Không tìm thấy kết quả" : "Không có phản hồi"}
                </h3>
                <p className="text-gray-500 text-lg">
                  {searchQuery
                    ? `Không có phản hồi nào chứa "${searchQuery}"`
                    : "Chưa có phản hồi nào cho bàn này"}
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
            <FeedbackTable
              rows={filteredData}
              searchQuery={searchQuery}
              selectedIds={selectedFeedbacks}
              selectablePendingIds={selectablePendingIds}
              isChecking={isChecking}
              responses={responses}
              showSuggestions={showSuggestions}
              responseSuggestions={responseSuggestions}
              isQuickRequest={isQuickRequest as any}
              hasSentQuickRequest={hasSentQuickRequest as any}
              formatDate={formatDate}
              getRelativeTime={getRelativeTime}
              highlightSearchText={highlightSearchText}
              onToggleSelect={handleCheckboxChange}
              onSelectAll={handleSelectAll}
              onResponseChange={handleResponseChange}
              onToggleSuggestions={toggleSuggestions}
              onSuggestionPick={handleSuggestionClick}
              onSingleCheck={handleSingleCheck}
              onSendQuickRequest={handleSendQuickRequest}
            />
          )}
        </div>
      </div>
    </>
  );
};
