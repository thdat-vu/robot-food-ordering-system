import React, {useCallback, useEffect, useState} from "react";
import {DialogComponation} from "@/components/common/Dialog";
import Button from "@/components/common/Button";
import {useTableContext} from "@/hooks/context/Context";
import {ShoppingCart} from "@/entites/Props/ShoppingCart";
import {addProduction, loadListFromLocalStorage} from "@/store/ShoppingCart";
import formatCurrency, {totolPrice} from "@/unit/unit";
import {item, OrderRequest} from "@/entites/request/OrderRequest";
import {useCreateOreder} from "@/hooks/customHooks/useOrderHooks";
import {Order} from "@/entites/Props/Order";
import {Payment} from "@/app/features/components/Payment";
import {useFastOrderContext} from "@/hooks/context/FastOrderContext";

export const ConfimOrder: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    ShoppingCart: ShoppingCart | undefined
}> = ({
          isOpen,
          onClose,
          ShoppingCart
      }) => {

    const context = useTableContext();
    const [data, setData] = useState<ShoppingCart[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(false);
    const {tableId, tableName} = context;
    const {run, data: responcreat, loading} = useCreateOreder();

    const factContext = useFastOrderContext();

    useEffect(() => {
        if (ShoppingCart) {
            setData([ShoppingCart]);
        } else {
            const res = loadListFromLocalStorage<ShoppingCart>("shopping-carts");
            setData(res as ShoppingCart[]);
        }
    }, [isOpen]);


    useEffect(() => {
        (() => {
            let sum = totolPrice(data);
            setTotalPrice(sum);
        })()
    }, [data]);


    const handleConfirm = (typePayment: string) => {

        factContext.clearProduct();

        const items: item[] = data.map(value => ({
            productId: value.id,
            productSizeId: value.size.id,
            toppingIds: value.toppings.map(value1 => value1.id)
        }))


        const orderRequet: OrderRequest = {
            tableId: tableId,
            items: items,
        }


        factContext.setProduct(tableId, items);

        switch (typePayment) {
            case 'COD':
                (async () => {
                    await run(orderRequet);
                    setOpen(false);
                })()
                break;
            case 'VNPay':
                setOpen(false)
                onClose();
                break;
        }
    }


    useEffect(() => {
        (() => {
            if (responcreat && responcreat.data.id) {
                addProduction<Order>("order-ss", {
                    tableId: responcreat.data.tableId,
                    id: responcreat.data.id
                });
            }
        })()
    }, [responcreat]);


    return (
        <>
            <DialogComponation scrollBody={false} isOpen={isOpen} onClose={onClose}>
                <div className="bg-white rounded-lg shadow-xl max-w-md mx-auto">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 text-center">
                            Xác Nhận Đơn Hàng
                        </h2>
                        <p className="text-sm text-gray-600 text-center mt-1">
                            Bàn: {tableName || tableId}
                        </p>
                    </div>

                    <div className="px-6 py-4 max-h-96 overflow-y-auto">
                        {data.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Giỏ hàng trống</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                <p className="text-sm text-gray-600">Size: {item.size.name || 'Standard'}</p>
                                            </div>
                                            <span className="font-bold text-green-600">
                                            {formatCurrency(item.size.price)}
                                        </span>
                                        </div>

                                        {item.toppings.length > 0 && (
                                            <div className="pl-4 border-l-2 border-gray-200">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                    Topping
                                                </p>
                                                {item.toppings.map((topping, toppingIdx) => (
                                                    <div key={toppingIdx}
                                                         className="flex justify-between items-center py-1">
                                                        <span
                                                            className="text-sm text-gray-600">+ {topping.name} (x{topping.quantity})</span>
                                                        <span className="text-sm font-medium text-gray-700">
                                                        {formatCurrency(topping.price * topping.quantity)}
                                                    </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                            <span className="text-xl font-bold text-green-600">
                            {formatCurrency(totalPrice)}
                        </span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700
                                     rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <Button
                                className="bg-green-600 w-80 sm:w-96 transition-all duration-300 ease-in-out
                                         transform hover:scale-105 rounded-3xl active:scale-110
                                         px-8 py-4 text-lg"
                                content="Xác Nhận Đặt Hàng"
                                handle={() => {

                                    setOpen(true)
                                    onClose()
                                }}
                            />
                        </div>
                    </div>
                </div>
            </DialogComponation>
            <DialogConfim loading={loading} handleConfirm={handleConfirm} isOpen={open} onClose={() => setOpen(false)}/>
        </>
    )
}


type Prop = {
    isOpen: boolean,
    onClose: () => void,
    handleConfirm: (TypePayment: string) => void,
    loading: boolean,
}


const DialogConfim: React.FC<Prop> = ({isOpen, onClose, handleConfirm, loading}) => {
    const context = useTableContext();

    const {tableId} = context;
    const [table] = useState<boolean>(tableId == 'default_id')
    const [TypePayment, setTypePayment] = useState<string>(!table ? 'COD' : '');
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {
        if (TypePayment === 'VNPay' && TypePayment) {
            setOpen(true);
        }
    }, [TypePayment]);

    const handlePaymentTypeSelect = useCallback((type: string) => {
        setTypePayment(type);
    }, []);

    const handleClosePaymentModal = useCallback(() => {
        setOpen(false);
        setTypePayment('COD');
    }, []);

    const handlePaymentModalSave = useCallback(() => {
        setOpen(false);
        handleConfirm('VNPay');
    }, [handleConfirm]);

    return (
        <>
            <DialogComponation isOpen={isOpen} onClose={onClose} scrollBody={false}>
                <div className="bg-white rounded-lg shadow-xl max-w-sm mx-auto">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-center mb-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 text-center">
                            Xác Nhận Thanh Toán
                        </h2>
                    </div>

                    <div className="px-6 py-6">
                        <p className={table ? "text-red-500 text-center mb-6" : "text-gray-600 text-center mb-6"}>
                            {table ? "Số bàn của bạn không hợp lệ vui lòng quét đúng mã QR trên bàn để xác nhận" : "Bạn muốn thanh toán như thế nào?"}
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => handlePaymentTypeSelect('VNPay')}
                                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
                                ${TypePayment === 'VNPay'
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                                }`}
                                disabled={table}
                            >
                                <div className="flex items-center">
                                    <div
                                        className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Thanh Toán Liền</h3>
                                        <p className="text-sm text-gray-600">Thanh toán ngay khi đặt hàng</p>
                                    </div>
                                    {TypePayment === "VNPay" && (
                                        <div className="ml-auto">
                                            <div
                                                className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                          d="M5 13l4 4L19 7"/>
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </button>

                            <button
                                onClick={() => handlePaymentTypeSelect('COD')}
                                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
                                ${TypePayment === "COD"
                                    ? "border-orange-500 bg-orange-50"
                                    : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                                }`}
                                disabled={table}
                            >
                                <div className="flex items-center">
                                    <div
                                        className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Thanh Toán Sau</h3>
                                        <p className="text-sm text-gray-600">Thanh toán khi hoàn thành đơn hàng</p>
                                    </div>
                                    {TypePayment === "COD" && (
                                        <div className="ml-auto">
                                            <div
                                                className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                          d="M5 13l4 4L19 7"/>
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <div className="flex gap-3">
                            <Button
                                handle={() =>
                                    onClose()
                                }
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700
                                     rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                content="Hủy"
                            />
                            <Button
                                handle={() => handleConfirm(TypePayment)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-black bg-green-600
                                     rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                content={loading ? "Đang tạo ..." : "Xác Nhận"}
                            />

                        </div>
                    </div>
                </div>
            </DialogComponation>
            <Payment id={''} isOpen={open} onClose={handleClosePaymentModal} onSave={() => {
            }} orderId={''}/>
        </>
    )
}