"use client";

import {CheckCircle, Home, UtensilsCrossed} from "lucide-react";
import {useRouter} from "next/navigation";

export default function page() {
    const router = useRouter();

    const handleGoHome = () => {
        router.push("/");
    };


    return (
        <div
            className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 flex items-center justify-center px-5 py-8">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl p-8 text-center animate-fadeIn">

                {/* ✔ Icon Success */}
                <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-14 h-14 text-green-600"/>
                </div>

                {/* Tiêu đề */}
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Hoàn tất đơn hàng!
                </h1>

                {/* Mô tả */}
                <p className="text-gray-600 text-sm leading-relaxed mb-8">
                    Cảm ơn bạn đã thanh toán. Nhân viên đang chuẩn bị món cho bạn,
                    vui lòng chờ trong giây lát.
                </p>

                {/* Button */}
                <div className="space-y-3">

                    <button
                        onClick={handleGoHome}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-2xl border transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5"/>
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
}
