import React, {useRef, useState, useEffect} from 'react';
import {X, Download, CheckCircle} from 'lucide-react';
import {OrderRespontGetByID, InForProductOrderDetail} from "@/entites/respont/OrderRespont";
import {useRouter} from "next/navigation";
import {useTableContext} from "@/hooks/context/Context";
import html2pdf from 'html2pdf.js';

interface BillPDFPreviewProps {
    billData: OrderRespontGetByID;
    onClose: () => void;
    onComplete: () => void;
}

export const BillPDFPreview: React.FC<BillPDFPreviewProps> = ({billData, onClose, onComplete}) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [exportTime] = useState<Date>(new Date());
    const [isDownloading, setIsDownloading] = useState(false);
    const router = useRouter();
    const {setTable} = useTableContext();

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


    const formatDateTimeFull = (date: Date): string => {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(new Date(date));
    };

    const calculateItemTotal = (item: InForProductOrderDetail): number => {
        const toppingTotal = item.toppings.reduce((sum, topping) => sum + topping.price, 0);
        return item.price + toppingTotal;
    };

    const handleDownload = async () => {
        if (printRef.current && !isDownloading) {
            setIsDownloading(true);

            const element = printRef.current;
            const opt = {
                margin: 10,
                filename: `hoa-don-${billData.id.substring(0, 8)}-${Date.now()}.pdf`,
                image: {
                    type: 'jpeg' as const,  // Thêm 'as const'
                    quality: 0.98
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false
                },
                jsPDF: {
                    unit: 'mm' as const,           // Thêm 'as const'
                    format: 'a4' as const,         // Thêm 'as const'
                    orientation: 'portrait' as const  // Thêm 'as const'
                }
            };

            try {
                await html2pdf().set(opt).from(element).save();

                // Sau khi lưu xong, reset và chuyển trang
                setTimeout(() => {
                    setTable("", "", "");
                    router.push("/");
                }, 500);
            } catch (error) {
                console.error('Lỗi khi tạo PDF:', error);
                alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại!');
            } finally {
                setIsDownloading(false);
            }
        }
    };

    const handleComplete = () => {
        onComplete();
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[60] p-4">
                <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">

                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6"/>
                                <div>
                                    <h2 className="text-lg font-bold">Hóa Đơn - Bản In</h2>
                                    <p className="text-xs opacity-90">Xuất lúc: {formatDateTimeFull(exportTime)}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                disabled={isDownloading}
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(90vh-180px)] bg-gray-50 p-6">
                        <div ref={printRef} className="bg-white max-w-[210mm] mx-auto p-8 shadow-lg">
                            {/* Bill Header */}
                            <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">HÓA ĐƠN</h1>
                                <p className="text-sm text-gray-600">Số:
                                    #{billData.id.substring(0, 8).toUpperCase()}</p>
                                <p className="text-sm text-gray-600">Ngày
                                    đặt: {formatDateTime(billData.createdTime)}</p>
                                <p className="text-sm text-gray-600 font-semibold">Ngày
                                    xuất: {formatDateTimeFull(exportTime)}</p>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-2">NHÀ HÀNG </h2>
                                <p className="text-sm text-gray-700">Địa chỉ: </p>
                                <p className="text-sm text-gray-700">Điện thoại:</p>
                                <p className="text-sm text-gray-700">MST: </p>
                            </div>

                            {/* Customer Info */}
                            <div className="mb-6 bg-gray-50 p-4 rounded">
                                <p className="text-sm text-gray-700"><span
                                    className="font-semibold">Bàn:</span> {billData.tableName}</p>
                            </div>

                            {/* Items Table */}
                            <table className="w-full mb-6">
                                <thead>
                                <tr className="border-b-2 border-gray-800">
                                    <th className="text-left py-2 text-sm font-bold">STT</th>
                                    <th className="text-left py-2 text-sm font-bold">Tên món</th>
                                    <th className="text-right py-2 text-sm font-bold">Đơn giá</th>
                                    <th className="text-right py-2 text-sm font-bold">Thành tiền</th>
                                </tr>
                                </thead>
                                <tbody>
                                {billData.items.map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-3 text-sm">{index + 1}</td>
                                            <td className="py-3 text-sm">
                                                <div className="font-medium">{item.productName}</div>
                                                <div className="text-xs text-gray-600">Size: {item.sizeName}</div>
                                                {item.toppings.length > 0 && (
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        Topping: {item.toppings.map(t => t.name).join(', ')}
                                                    </div>
                                                )}
                                                {item.note && (
                                                    <div className="text-xs text-gray-600 italic mt-1">
                                                        Ghi chú: {item.note}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 text-sm text-right">{formatCurrency(item.price)}</td>
                                            <td className="py-3 text-sm text-right font-medium">
                                                {formatCurrency(calculateItemTotal(item))}
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>

                            {/* Summary */}
                            <div className="border-t-2 border-gray-800 pt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm">Tổng số món:</span>
                                    <span className="text-sm font-medium">{billData.items.length} món</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm">Tạm tính:</span>
                                    <span className="text-sm font-medium">{formatCurrency(billData.totalPrice)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm">Thuế VAT (0%):</span>
                                    <span className="text-sm font-medium">{formatCurrency(0)}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-gray-300">
                                    <span className="text-lg font-bold">TỔNG CỘNG:</span>
                                    <span className="text-xl font-bold">{formatCurrency(billData.totalPrice)}</span>
                                </div>
                            </div>

                            {/* Export Info */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500 text-center">
                                    Hóa đơn được xuất tự động lúc: {formatDateTimeFull(exportTime)}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-gray-300">
                                <p className="text-center text-sm text-gray-600 mb-4">
                                    Cảm ơn quý khách và hẹn gặp lại!
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-white border-t border-gray-200 flex gap-3">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4"/>
                            {isDownloading ? 'Đang tạo PDF...' : 'Tải PDF'}
                        </button>
                        <button
                            onClick={handleComplete}
                            disabled={isDownloading}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle className="w-4 h-4"/>
                            Tiếp tục đánh giá
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};