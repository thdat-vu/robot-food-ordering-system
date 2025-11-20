"use client";

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {XCircle} from "lucide-react";

import {SHOPPING_CARTS} from "@/key-store";
import {useTableContext} from "@/hooks/context/Context";
import {useGetTable} from "@/hooks/customHooks/useTableHooks";
import {Table} from "@/entites/respont/Table";
import {ErroTable} from "@/api/TableApi";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";

// Loading UI
const LoadingScreen = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
            <svg className="animate-spin h-10 w-10 text-red-600" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
            </svg>
            <p className="text-lg font-semibold text-gray-800">Đang tải dữ liệu...</p>
        </div>
    </div>
);

export default function CancelPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id") ?? ""; // Lấy id từ query

    const [loading, setLoading] = useState(true);
    const [localTableId, setLocalTableId] = useState("");

    const {tableId, setTable} = useTableContext();
    const {deviceToken} = useDeviceToken();
    const {run: runGetTable} = useGetTable();

    // Load table info
    useEffect(() => {
        if (!deviceToken || !id) {
            setLoading(false);
            return;
        }

        const fetchTable = async () => {
            setLoading(true);

            const res: Table | ErroTable = await runGetTable(id, deviceToken);
            console.log("API response:", res);

            if (res && "id" in res) {
                const t = res;

                setTable(t.id, t.status, t.name);
                setLocalTableId(t.id);

                if (tableId === t.id) {
                    localStorage.removeItem(SHOPPING_CARTS);
                }
            }

            setLoading(false);
        };

        fetchTable();
    }, [id, deviceToken]);

    // Back button
    const handleBack = () => {
        router.push(`/productions/order/${localTableId || id}`);
    };

    return (
        <>
            {loading && <LoadingScreen/>}

            <div
                className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 px-4 py-8">
                <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 w-full max-w-sm text-center">

                    <XCircle className="text-red-500 w-16 h-16 mx-auto mb-5"/>

                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                        Thanh toán thất bại!
                    </h1>

                    <p className="text-gray-600 text-sm sm:text-base mb-8 leading-relaxed">
                        Giao dịch đã bị hủy hoặc không thành công.
                        Vui lòng thử lại hoặc dùng phương thức khác.
                    </p>

                    <button
                        onClick={handleBack}
                        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl shadow-md transition"
                    >
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        </>
    );
}
