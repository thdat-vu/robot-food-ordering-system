import React, {useState, useMemo} from "react";
import {X, Receipt, Clock, CreditCard, CheckCircle, AlertCircle, FileText, Download} from "lucide-react";
import {OrderRespontGetByID, InForProductOrderDetail} from "@/entites/respont/OrderRespont";
import {IoIosArrowBack} from "react-icons/io";
import {BillPDFPreview} from "@/components/common/BillPDFPreview";
import {useRouter} from "next/navigation";
import {useTableContext} from "@/hooks/context/Context";
import {useCheckoutTable} from "@/hooks/customHooks/useTableHooks";
import {MobileDialogB2} from "@/components/common/MobileDialogB2";
import {BaseEntityResponse_v2} from "@/entites/BaseEntity";
import {CheckoutErrorResponse, CheckoutSuccessResponse} from "@/api/TableApi";

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
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const createKeyFromOrderDetail = (item: InForProductOrderDetail): string => {
        let toppingString = '';
        const sortedToppings = [...(item.toppings || [])].sort((a, b) => a.id.localeCompare(b.id));
        sortedToppings.forEach(topping => {
            toppingString += `${topping.id}-`;
        });
        return `${item.productId}_${item.productSizeId}_${toppingString}_${item.note || ''}`;
    };

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
        try {
            const res = await run(tableId);

            console.log("CHECKOUT RESPONSE:", res);

            if ("data" in res && res.statusCode === 200) {
                setShowConfirmDialog(true);
                return;
            }

            if ("errorMessage" in res && res.statusCode === 400) {
                setCheckoutError(res.errorMessage || "Không thể checkout");
                return;
            }

            setCheckoutError("Không thể checkout");
        } catch (error) {
            if (error as CheckoutErrorResponse) {
                const a = error as CheckoutErrorResponse;
                setCheckoutError(a.errorMessage || "Không thể checkout");
                return;
            }
        }
    };

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
                    className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">

                    {/* Header - Green gradient */}
                    <div
                        className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-5 text-white sticky top-0 z-10 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl shadow-inner">
                                    <Receipt className="w-6 h-6"/>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">Hóa đơn</h2>
                                    <p className="text-xs text-emerald-100 mt-0.5">Chi tiết đơn hàng</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2.5 hover:bg-white/20 rounded-xl transition-all active:scale-95"
                                aria-label="Đóng dialog"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-200px)]">
                        {/* Bill Info Section */}
                        <div className="px-6 py-5 bg-gradient-to-br from-emerald-50 to-green-50/50">
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-emerald-600 mb-1.5">Bàn số</p>
                                        <p className="text-3xl font-bold text-gray-900">{tableName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-emerald-600 mb-1.5">Thời gian</p>
                                        <p className="text-sm font-semibold text-gray-700">{createdTime.toString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="px-6 py-5 space-y-3 bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                                Danh sách món
                            </h3>
                            {groupedItems.map((group, index) => {
                                const item = group.representativeItem;
                                const totalItemPrice = calculateItemTotal(item) * group.count;
                                const isSingle = group.count === 1;

                                return (
                                    <div
                                        key={group.key}
                                        className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-emerald-200 transition-all relative"
                                    >
                                        {/* Quantity Badge */}
                                        {!isSingle && (
                                            <div
                                                className="absolute -top-2 -right-2 w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10 ring-4 ring-white">
                                                x{group.count}
                                            </div>
                                        )}

                                        {/* Item Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0 pr-3">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h4 className="font-bold text-gray-900 text-base leading-tight">
                                                        {item.productName}
                                                    </h4>
                                                    <span
                                                        className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                                                        {formatSizeName(item.sizeName)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xl font-bold text-emerald-600">
                                                    {formatCurrency(totalItemPrice)}
                                                </p>
                                                {!isSingle && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {formatCurrency(calculateItemTotal(item))} × {group.count}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Toppings */}
                                        {item.toppings && item.toppings.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-xs text-gray-600 mb-2 font-semibold">Topping:</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.toppings.map((topping) => (
                                                        <span
                                                            key={topping.id}
                                                            className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 font-medium"
                                                        >
                                                            {topping.name} <span
                                                            className="text-green-600 font-semibold">+{formatCurrency(topping.price)}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Note */}
                                        {item.note && (
                                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                                <p className="text-xs text-amber-800">
                                                    <span className="font-bold">💡 Ghi chú:</span> {item.note}
                                                </p>
                                            </div>
                                        )}

                                        {/* Price breakdown */}
                                        {item.toppings.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <p className="text-xs text-gray-500">
                                                    Giá món: <span
                                                    className="font-semibold text-gray-700">{formatCurrency(item.price)}</span>
                                                    {!isSingle &&
                                                        <span className="text-gray-400"> × {group.count}</span>}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        <div
                            className="px-6 py-5 bg-gradient-to-br from-emerald-50 to-green-50/50 border-t-2 border-emerald-100">
                            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 font-medium">Tổng số món:</span>
                                    <span className="font-bold text-gray-900">{items.length} món</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 font-medium">Tạm tính:</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(totalPrice)}</span>
                                </div>

                                <div className="pt-3 border-t border-gray-100">
                                    <div
                                        className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl p-5 shadow-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-bold">Tổng thanh toán</span>
                                            <span className="text-3xl font-bold tracking-tight">
                                                {formatCurrency(totalPrice)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 bg-white border-t border-gray-200 sticky bottom-0 shadow-lg">
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-5 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2 border border-gray-200"
                            >
                                <IoIosArrowBack className="w-4 h-4"/>
                                Quay lại
                            </button>
                            <button
                                onClick={handleConfirmBill}
                                className="flex-1 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-green-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4 flex-shrink-0"/>
                                <span className="whitespace-nowrap">Xác nhận hoá đơn</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[60] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-scale-in overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6">
                            <div
                                className="flex items-center justify-center w-16 h-16 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl">
                                <FileText className="w-8 h-8 text-white"/>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                                Xác nhận xuất hóa đơn
                            </h3>
                            <p className="text-center text-gray-600 mb-6">
                                Bạn có chắc chắn muốn xuất hóa đơn cho<br/>
                                <span className="font-bold text-emerald-600 text-lg">{tableName}</span> không?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmDialog(false)}
                                    className="flex-1 px-5 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 active:scale-95 transition-all border border-gray-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleProceedToPDF}
                                    className="flex-1 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-green-700 active:scale-95 transition-all shadow-lg"
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
                        setTimeout(() => {
                            router.replace("/end");
                        }, 50);
                    }}
                    onComplete={() => {
                        handlePDFComplete();
                        setTimeout(() => {
                            router.replace("/end");
                        }, 50);
                    }}
                />
            )}

            {checkoutError && (
                <MobileDialogB2
                    isOpen={true}
                    onClose={() => setCheckoutError(null)}
                    leftConten="Đã hiểu"
                    rigttConten=""
                    leftClick={() => setCheckoutError(null)}
                    rightClick={() => {
                    }}
                    status="warning"
                    message={checkoutError}
                />
            )}
        </>
    );
};