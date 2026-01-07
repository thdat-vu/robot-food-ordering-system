"use client";

import React, {useRef, useState} from 'react';
import {X, Download, CheckCircle} from 'lucide-react';
import {OrderRespontGetByID, InForProductOrderDetail} from "@/entites/respont/OrderRespont";
import {useRouter} from "next/navigation";
import {useTableContext} from "@/hooks/context/Context";
import html2pdf from 'html2pdf.js';
import {PhoneDialog} from "@/components/common/PhoneDialog";

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
    const [open, setOpen] = useState<boolean>(false);
    const [hideBillPreview, setHideBillPreview] = useState<boolean>(false);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (value: any): string => {
        const date = new Date(value);
        if (isNaN(date.getTime())) return "Không xác định";
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
        }).format(date);
    };

    const calculateItemTotal = (item: InForProductOrderDetail): number => {
        const toppingTotal = item.toppings.reduce((sum, topping) => sum + topping.price, 0);
        return item.price + toppingTotal;
    };


    const groupedItems = Object.values(
        billData.items.reduce((acc: any, item) => {
            const key = [
                item.productName,
                item.sizeName,
                item.toppings.map(t => t.name).sort().join(','),
                item.note || ''
            ].join('|');

            if (!acc[key]) {
                acc[key] = {
                    ...item,
                    quantity: 1,
                    total: calculateItemTotal(item)
                };
            } else {
                acc[key].quantity += 1;
                acc[key].total += calculateItemTotal(item);
            }

            return acc;
        }, {})
    );

    const downloadPDF = async () => {
        if (!printRef.current || isDownloading) return;

        setIsDownloading(true);

        const opt = {
            margin: 10,
            filename: `hoa-don-${billData.id.substring(0, 8)}-${Date.now()}.pdf`,
            image: {type: 'jpeg' as const, quality: 0.98},
            html2canvas: {scale: 2, useCORS: true},
            jsPDF: {
                unit: 'mm' as const,
                format: 'a4' as const,
                orientation: 'portrait' as const
            }
        };

        try {
            await html2pdf().set(opt).from(printRef.current).save();
        } catch (e) {
            alert("Lỗi khi tạo PDF");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownload = async () => {
        await downloadPDF();
        setTimeout(() => {
            setTable("", "", "");
            router.replace("/end");
        }, 500);
    };


    const handleEarnPoints = async () => {
        // await downloadPDF();
        setTimeout(() => {
            setHideBillPreview(true);
            setOpen(true);
            setIsDownloading(false);
        }, 500);

    };

    const handlePhoneDialogClose = () => {
        setOpen(false);
        setHideBillPreview(false);
        onClose();
    };

    const handlePhoneDialogComplete = () => {
        setOpen(false);
        setHideBillPreview(false);
        onComplete();
    };

    return (
        <>
            {/* BillPDFPreview - Ẩn khi mở PhoneDialog */}
            {!hideBillPreview && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[60] p-4">
                    <div
                        className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6"/>
                                    <div>
                                        <h2 className="text-lg font-bold">Hóa Đơn - Bản In</h2>
                                        <p className="text-xs opacity-90">Xuất lúc: {formatDateTimeFull(exportTime)}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} disabled={isDownloading}
                                        className="p-2 hover:bg-white/20 rounded-full">
                                    <X className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[calc(90vh-180px)] bg-gray-50 p-6">
                            <div ref={printRef} className="bg-white max-w-[210mm] mx-auto p-8 shadow-lg">

                                {/* BILL HEADER */}
                                <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">HÓA ĐƠN</h1>
                                    <p className="text-sm text-gray-600">Số:
                                        #{billData.id.substring(0, 8).toUpperCase()}</p>
                                    <p className="text-sm text-gray-600">Ngày
                                        đặt: {formatDateTime(billData.createdTime)}</p>
                                    <p className="text-sm font-semibold text-gray-600">Ngày
                                        xuất: {formatDateTimeFull(exportTime)}</p>
                                </div>

                                {/* CUSTOMER INFO */}
                                <div className="mb-6 bg-gray-50 p-4 rounded">
                                    <p className="text-sm text-gray-700"><span
                                        className="font-semibold"></span> {billData.tableName}</p>
                                </div>

                                {/* ====================== */}
                                {/* ⭐ NEW BILL FORMAT     */}
                                {/* ====================== */}
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold mb-3">Danh sách món</h2>

                                    <table className="w-full">
                                        <thead>
                                        <tr className="border-b-2 border-gray-800">
                                            <th className="text-left py-2 text-sm font-bold">Tên món</th>
                                            <th className="text-center py-2 text-sm font-bold">SL</th>
                                            <th className="text-right py-2 text-sm font-bold">Tổng tiền</th>
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {groupedItems.map((g: any, index: number) => (
                                            <tr key={index} className="border-b border-gray-200">
                                                <td className="py-3 text-sm">
                                                    <div className="font-medium">{g.productName}</div>
                                                    <div className="text-xs text-gray-600">Size: {g.sizeName}</div>

                                                    {g.toppings.length > 0 && (
                                                        <div className="text-xs text-gray-600">
                                                            Topping: {g.toppings.map((t: any) => t.name).join(', ')}
                                                        </div>
                                                    )}

                                                    {g.note && (
                                                        <div className="text-xs text-gray-600 italic">
                                                            Ghi chú: {g.note}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3 text-center text-sm font-semibold">
                                                    {g.quantity}
                                                </td>

                                                <td className="py-3 text-right text-sm font-bold text-gray-900">
                                                    {formatCurrency(g.total)}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* SUMARY */}
                                <div className="border-t-2 border-gray-800 pt-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm">Tổng số món:</span>
                                        <span className="text-sm font-medium">{billData.items.length} món</span>
                                    </div>

                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm">Tổng tiền:</span>
                                        <span
                                            className="text-sm font-medium">{formatCurrency(billData.totalPrice)}</span>
                                    </div>

                                    <div className="flex justify-between pt-3 border-t border-gray-300">
                                        <span className="text-lg font-bold">TỔNG CỘNG:</span>
                                        <span className="text-xl font-bold">{formatCurrency(billData.totalPrice)}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 text-center">
                                        Hóa đơn được xuất lúc: {formatDateTimeFull(exportTime)}
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-300">
                                    <p className="text-center text-sm text-gray-600">
                                        Cảm ơn quý khách và hẹn gặp lại!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="px-6 py-4 bg-white border-t flex gap-3">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Download className="w-4 h-4"/>
                                {isDownloading ? "Đang tạo PDF..." : "Tải PDF"}
                            </button>

                            <button
                                onClick={() => router.replace("/end")}
                                disabled={open}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <CheckCircle className="w-4 h-4"/>
                                Bỏ qua
                            </button>

                            {/*<button*/}
                            {/*    onClick={handleEarnPoints}*/}
                            {/*    disabled={open}*/}
                            {/*    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50"*/}
                            {/*>*/}
                            {/*    <CheckCircle className="w-4 h-4"/>*/}
                            {/*    {isDownloading ? "Đang xử lý..." : "Tích điểm"}*/}
                            {/*</button>*/}
                        </div>

                    </div>
                </div>
            )}

            {/* PhoneDialog */}
            {/*<PhoneDialog open={open} onClose={handlePhoneDialogClose} onCamplet={handlePhoneDialogComplete}/>*/}
        </>
    );
};