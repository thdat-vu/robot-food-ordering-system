import React, {use, useCallback, useEffect, useState} from "react";
import {DialogComponation} from "@/components/common/Dialog";
import Button from "@/components/common/Button";
import {useTableContext} from "@/hooks/context/Context";
import {ShoppingCart, Topping} from "@/entites/Props/ShoppingCart";
import {addProduction, loadListFromLocalStorage} from "@/store/ShoppingCart";
import formatCurrency, {totolPrice} from "@/unit/unit";
import {item, OrderRequest} from "@/entites/request/OrderRequest";
import {useCreateOreder} from "@/hooks/customHooks/useOrderHooks";
import {Order} from "@/entites/Props/Order";
import {useFastOrderContext} from "@/hooks/context/FastOrderContext";
import {Alert} from "@/components/common/Alert";
import {ORDER_CARTS, SHOPPING_CARTS} from "@/key-store";
import {MobileDialog} from "@/components/common/MobileDialog";
import {useParams, useRouter} from "next/navigation";
import {TABLE_STORE, TOKEN_Bro_VALUE} from "@/name-value-env";
import {Table} from "@/entites/respont/Table";
import {BaseEntityData, BaseEntityResponse_v2} from "@/entites/BaseEntity";
import {OrderRespont} from "@/entites/respont/OrderRespont";
import {usePayment} from "@/hooks/customHooks/usePayment";
import {useGetSetting} from "@/hooks/customHooks/useSettingHooks";
import {MobileDialogB2} from "@/components/common/MobileDialogB2";


type DetailType = {
    shc: ShoppingCart;
    quantity: number;
};


