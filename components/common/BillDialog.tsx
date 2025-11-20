import React, {useState, useMemo} from "react";
import {X, Receipt, Clock, CreditCard, CheckCircle, AlertCircle, FileText, Download} from "lucide-react";
import {OrderRespontGetByID, InForProductOrderDetail} from "@/entites/respont/OrderRespont";
import {IoIosArrowBack} from "react-icons/io";
import {BillPDFPreview} from "@/components/common/BillPDFPreview";
import {useRouter} from "next/navigation";
import {useTableContext} from "@/hooks/context/Context";
import {useCheckoutTable} from "@/hooks/customHooks/useTableHooks";

interface BillDialogProps extends OrderRespontGetByID {
    isOpen: boolean;
    onClose: () => void;
}

interface GroupedItem {
    key: string;
    items: InForProductOrderDetail[];
    count: number;
    representativeItem: InForProductOrderDetail;
}

export const BillDialog: React.FC<BillDialogProps> = ({
                                                          isOpen,
                                                          onClose,
                                                          id,
                                                          tableId,
                                                          tableName,
                                                          status,
                                                          paymentStatus,
                                                          totalPrice,
                                                          items,
                                                          createdTime
                                                      }) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [showPDFPreview, setShowPDFPreview] = useState<boolean>(false);
    const [openDialogFeedBack, setOpenDialogFeedBack] = useState<boolean>(false);
    const router = useRouter();
    const {setTable} = useTableContext();
    const {run} = useCheckoutTable();

    // Tạo key từ tất cả các thông tin của sản phẩm để so sánh
    const createKeyFromOrderDetail = (item: InForProductOrderDetail): string => {
        let toppingString = '';
        // Sort toppings để đảm bảo cùng toppings nhưng khác thứ tự vẫn giống nhau
        const sortedToppings = [...(item.toppings || [])].sort((a, b) => a.id.localeCompare(b.id));
        sortedToppings.forEach(topping => {
            toppingString += `${topping.id}-`;
        });
        return `${item.productId}_${item.productSizeId}_${toppingString}_${item.note || ''}`;
    };

    // Group items by exact match
    const groupedItems = useMemo((): GroupedItem[] => {
        if (!items) return [];

        const groups: { [key: string]: InForProductOrderDetail[] } = {};

        items.forEach(item => {
            const key = createKeyFromOrderDetail(item);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });

        return Object.entries(groups).map(([key, itemsInGroup]) => ({
            key,
            items: itemsInGroup,
            count: itemsInGroup.length,
            representativeItem: itemsInGroup[0]
        }));
    }, [items]);

    if (!isOpen) return null;

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (value: any): string => {
        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return "Không xác định"; // hoặc ""
        }

        return new Intl.DateTimeFormat("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(date);
    };


    // Format size name to short version
    const formatSizeName = (sizeName: string): string => {
        const sizeMap: Record<string, string> = {
            'large': 'L',
            'medium': 'M',
            'small': 'S',
            'extra large': 'XL',
            'extra small': 'XS',
            'lớn': 'L',
            'vừa': 'M',
            'nhỏ': 'S',
        };

        const lowerSize = sizeName.toLowerCase();
        return sizeMap[lowerSize] || sizeName.charAt(0).toUpperCase();
    };

    const calculateItemTotal = (item: InForProductOrderDetail): number => {
        const toppingTotal = item.toppings.reduce((sum, topping) => sum + topping.price, 0);
        return item.price + toppingTotal;
    };

    const handleConfirmBill = () => {
        handleCheckout();
        setShowConfirmDialog(true);
    };

    const handleProceedToPDF = () => {
        setShowConfirmDialog(false);
        setShowPDFPreview(true);
    };

    const handlePDFComplete = () => {
        setShowPDFPreview(false);
        setOpenDialogFeedBack(true);
    };

    const handleCheckout = async () => {
        (async () => {
            const res = await run(tableId);
        })()
    }

    const billData = {
        id,
        tableId,
        tableName,
        status,
        paymentStatus,
        totalPrice,
        items,
        createdTime
    };

    return (
        <>
            <div
                className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-0 sm:p-4">
                {/* Modal Container */}
                <div
                    className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">

                    {/* Header */}
                    <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 text-white sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <Receipt className="w-5 h-5"/>
                                </div>
                                <h2 className="text-lg font-bold">Các món đã gọi</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                aria-label="Đóng dialog"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-180px)]">
                        {/* Bill Info Section */}
                        <div
                            className="px-5 py-4 bg-gradient-to-br from-gray-50 to-blue-50/30 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Bàn</p>
                                    <p className="text-2xl font-bold text-gray-900">{tableName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">Thời gian</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatDateTime(createdTime)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="px-5 py-4 space-y-3">
                            {groupedItems.map((group, index) => {
                                const item = group.representativeItem;
                                const totalItemPrice = calculateItemTotal(item) * group.count;
                                const isSingle = group.count === 1;

                                return (
                                    <div
                                        key={group.key}
                                        className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:border-blue-200 transition-all relative"
                                    >
                                        {/* Quantity Badge for multiple items */}
                                        {!isSingle && (
                                            <div
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10">
                                                x{group.count}
                                            </div>
                                        )}

                                        {/* Item Header - Size cùng hàng với tên món */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0 pr-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-gray-900 text-base">
                                                        {item.productName}
                                                    </h4>
                                                    <span
                                                        className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                                                        {formatSizeName(item.sizeName)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xl font-bold text-blue-600">
                                                    {formatCurrency(totalItemPrice)}
                                                </p>
                                                {!isSingle && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {formatCurrency(calculateItemTotal(item))} x {group.count}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Toppings */}
                                        {item.toppings && item.toppings.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-xs text-gray-500 mb-1.5 font-medium">Topping:</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.toppings.map((topping) => (
                                                        <span
                                                            key={topping.id}
                                                            className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-medium"
                                                        >
                                                            {topping.name} <span
                                                            className="text-emerald-600">+{formatCurrency(topping.price)}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Note */}
                                        {item.note && (
                                            <div>
                                                <div
                                                    className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                                                    <p className="text-xs text-amber-800">
                                                        <span className="font-semibold">💡 Ghi chú:</span> {item.note}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Price breakdown if has toppings */}
                                        {item.toppings.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <p className="text-xs text-gray-500">
                                                    Giá món: <span
                                                    className="font-medium text-gray-700">{formatCurrency(item.price)}</span>
                                                    {!isSingle && (
                                                        <span className="text-gray-400"> × {group.count}</span>
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        <div
                            className="px-5 py-5 bg-gradient-to-br from-gray-50 to-blue-50/30 border-t-2 border-gray-200">
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 font-medium">Tổng số món:</span>
                                    <span className="font-semibold text-gray-900">{items.length} món</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 font-medium">Tạm tính:</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(totalPrice)}</span>
                                </div>

                                <div className="pt-2">
                                    <div
                                        className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4 shadow-lg">
                                        <span className="text-base font-bold">Tổng cộng:</span>
                                        <span className="text-2xl font-bold">
                                            {formatCurrency(totalPrice)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-4 bg-white border-t border-gray-200 sticky bottom-0">
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <IoIosArrowBack className="w-4 h-4"/>
                                Quay lại
                            </button>
                            <button
                                onClick={handleConfirmBill}
                                className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 text-center"
                            >
                                <FileText className="w-4 h-4 flex-shrink-0"/>
                                <span className="whitespace-nowrap">Xác nhận & Xuất bill</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Dialog */}
            {showConfirmDialog && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[60] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in">
                        <div className="p-6">
                            <div
                                className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                                <FileText className="w-8 h-8 text-blue-600"/>
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                                Xác nhận xuất hóa đơn
                            </h3>
                            <p className="text-center text-gray-600 mb-6 text-sm">
                                Bạn có chắc chắn muốn xuất hóa đơn cho<br/>
                                <span className="font-bold text-gray-900 text-base">{tableName}</span> không?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmDialog(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleProceedToPDF}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 active:scale-95 transition-all shadow-lg"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPDFPreview && (
                <BillPDFPreview
                    billData={billData}
                    onClose={() => {
                        setShowPDFPreview(false);
                        setTable("", "", "");
                        router.push("/")
                    }}
                    onComplete={handlePDFComplete}
                />
            )}
        </>
    );
};