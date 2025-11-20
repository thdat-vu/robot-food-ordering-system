'use client'
import React, {useEffect, useState, useRef} from 'react';
import {IoIosSend} from "react-icons/io";
import {IoIosArrowBack} from "react-icons/io";
import {useRouter} from "next/navigation";
import {DialogComponation} from "@/components/common/Dialog";
import {useTableContext} from "@/hooks/context/Context";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";
import {QRCodeCanvas} from "qrcode.react";
import {useGetTable, useShareTable} from "@/hooks/customHooks/useTableHooks";
import {BaseEntityResponse_v2} from "@/entites/BaseEntity";
import {Table} from "@/entites/respont/Table";
import {ErroTable} from "@/api/TableApi";

// Helper function để check xem object có phải là Table không
const checkTable = (obj: any): obj is Table => {
    return obj && typeof obj.id === "string" && typeof obj.name === "string";
}

export default function Profile({id}: { id: string }) {

    const router = useRouter();
    const {run: runShareTable} = useShareTable();
    const {run: runGetTable} = useGetTable();

    const [qr, setQr] = useState<string>();
    const [isCallStaffOpen, setIsCallStaffOpen] = useState<boolean>(false);
    const [isRatingOpen, setIsRatingOpen] = useState<boolean>(false);
    const [isPaymentOpen, setPaymentOpen] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(false);

    const {tableId, setTable} = useTableContext();
    const {deviceToken} = useDeviceToken();

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Handle share QR
    const handleLoading = async () => {
        if (deviceToken) {
            const res: BaseEntityResponse_v2<{
                qrCodeBase64: string;
                shareToken: string;
                shareUrl: string;
                expireAt: string;
            }> = await runShareTable(tableId, deviceToken);

            console.log("Share response:", res);

            if (res.statusCode == `200` || res.statusCode == "200") {
                setQr(res.data.shareUrl);
                setOpen(true);
                startTableChecking();
            }
        } else {
            console.log("deviceToken null");
        }
    }

    // Hàm kiểm tra bàn có còn thuộc về mình không
    const checkTableOwnership = async () => {
        if (!deviceToken || !id) return;

        try {
            setIsChecking(true);
            const res: Table | ErroTable = await runGetTable(id, deviceToken);

            console.log("Table check result:", res);

            if (!checkTable(res)) {
                const errorResult = res as ErroTable;
                console.log("Bàn không còn thuộc về bạn:", errorResult.message);

                stopTableChecking();

                // Redirect về home
                router.push(`/${tableId}`);
                return;
            }

            // Nếu là Table nhưng status không hợp lệ hoặc không khớp
            const tableResult = res as Table;
            if (tableResult.id !== id) {
                console.log("Table ID không khớp, redirect về home");
                stopTableChecking();
                router.push(`${tableResult.id}`);
                return;
            }

            // Cập nhật table context nếu cần
            setTable(tableResult.id, tableResult.status, tableResult.name);

        } catch (error) {
            console.error("Lỗi khi kiểm tra bàn:", error);
            // Có thể redirect về home nếu gặp lỗi
            stopTableChecking();
            router.push(`/`);
        } finally {
            setIsChecking(false);
        }
    };

    // Bắt đầu kiểm tra bàn liên tục (mỗi 3 giây)
    const startTableChecking = () => {
        // Clear interval cũ nếu có
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Check ngay lần đầu
        checkTableOwnership();

        // Sau đó check mỗi 3 giây
        intervalRef.current = setInterval(() => {
            checkTableOwnership();
        }, 3000); // 3 giây

        console.log("Bắt đầu kiểm tra bàn liên tục");
    };

    // Dừng kiểm tra bàn
    const stopTableChecking = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            console.log("Dừng kiểm tra bàn");
        }
    };

    // Effect để check khi id hoặc tableId thay đổi
    useEffect(() => {
        if (id && id !== tableId && deviceToken) {
            (async () => {
                try {
                    const res: Table | ErroTable = await runGetTable(id, deviceToken);

                    if (checkTable(res)) {
                        setTable(res.id, res.status, res.name);
                        console.log("Loaded table:", res);
                    } else {
                        const errorResult = res as ErroTable;
                        console.error("Error loading table:", errorResult.message);
                        router.push(`/${tableId}`);
                    }
                } catch (error) {
                    console.error("Fetch error:", error);
                    router.push(`/${tableId}`);
                }
            })();
        }
    }, [id, tableId, deviceToken, runGetTable, setTable, router]);

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            stopTableChecking();
        };
    }, []);

    // Cleanup khi đóng dialog share
    const handleCloseDialog = () => {
        setOpen(false);
        stopTableChecking();
        setQr(undefined);
    };

    return (
        <>
            <div className="h-full w-full mx-auto bg-gray-50 min-h-screen">

                <div className="flex justify-between items-center px-4 mt-3 mb-2">
                    <button
                        className="btn-circle items-center"
                        onClick={() => router.back()}
                    >
                        <IoIosArrowBack className="text-black text-4xl"/>
                    </button>

                    <button
                        className="btn-circle items-center"
                        onClick={() => handleLoading()}
                    >
                        <IoIosSend className="text-black text-4xl"/>
                    </button>
                </div>

                <div className="mx-4 mb-6 mt-2">
                    <div
                        className="bg-gradient-to-r from-orange-100 to-red-800 rounded-2xl p-4 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-red-800 mb-1">Thức ăn nhanh</h2>

                                <button
                                    className="bg-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                    XEM NGAY
                                </button>

                                <div className="flex items-center mt-3 space-x-2">
                                    <div
                                        className="w-6 h-6 bg-orange-300 rounded-full flex items-center justify-center">
                                        <span className="text-xs">🍔</span>
                                    </div>
                                    <div
                                        className="w-6 h-6 bg-orange-300 rounded-full flex items-center justify-center">
                                        <span className="text-xs">🍟</span>
                                    </div>
                                    <div
                                        className="w-6 h-6 bg-orange-300 rounded-full flex items-center justify-center">
                                        <span className="text-xs">🥤</span>
                                    </div>
                                    <span className="text-xs text-gray-600">+3</span>
                                </div>
                            </div>

                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center ml-4">
                                <div className="w-28 h-28 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-4xl">🍽️</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 mb-4">
                    {/* Your commented code here */}
                </div>

                <div className="mx-4 mb-6">
                    <div
                        className="bg-gradient-to-r from-green-400 to-green-600 rounded-2xl p-4 relative overflow-hidden">
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-1">RAU QUẢ</h2>
                                <h2 className="text-2xl font-bold text-black mb-2">THỰC ĐƠN MÓN ĂN</h2>
                                <p className="text-xs text-gray-700 mb-3">Thực đơn rau củ ngon và bổ dưỡng dành cho
                                    bạn</p>

                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-700">Giảm</span>
                                    <span
                                        className="bg-green-300 text-green-800 px-2 py-1 rounded text-xs font-semibold">50%</span>
                                </div>

                                <button
                                    className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-semibold mt-2">
                                    MÓN HAY GỢI Ý
                                </button>
                            </div>

                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center ml-4">
                                <div
                                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-3xl">🥗</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <span className="text-lg ml-4 text-gray-600 font-semibold">
                        Những món ăn thịnh hành.
                    </span>
                </div>

                <div className="px-4">
                    <div className="flex items-center space-x-3 mb-4 bg-white p-3 rounded-lg">
                        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🥤</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-600">Chọn một trong các loại size: S, M, L, XL. Thêm
                                topping:
                                Trân châu...</p>
                            <p className="text-yellow-600 font-bold text-sm">165.000 đ</p>
                        </div>
                        <button className="bg-yellow-400 text-white px-3 py-1 rounded-full text-xs">
                            Thêm
                        </button>
                    </div>

                    <div className="flex items-center space-x-3 mb-4 bg-white p-3 rounded-lg">
                        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🥤</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-600">Chọn một trong các loại size: S, M, L, XL. Thêm
                                topping:
                                Trân châu...</p>
                            <p className="text-yellow-600 font-bold text-sm">165.000 đ</p>
                        </div>
                        <button className="bg-yellow-400 text-white px-3 py-1 rounded-full text-xs">
                            Thêm
                        </button>
                    </div>
                </div>
            </div>

            {/* QR Code Share Dialog */}
            {qr && (
                <DialogComponation isOpen={open} onClose={handleCloseDialog}>
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-semibold text-center flex-1">
                                Chia sẻ QR code để chuyển đổi thiết bị gọi món
                            </span>
                            <div className="w-8"/>
                        </div>

                        {/* Hiển thị trạng thái đang kiểm tra */}
                        {isChecking && (
                            <div className="mb-4 p-2 bg-blue-100 rounded-lg flex items-center justify-center">
                                <div
                                    className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                <span className="text-sm text-blue-800">Đang kiểm tra bàn...</span>
                            </div>
                        )}

                        <div className="flex justify-center items-center mt-6">
                            <div className="border-2 border-gray-300 flex items-center justify-center rounded-lg p-2">
                                <QRCodeCanvas
                                    value={qr}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                        </div>

                        <p className="text-xs text-gray-600 text-center mt-4">
                            Khi thiết bị khác quét mã này, bạn sẽ tự động được chuyển về trang chủ
                        </p>
                    </div>
                </DialogComponation>
            )}
        </>
    );
}