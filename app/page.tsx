"use client";

import {useRouter, useParams} from "next/navigation";
import {Frame1} from "@/app/[id]/Frame1";
import {useState} from "react";
import {Frame2} from "@/app/[id]/Frame2";
import {Frame3} from "@/app/[id]/Frame3";
import {useTableContext} from "@/hooks/context/Context";
import {AlertTriangle, QrCode, X} from "lucide-react";

export default function Home() {
    const [step, setStep] = useState<number>(1);
    const [showWarningDialog, setShowWarningDialog] = useState<boolean>(false);
    const router = useRouter();
    const {tableId} = useTableContext();

    const handlChangPage = () => {
        router.push(`/productions/${tableId}`);
    };

    const nextStep = () => {
        setStep((prev) => prev + 1);
    };

    const skip = () => {
        if (tableId == "default_id") {
            setShowWarningDialog(true);
            return;
        } else
            handlChangPage();
    };

    const handleScanQR = () => {
        setShowWarningDialog(false);
        router.push("/");
    };


    return (
        <>
            <div className="flex justify-center items-center h-screen bg-gray-100">
                {step === 1 && <Frame1 onNext={nextStep} onSkip={skip}/>}
                {step === 2 && <Frame2 onNext={nextStep} onSkip={skip}/>}
                {step === 3 && <Frame3 onNext={nextStep} onSkip={skip}/>}
            </div>

            {showWarningDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[70] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in">
                        <div className="p-6">
                            {/* Icon */}
                            <div
                                className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl">
                                <AlertTriangle className="w-8 h-8 text-orange-600"/>
                            </div>

                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                                Vui lòng quét mã QR
                            </h3>

                            <p className="text-center text-gray-600 mb-6 text-sm leading-relaxed">
                                Bạn cần quét mã QR trên bàn để xác định vị trí trước khi đặt món.
                            </p>

                            <div className="flex items-center justify-center mb-6">
                                <div className="relative">
                                    <div
                                        className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                                        <QrCode className="w-12 h-12 text-blue-600"/>
                                    </div>
                                    <div
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                                        <span className="text-white text-xs font-bold">!</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setShowWarningDialog(false)}
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add animation CSS if not already in globals.css */}
            <style jsx global>{`
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
            `}</style>
        </>
    );
}