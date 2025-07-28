import React, {useEffect, useState} from "react";
import {BottomModal} from "@/components/common/BottomModal";
import Button from "@/components/common/Button";
import {RiBankCard2Line} from "react-icons/ri";
import {useCreatePayment} from "@/hooks/customHooks/useOrderHooks";
import {BaseEntityData} from "@/entites/BaseEntity";
import {PaymentRespont} from "@/entites/respont/Payment";

type PaymentProps = {
    id: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    orderId: string;
}

type AlertDialogProps = {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({isOpen, title, message, type, onClose}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
                <div className="flex items-center mb-4">
                    {type === 'success' ? (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{message}</p>
                <Button
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                    content="Đóng"
                    handle={onClose}
                />
            </div>
        </div>
    );
};

export const Payment: React.FC<PaymentProps> = ({id, isOpen, onClose, onSave, orderId}) => {
    const [payment, setPayment] = useState<number>(0);
    const {run, loading} = useCreatePayment();
    const [error, setError] = useState<string>('');
    const [alert, setAlert] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    const showAlert = (title: string, message: string, type: 'success' | 'error') => {
        setAlert({
            isOpen: true,
            title,
            message,
            type
        });
    };

    const closeAlert = () => {
        setAlert(prev => ({...prev, isOpen: false}));
        if (alert.type === 'success') {
            onSave();
            onClose();
        }
    };

    const handlePayment = async () => {
        setError('');


        if (payment === 0) {
            setError("Vui lòng chọn phương thức thanh toán");
            return;
        }

        try {
            console.log(payment, orderId);
            const res: BaseEntityData<PaymentRespont> = await run(orderId, {paymentMethod: payment});

            if (res && res.statusCode === '200') {
                const paymentMethodText = payment === 1 ? 'Tiền mặt' : 'Ngân hàng';
                showAlert(
                    'Thanh toán thành công!',
                    `Yêu cầu thanh toán bằng ${paymentMethodText} đã được gửi thành công. Mã đơn hàng: ${orderId}`,
                    'success'
                );
            } else {
                showAlert(
                    'Thanh toán thất bại',
                    res?.data.message || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.',
                    'error'
                );
            }
        } catch (error: any) {
            showAlert(
                'Lỗi hệ thống',
                error?.message || 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.',
                'error'
            );
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setPayment(0);
            setError('');
            setAlert(prev => ({...prev, isOpen: false}));
        }
    }, [isOpen]);

    return (
        <>
            <BottomModal
                id={id}
                title="Thanh toán"
                isOpen={isOpen}
                onClose={onClose}
                onSave={onSave}
            >
                <div className="text-lg text-black mb-4">Gói thanh toán</div>
                <p className="text-gray-900 mb-6">Bạn muốn thanh toán bằng</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <label
                        className={`flex items-center p-3 bg-gray-100 text-black rounded-lg cursor-pointer hover:bg-gray-200 ${
                            payment === 1 ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''
                        }`}>
                        <input
                            type="radio"
                            name="payment"
                            className="mr-3"
                            checked={payment === 1}
                            onChange={() => setPayment(1)}
                        />
                        <div className="flex items-center">
                            <img src="https://img.icons8.com/color/48/000000/money.png" alt="Cash"
                                 className="w-6 h-6 mr-2"/>
                            <span>Tiền mặt</span>
                        </div>
                    </label>

                    <label
                        className={`flex items-center p-3 bg-gray-100 text-black rounded-lg cursor-pointer hover:bg-gray-200 ${
                            payment === 2 ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''
                        }`}>
                        <input
                            type="radio"
                            name="payment"
                            className="mr-3"
                            checked={payment === 2}
                            onChange={() => setPayment(2)}
                        />
                        <div className="flex items-center">
                            <RiBankCard2Line className="w-6 h-6 mr-2"/>
                            <span>Ngân hàng</span>
                        </div>
                    </label>
                </div>

                <Button
                    className={`w-full mt-6 py-3 rounded-3xl font-semibold ${
                        loading
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                    content={loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                    handle={handlePayment}
                />
            </BottomModal>

            <AlertDialog
                isOpen={alert.isOpen}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={closeAlert}
            />
        </>
    )
}