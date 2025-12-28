import React, {useState} from "react";
import {useTableContext} from "@/hooks/context/Context";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";
import {useAddPoind} from "@/hooks/customHooks/useTableHooks";
import {BaseEntityResponse_v2} from "@/entites/BaseEntity";

type Props = {
    open: boolean,
    onClose: () => void,
    onCamplet: () => void,
}
export const PhoneDialog: React.FC<Props> = ({open, onClose, onCamplet}) => {
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const {tableId} = useTableContext();
    const {deviceToken} = useDeviceToken();
    const {run} = useAddPoind();

    const handlePhoneChange = (value: string) => {
        setPhone(value);
        if (!name || name === phone) {
            setName(value);
        }
    };

    const handleCancel = () => {
        setPhone("");
        setName("");
        onClose()
    };

    const handleConfirm = async () => {
        if (!deviceToken) return;
        if (!tableId) return;
        if (phone && name) {
            const res: BaseEntityResponse_v2<any> = await run(tableId, deviceToken, phone, name);
            if (res.statusCode === '200') {
                handleCancel();
            }
        } else {
            alert("Vui lòng điền đầy đủ thông tin!");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

            {/* Dialog Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 animate-fadeIn">
                    {/* Dialog Content */}
                    <div
                        className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md mx-auto animate-slideUp shadow-2xl">
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Nhập thông tin
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Vui lòng điền số điện thoại và tên của bạn
                            </p>
                        </div>

                        {/* Form */}
                        <div className="px-6 py-6 space-y-4">
                            {/* Số điện thoại */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    placeholder="Nhập số điện thoại"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    maxLength={11}
                                />
                            </div>

                            {/* Tên */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên hiển thị <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên của bạn"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Bạn có thể thay đổi tên hiển thị
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors active:scale-95"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!phone || !name}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}