export const ConfimOrder: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    ShoppingCart: ShoppingCart[] | undefined,
    onChange: (tab: "food" | "ordered") => void;
}> = ({
          onChange,
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
    const {run: runPayment} = usePayment();


    // const deviceToken = useDeviceToken();
    const [ex, setEx] = useState<string>();
    const [detail, setDetail] = useState<DetailType[] | undefined>()
    const [openMobileDialog, setOpenMobileDialog] = useState<boolean>(false)
    const [mobileDialog, setMobileDialog] = useState<{ title: string, text: string, status: boolean }>();
    const factContext = useFastOrderContext();

    const [token, setToken] = useState<string>();
    const [idTable, setIdTable] = useState<string>();

    useEffect(() => {
        const temp = loadListFromLocalStorage<Table>(TABLE_STORE);
        console.log(temp)
        if (temp && temp.length > 0) {
            setIdTable(temp[0].id);
        }

        const a = localStorage.getItem(TOKEN_Bro_VALUE);
        if (a) {
            setToken(a);
        }
    }, []);

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

        const items: item[] = data.map(value => ({
            productId: value.id,
            productSizeId: value.size.id,
            toppingIds: value.toppings.flatMap(topping =>
                Array(topping.quantity).fill(topping.id)
            ),
            note: value.note,
        }))


        const orderRequet: OrderRequest = {
            tableId: idTable as string,
            items: items,
            deviceToken: token as string
        }


        factContext.setProduct(tableId, items);

        switch (typePayment) {
            case "COD":
                (async () => {
                    try {

                        const res: BaseEntityData<OrderRespont> = await run(orderRequet);


                        if(res.statusCode === '500'){
                            setMobileDialog({
                                title: "Thông báo",
                                text: "Gọi món thất bại",
                                status: false,
                            });
                            setOpenMobileDialog(true);
                        }

                        if (res.data && res.data.id) {
                            setMobileDialog({
                                title: "Thông báo",
                                text: "Gọi món thành công",
                                status: true,
                            });
                            setOpenMobileDialog(true);
                            onChange("ordered");
                            handleRemote();
                            setOpen(false);
                        }

                    } catch (error: any) {
                        console.error("Lỗi khi thanh toán COD:", error);
                        setEx(error?.response?.data?.message || "Đã xảy ra lỗi");

                        setMobileDialog({
                            title: "Thông báo",
                            text: "Gọi món thất bại",
                            status: false,
                        });
                        setOpenMobileDialog(true);
                    }
                })();
                break;

            case 'VNPay':
                (async () => {
                    const res: BaseEntityData<OrderRespont> = await run(orderRequet);

                    if (res.data && res.data.id) {
                        const orderId = res.data.id;

                        console.log(orderId)
                        // 🪙 Gọi API thanh toán
                        const datares = await runPayment(orderId);

                        console.log(datares)

                        const paymentUrl = datares?.data?.paymentUrl;



                        if (paymentUrl) {
                            window.location.href = paymentUrl;
                            return;
                        }
                    }


                    setMobileDialog({
                        title: "Thông báo",
                        text: "Gọi món thành công",
                        status: true,
                    });
                    setOpenMobileDialog(true);
                    handleRemote();
                    setOpen(false);
                    // setOpen(false)
                    // onClose();
                })()
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
            {
                mobileDialog && (
                    <MobileDialog isOpen={openMobileDialog} onClose={() => setOpenMobileDialog(false)}
                                  status={mobileDialog.status ? "success" : "error"} message={mobileDialog.text}/>
                )
            }


            <DialogComponation scrollBody={false} isOpen={isOpen} onClose={onClose}>
                <div className="bg-white rounded-xl shadow-lg max-w-md mx-auto overflow-hidden
                    max-h-[80vh] flex flex-col mb-16 sm:mb-0">
                    <div className="bg-emerald-600 px-6 py-4 flex-shrink-0">
                        <h2 className="text-xl font-bold text-white text-center">
                            Xác Nhận Đơn Hàng
                        </h2>
                        <p className="text-sm text-emerald-100 text-center mt-1">
                            Bàn: {tableName || tableId}
                        </p>
                    </div>

                    <div className="px-4 py-4 flex-1 overflow-y-auto">
                        {data.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Giỏ hàng trống</p>
                            </div>
                        ) : (
                            <div className="space-y-3 pb-4">
                                {detail && detail.map((item, idx) => (
                                    <div key={idx} className="bg-white rounded-lg p-3 border border-gray-100">
                                        <div className="flex gap-3 items-start">
                                            {item.shc.urlImg && (
                                                <div
                                                    className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                                                    <img
                                                        src={item.shc.urlImg}
                                                        alt={item.shc.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold text-gray-900 text-base pr-2">
                                                        {item.shc.name} (x{item.quantity})
                                                    </h3>
                                                    <span
                                                        className="font-bold text-emerald-600 text-lg whitespace-nowrap">
                                                        {formatCurrency(item.shc.size.price * item.quantity)}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-2">
                                                    Size: {item.shc.size.name}
                                                </p>

                                                {item.shc.note && (
                                                    <div
                                                        className="mt-2 p-2 bg-amber-50 rounded-md border-l-2 border-amber-300">
                                                        <p className="text-xs text-amber-700 font-medium mb-1">Ghi
                                                            chú:</p>
                                                        <p className="text-sm text-amber-800">{item.shc.note}</p>
                                                    </div>
                                                )}

                                                {item.shc.toppings.length > 0 && (
                                                    <div className="mt-3 pt-2 border-t border-gray-200">
                                                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                                                            Topping
                                                        </p>
                                                        <div className="space-y-1">
                                                            {item.shc.toppings.map((topping, toppingIdx) => (
                                                                <div key={toppingIdx}
                                                                     className="flex justify-between items-center text-sm">
                                                                    <span className="text-gray-700">
                                                                        {topping.name} (x{topping.quantity})
                                                                    </span>
                                                                    <span className="font-medium text-emerald-600">
                                                                        +{formatCurrency(topping.price * topping.quantity)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>)}
                    </div>

                    {/* Footer - Always visible at bottom */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
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
                               font-medium hover:bg-gray-50 active:bg-gray-100
                               transition-colors flex-1 select-none min-h-[48px]"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={() => {
                                    setOpen(true);
                                    onClose();
                                }}
                                className="bg-emerald-600 text-white rounded-lg font-bold
                               hover:bg-emerald-700 active:bg-emerald-800
                               transition-colors px-4 py-3 flex-1
                               flex items-center justify-center select-none min-h-[48px]"
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
    const {tableId, setTable} = useTableContext();
    const {id} = useParams<{ id: string }>();

    const [isTableInvalid, setIsTableInvalid] = useState<boolean>(tableId === "default_id");
    const [typePayment, setTypePayment] = useState<string>("COD");
    const [open, setOpen] = useState<boolean>(false);
    const [paymentmeth, setPaymentmeth] = useState<number>(1)



    const {run} = useGetSetting();




    useEffect(() => {

        (async () => {
            try {
                const res: BaseEntityResponse_v2<number> = await run();
                console.log(res)
                if (res.statusCode == '200') {
                    setPaymentmeth(res.data);
                    if (res.data === 1) {
                        setTypePayment("VNPay")
                    } else {
                        setTypePayment("COD")
                    }
                }
            } catch (error) {
                setPaymentmeth(1);
            }
        })()
    }, []);

    useEffect(() => {
        if (isTableInvalid) {
            const tempStr = localStorage.getItem(TABLE_STORE);

            console.log(tempStr);
            if (tempStr) {
                try {
                    const temp: Table[] = JSON.parse(tempStr);

                    if (temp.length > 0) {
                        setTable(
                            temp[0].id,
                            temp[0].status,
                            temp[0].name
                        );
                        console.log(temp);
                    }
                } catch (err) {
                    console.error("Error parsing TABLE_STORE:", err);
                }
            }

            setIsTableInvalid(false);
        }
    }, [id, tableId, setTable, isTableInvalid]);


    useEffect(() => {
        if (typePayment === "VNPay") {
            setOpen(true);
        }
    }, [typePayment]);

    const handlePaymentTypeSelect = useCallback(async (type: string) => {
        setTypePayment(type);
    }, []);

    const handleClosePaymentModal = useCallback(() => {
        setOpen(false);
        setTypePayment("COD");
    }, []);

    const handlePaymentModalSave = useCallback(() => {
        setOpen(false);
        handleConfirm("VNPay");
    }, [handleConfirm]);

    return (
        <>
            <DialogComponation isOpen={isOpen} onClose={onClose} scrollBody={false}>
                <div className="bg-white rounded-lg shadow-xl max-w-sm mx-auto">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 text-center">
                            Xác Nhận Thanh Toán
                        </h2>
                    </div>

                    <div className="px-6 py-8">
                        <p
                            className={`text-center mb-8 text-base ${
                                isTableInvalid ? "text-red-500" : "text-gray-700"
                            }`}
                        >
                            {isTableInvalid
                                ? "Số bàn của bạn không hợp lệ, vui lòng quét đúng mã QR trên bàn để xác nhận"
                                : "Bạn muốn thanh toán như thế nào?"}
                        </p>

                        <div className="flex flex-col space-y-5">

                            {
                                paymentmeth === 1 ? (
                                    <button
                                        onClick={() => handlePaymentTypeSelect("VNPay")}
                                        disabled={isTableInvalid}
                                        className={`group relative flex items-center w-full rounded-2xl border-2 p-5 transition-all duration-300 shadow-sm
                                    ${
                                            typePayment === "VNPay"
                                                ? "border-green-500 bg-green-50 shadow-md ring-1"
                                                : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        <div
                                            className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                            <svg
                                                className="w-6 h-6 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M2.25 7.5h19.5m-19.5 0v9a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-9m-19.5 0L21.75 7.5M4.5 12h4.125"
                                                />
                                            </svg>
                                        </div>


                                        <div className="flex-1 text-left">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Thanh toán trước
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Thanh toán trước khi nhận hàng
                                            </p>
                                        </div>

                                        {typePayment === "VNPay" && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <div
                                                    className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg
                                                        className="w-4 h-4 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handlePaymentTypeSelect("COD")}
                                        disabled={isTableInvalid}
                                        className={`group relative flex items-center w-full rounded-2xl border-2 p-5 transition-all duration-300 shadow-sm
                                    ${
                                            typePayment === "COD"
                                                ? "border-orange-500 bg-orange-50 shadow-md ring-1 ring-orange-200"
                                                : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        <div
                                            className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                                            <svg
                                                className="w-6 h-6 text-orange-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>

                                        <div className="flex-1 text-left">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Thanh toán sau
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Thanh toán sau khi hoàn thành đơn hàng
                                            </p>
                                        </div>

                                        {typePayment === "COD" && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <div
                                                    className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                    <svg
                                                        className="w-4 h-4 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                )
                            }

                        </div>
                    </div>


                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <div className="flex gap-3">
                            <Button
                                handle={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700
                                     rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                content="Hủy"
                            />
                            <Button
                                handle={() => handleConfirm(typePayment)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-black bg-green-600
                                     rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                content={loading ? "Đang tạo ..." : "Xác Nhận"}
                            />
                        </div>
                    </div>
                </div>
            </DialogComponation>

            {/*<Payment*/}
            {/*    id={""}*/}
            {/*    isOpen={open}*/}
            {/*    onClose={handleClosePaymentModal}*/}
            {/*    onSave={handlePaymentModalSave}*/}
            {/*    orderId={""}*/}
            {/*/>*/}
        </>
    );
};
