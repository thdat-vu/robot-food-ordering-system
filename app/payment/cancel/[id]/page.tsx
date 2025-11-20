"use client";
import {useParams, useRouter} from "next/navigation";
import {XCircle} from "lucide-react";
import {useEffect, useState} from "react";

export default function Page() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const [table, setTable] = useState<string>("");

    useEffect(() => {
        if (params?.id) {
            setTable(params.id);
        }
    }, [params?.id]);

    const handleBack = () => {
        if (!table) return;
        router.push(`/productions/order/${table}`);
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 px-4 py-8">
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 w-full max-w-sm text-center">

                <XCircle className="text-red-500 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5"/>

                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Thanh toán thất bại!
                </h1>

                <p className="text-gray-600 text-sm sm:text-base mb-8 leading-relaxed">
                    Rất tiếc, quá trình thanh toán không thành công. Vui lòng thử lại hoặc
                    kiểm tra phương thức thanh toán của bạn.
                </p>

                <button
                    onClick={handleBack}
                    disabled={!table}
                    className="w-full py-3 sm:py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Quay về trang chủ
                </button>
            </div>
        </div>
    );
}
