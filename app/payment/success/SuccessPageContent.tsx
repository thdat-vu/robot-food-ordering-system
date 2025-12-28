"use client";

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {CheckCircle} from "lucide-react";

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
            <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"/>
            </svg>
            <p className="text-lg font-semibold text-gray-800">Đang tải dữ liệu...</p>
        </div>
    </div>
);

export default function SuccessPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const id = searchParams.get("id") ?? "";

    const [loading, setLoading] = useState(true);
    const [localTableId, setLocalTableId] = useState("");

    const {tableId, setTable} = useTableContext();
    const {deviceToken} = useDeviceToken();
    const {run: runGetTable} = useGetTable();

    useEffect(() => {
        if (!id || !deviceToken) {
            setLoading(false);
            return;
        }

        const loadTable = async () => {
            setLoading(true);

            const res: Table | ErroTable = await runGetTable(id, deviceToken);
            console.log("SUCCESS API:", res);

            if (res && "id" in res) {
                const t = res;
                setTable(t.id, t.status, t.name);
                setLocalTableId(t.id);

                setTimeout(() => {
                    localStorage.removeItem(SHOPPING_CARTS);
                }, 30);
            }

            setLoading(false);
        };

        loadTable();
    }, [id, deviceToken]);


    const handleGoHome = () => {
        router.push(`/productions/order/${localTableId || id}`);
    };

    return (
        <>
            {loading && <LoadingScreen/>}

            <div
                className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
                <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 w-full max-w-sm text-center">

                    <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-5"/>

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Thanh toán thành công!
                    </h1>

                    <p className="text-gray-600 mb-8">
                        Cảm ơn bạn đã hoàn tất thanh toán. Đơn hàng của bạn đang được xử lý.
                    </p>

                    <button
                        onClick={handleGoHome}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl shadow-md"
                    >
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        </>
    );
}
