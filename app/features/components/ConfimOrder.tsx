import React, {useCallback, useEffect, useState} from "react";
import {DialogComponation} from "@/components/common/Dialog";
import Button from "@/components/common/Button";
import {useTableContext} from "@/hooks/context/Context";
import {ShoppingCart, Topping} from "@/entites/Props/ShoppingCart";
import {addProduction, loadListFromLocalStorage} from "@/store/ShoppingCart";
import formatCurrency, {totolPrice} from "@/unit/unit";
import {item, OrderRequest} from "@/entites/request/OrderRequest";
import {useCreateOreder} from "@/hooks/customHooks/useOrderHooks";
import {Order} from "@/entites/Props/Order";
import {Payment} from "@/app/features/components/Payment";
import {useFastOrderContext} from "@/hooks/context/FastOrderContext";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";
import {Alert} from "@/components/common/Alert";
import {ORDER_CARTS, SHOPPING_CARTS} from "@/key-store";


type DetailType = {
    shc: ShoppingCart;
    quantity: number;
};


export const ConfimOrder: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    ShoppingCart: ShoppingCart[] | undefined
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
    const {run, data: responcreat, loading, error} = useCreateOreder();
    const deviceToken = useDeviceToken();
    const [ex, setEx] = useState<string>();
    const [detail, setDetail] = useState<DetailType[] | undefined>()


    const factContext = useFastOrderContext();


    useEffect(() => {
        if (ShoppingCart) {
            setData(ShoppingCart);
        } else {
            const res = loadListFromLocalStorage<ShoppingCart>(SHOPPING_CARTS);
            setData(res as ShoppingCart[]);
        }
    }, [isOpen]);


    useEffect(() => {
        (() => {
            let sum = 0;
            detail?.forEach(value => {

                sum += value.shc.size.price * value.quantity;
                sum += sumTotalPritoping(value.shc.toppings) * value.quantity;
            })
            setTotalPrice(sum);
        })()
    }, [detail]);


    const sumTotalPritoping = (toppings: Topping[]) => {
        let sum = 0;
        toppings.forEach(value => {
            sum += value.price;
        })
        return sum;
    }

    const handleConfirm = (typePayment: string) => {

        factContext.clearProduct();
        console.log(deviceToken.deviceToken);

        const items: item[] = data.map(value => ({
            productId: value.id,
            productSizeId: value.size.id,
            toppingIds: value.toppings.flatMap(topping =>
                Array(topping.quantity).fill(topping.id)
            ),
            note: value.note,
        }))


        const orderRequet: OrderRequest = {
            tableId: tableId,
            items: items,
            deviceToken: deviceToken.deviceToken
        }


        factContext.setProduct(tableId, items);

        switch (typePayment) {
            case 'COD':
                (async () => {
                    await run(orderRequet);
                    if (error && error.response.data.message)
                        setEx(error.response.data.message);

                    handleRemote()
                    setOpen(false);
                })()
                break;
            case 'VNPay':
                setOpen(false)
                onClose();
                break;
        }
    }

    const handleRemote = () => {
        localStorage.removeItem(SHOPPING_CARTS)
    }

    useEffect(() => {
        (() => {
            if (responcreat && responcreat.data.id) {
                addProduction<Order>(ORDER_CARTS, {
                    tableId: responcreat.data.tableId,
                    id: responcreat.data.id
                });
            }
        })()
    }, [responcreat]);


    function countShoppingCart(arr: ShoppingCart[]) {
        const map = new Map<string, { shc: ShoppingCart; quantity: number }>();

        for (const item of arr) {
            let toppingString = '';
            item.toppings.forEach(value => {
                toppingString += `${value.id}+${value.quantity}-`;
            });
            const key = `${item.id}_${item.size.id}_${toppingString}_${item.note}`;
            if (!map.has(key)) {
                map.set(key, {shc: item, quantity: 1});
            } else {
                map.get(key)!.quantity += 1;
            }
        }

        return Array.from(map.values());
    }


    useEffect(() => {
        if (data.length > 0) {
            const grouped = countShoppingCart(data);
            setDetail(grouped);
        } else {
            setDetail(undefined);
        }
    }, [data]);


    return (
        <>
            {
                error && error.response.data.message && (
                    <Alert message={error.response.data.message} type="error"/>
                )
            }
            <DialogComponation scrollBody={false} isOpen={isOpen} onClose={onClose}>
                <div className="bg-white rounded-xl shadow-lg max-w-md mx-auto overflow-hidden">
                    <div className="bg-emerald-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white text-center">
                            Xác Nhận Đơn Hàng
                        </h2>
                        <p className="text-sm text-emerald-100 text-center mt-1">
                            Bàn: {tableName || tableId}
                        </p>
                    </div>

                    <div className="px-4 py-4 max-h-[50vh] overflow-y-auto">
                        {data.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Giỏ hàng trống</p>
                            </div>
                        ) : (
                            <div className="space-y-4">

                                {detail && detail.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                        <div className="flex gap-3 items-start mb-3">
                                            {item.shc.urlImg && (
                                                <div
                                                    className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <img
                                                        src={item.shc.urlImg}
                                                        alt={item.shc.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold text-gray-800">
                                                        {item.shc.name} (x{item.quantity})
                                                    </h3>
                                                    <span className="font-bold text-emerald-600 ml-2 whitespace-nowrap">
                                                        {formatCurrency(item.shc.size.price * item.quantity)}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-600 mt-1">
                                                    Size: {item.shc.size.name}
                                                </p>

                                                {item.shc.note && (
                                                    <div className="mt-2">
                                                        <p className="text-xs font-medium text-gray-500 mb-1">
                                                            Ghi chú:
                                                        </p>
                                                        <p className="text-sm text-gray-700 bg-emerald-50 px-3 py-2 rounded-lg">
                                                            {item.shc.note}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {item.shc.toppings.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                                    Topping
                                                </p>
                                                <div className="space-y-2">
                                                    {item.shc.toppings.map((topping, toppingIdx) => (
                                                        <div key={toppingIdx}
                                                             className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                {topping.imgUrl && (
                                                                    <div className="w-8 h-8 rounded-md overflow-hidden">
                                                                        <img
                                                                            src={topping.imgUrl}
                                                                            alt={topping.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <span className="text-sm text-gray-700">
                                                                    {topping.name}
                                                                    <span className="text-gray-500 ml-1">
                                                                        (x{topping.quantity})
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">
                                                                +{formatCurrency(topping.price * item.quantity)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                            <span className="text-xl font-bold text-emerald-600">
                                {formatCurrency(totalPrice)}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg
                                    font-medium hover:bg-gray-50 transition-colors flex-1"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={() => {
                                    setOpen(true);
                                    onClose();
                                }}
                                className="bg-emerald-600 text-white rounded-lg font-bold
                                    hover:bg-emerald-700 transition-colors px-4 py-3 flex-1
                                    flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    "Xác nhận đặt hàng"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </DialogComponation>
            <DialogConfim loading={loading} handleConfirm={handleConfirm} isOpen={open} onClose={() => setOpen(false)}/>
        </>
    )
}


///////////////////////////////////////////////////////////

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