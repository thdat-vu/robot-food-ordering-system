import React, {useCallback, useEffect, useState} from "react";
import {BottomModal} from "@/components/common/BottomModal";
import Button from "@/components/common/Button";
import {RiBankCard2Line} from "react-icons/ri";
import {useCreateOreder, useCreatePayment} from "@/hooks/customHooks/useOrderHooks";
import {BaseEntityData} from "@/entites/BaseEntity";
import {PaymentRespont} from "@/entites/respont/Payment";
import {useFastOrderContext} from "@/hooks/context/FastOrderContext";
import {item, OrderRequest} from "@/entites/request/OrderRequest";
import {useTableContext} from "@/hooks/context/Context";
import {OrderRespont} from "@/entites/respont/OrderRespont";
import {addProduction} from "@/store/ShoppingCart";
import {Order} from "@/entites/Props/Order";

type PaymentProps = {
    id: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    orderId?: string; // Make optional since it might be empty
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

export const Payment: React.FC<PaymentProps> = ({id, isOpen, onClose, onSave, orderId = ''}) => {
    const [payment, setPayment] = useState<number>(0);
    const {run: runPayment, loading: paymentLoading} = useCreatePayment();
    const {run: runOrder, loading: orderLoading} = useCreateOreder();
    const [error, setError] = useState<string>('');
    const [currentOrderId, setCurrentOrderId] = useState<string>(orderId);

    const context = useFastOrderContext();
    const tablecontext = useTableContext();

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

    const isLoading = paymentLoading || orderLoading;

    const showAlert = useCallback((title: string, message: string, type: 'success' | 'error') => {
        setAlert({
            isOpen: true,
            title,
            message,
            type
        });
    }, []);

    const closeAlert = useCallback(() => {
        setAlert(prev => ({...prev, isOpen: false}));
        setTimeout(() => {
            if (alert.type === 'success') {
                onSave();
                onClose();
            }
        }, 100);
    }, [alert.type, onSave, onClose]);

    const createOrderIfNeeded = async (): Promise<string | null> => {
        if (currentOrderId) {
            return currentOrderId;
        }

        const items: item[] = context.items;

        if (!items || items.length === 0) {
            showAlert(
                'Lỗi đơn hàng',
                'Không có món nào trong đơn hàng. Vui lòng thêm món trước khi thanh toán.',
                'error'
            );
            return null;
        }

        if (!tablecontext.tableId) {
            showAlert(
                'Lỗi bàn',
                'Không xác định được bàn. Vui lòng chọn bàn trước khi đặt hàng.',
                'error'
            );
            return null;
        }

        const orderRequest: OrderRequest = {
            tableId: tablecontext.tableId,
            items: items,
        };

        try {
            const orderRes: BaseEntityData<OrderRespont> = await runOrder(orderRequest);
            const newOrderId = orderRes.data.id;
            setCurrentOrderId(newOrderId);
            return newOrderId;

        } catch (error: any) {
            showAlert(
                'Lỗi hệ thống',
                error?.message || 'Không thể tạo đơn hàng. Vui lòng kiểm tra kết nối mạng.',
                'error'
            );
            return null;
        }
    };

    const handlePayment = async () => {
        setError('');

        if (payment === 0) {
            setError("Vui lòng chọn phương thức thanh toán");
            return;
        }

        try {
            const orderIdToUse = await createOrderIfNeeded();
            if (!orderIdToUse) {
                return;
            }
            addProduction<Order>("order-ss", {
                tableId: tablecontext.tableId,
                id: orderIdToUse
            });


            const paymentRes: BaseEntityData<PaymentRespont> = await runPayment(orderIdToUse, {
                paymentMethod: payment
            });

            showAlert(
                'Thanh toán',
                `Đã gửi yêu cầu thanh toán`,
                'success'
            );
            onClose();
        } catch (error: any) {
            console.error('Payment error:', error);
            showAlert(
                'Lỗi hệ thống',
                error?.message || 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.',
                'error'
            );
        }
    };

    useEffect(() => {
        setCurrentOrderId(orderId || '');
    }, [orderId]);

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
                        className={`flex items-center p-3 bg-gray-100 text-black rounded-lg cursor-pointer hover:bg-gray-200 transition-colors ${
                            payment === 1 ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                            type="radio"
                            name="payment"
                            className="mr-3"
                            checked={payment === 1}
                            onChange={() => !isLoading && setPayment(1)}
                            disabled={isLoading}
                        />
                        <div className="flex items-center">
                            <img src="https://img.icons8.com/color/48/000000/money.png" alt="Cash"
                                 className="w-6 h-6 mr-2"/>
                            <span>Tiền mặt</span>
                        </div>
                    </label>

                    <label
                        className={`flex items-center p-3 bg-gray-100 text-black rounded-lg cursor-pointer hover:bg-gray-200 transition-colors ${
                            payment === 2 ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                            type="radio"
                            name="payment"
                            className="mr-3"
                            checked={payment === 2}
                            onChange={() => !isLoading && setPayment(2)}
                            disabled={isLoading}
                        />
                        <div className="flex items-center">
                            <RiBankCard2Line className="w-6 h-6 mr-2"/>
                            <span>Ngân hàng</span>
                        </div>
                    </label>
                </div>

                <Button
                    className={`w-full mt-6 py-3 rounded-3xl font-semibold transition-colors ${
                        isLoading
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                    content={
                        orderLoading ? 'Đang tạo đơn hàng...' :
                            paymentLoading ? 'Đang xử lý thanh toán...' :
                                'Gửi yêu cầu'
                    }
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