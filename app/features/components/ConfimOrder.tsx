import React, {useCallback, useEffect, useState} from "react";
import {DialogComponation} from "@/components/common/Dialog";
import Button from "@/components/common/Button";
import {useTableContext} from "@/hooks/context/Context";
import {ShoppingCart, Topping} from "@/entites/Props/ShoppingCart";
import {addProduction, loadListFromLocalStorage} from "@/store/ShoppingCart";
import formatCurrency from "@/unit/unit";
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
import {Check} from "lucide-react";

type DetailType = {
    shc: ShoppingCart;
    quantity: number;
};

export const ConfimOrder: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    ShoppingCart: ShoppingCart[] | undefined;
    onChange: (tab: "food" | "ordered") => void;
}> = ({onChange, isOpen, onClose, ShoppingCart}) => {
    const context = useTableContext();
    const [data, setData] = useState<ShoppingCart[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(false);
    const {tableId, tableName} = context;
    const {run, data: responcreat, loading, error} = useCreateOreder();
    const {run: runPayment} = usePayment();

    const [detail, setDetail] = useState<DetailType[] | undefined>();
    const [openMobileDialog, setOpenMobileDialog] = useState<boolean>(false);
    const [mobileDialog, setMobileDialog] = useState<{ title: string; text: string; status: boolean }>();
    const factContext = useFastOrderContext();

    const [token, setToken] = useState<string>();
    const [idTable, setIdTable] = useState<string>();

    useEffect(() => {
        const temp = loadListFromLocalStorage<Table>(TABLE_STORE);
        if (temp && temp.length > 0) setIdTable(temp[0].id);

        const a = localStorage.getItem(TOKEN_Bro_VALUE);
        if (a) setToken(a);
    }, []);

    useEffect(() => {
        if (ShoppingCart) setData(ShoppingCart);
        else {
            const res = loadListFromLocalStorage<ShoppingCart>(SHOPPING_CARTS);
            setData(res as ShoppingCart[]);
        }
    }, [isOpen, ShoppingCart]);

    const sumTotalPritoping = (toppings: Topping[]) => {
        let sum = 0;
        toppings.forEach(v => (sum += v.price));
        return sum;
    };

    useEffect(() => {
        let sum = 0;
        detail?.forEach(value => {
            sum += value.shc.size.price * value.quantity;
            sum += sumTotalPritoping(value.shc.toppings) * value.quantity;
        });
        setTotalPrice(sum);
    }, [detail]);

    const handleConfirm = (typePayment: string) => {
        factContext.clearProduct();

        const items: item[] = data.map(value => ({
            productId: value.id,
            productSizeId: value.size.id,
            toppingIds: value.toppings.flatMap(topping => Array(topping.quantity).fill(topping.id)),
            note: value.note
        }));

        const orderRequet: OrderRequest = {
            tableId: idTable as string,
            items,
            deviceToken: token as string
        };

        factContext.setProduct(tableId, items);

        switch (typePayment) {
            case "COD":
                (async () => {
                    try {
                        const res: BaseEntityData<OrderRespont> = await run(orderRequet);

                        if (res.statusCode === "500") {
                            setMobileDialog({title: "Thông báo", text: "Gọi món thất bại", status: false});
                            setOpenMobileDialog(true);
                        }

                        if (res.data && res.data.id) {
                            setMobileDialog({title: "Thông báo", text: "Gọi món thành công", status: true});
                            setOpenMobileDialog(true);
                            onChange("ordered");
                            localStorage.removeItem(SHOPPING_CARTS);
                            setOpen(false);
                        }
                    } catch {
                        setMobileDialog({title: "Thông báo", text: "Gọi món thất bại", status: false});
                        setOpenMobileDialog(true);
                    }
                })();
                break;

            case "VNPay":
                (async () => {
                    const res: BaseEntityData<OrderRespont> = await run(orderRequet);

                    if (res.data && res.data.id) {
                        const orderId = res.data.id;
                        const datares = await runPayment(orderId);
                        const paymentUrl = datares?.data?.paymentUrl;

                        if (paymentUrl) {
                            window.location.href = paymentUrl;
                            return;
                        }
                    }

                    setMobileDialog({title: "Thông báo", text: "Gọi món thành công", status: true});
                    setOpenMobileDialog(true);
                    localStorage.removeItem(SHOPPING_CARTS);
                    setOpen(false);
                })();
                break;
        }
    };

    useEffect(() => {
        if (responcreat && responcreat.data.id) {
            addProduction<Order>(ORDER_CARTS, {tableId: responcreat.data.tableId, id: responcreat.data.id});
        }
    }, [responcreat]);

    function countShoppingCart(arr: ShoppingCart[]) {
        const map = new Map<string, { shc: ShoppingCart; quantity: number }>();

        for (const item of arr) {
            let toppingString = "";
            item.toppings.forEach(value => {
                toppingString += `${value.id}+${value.quantity}-`;
            });
            const key = `${item.id}_${item.size.id}_${toppingString}_${item.note}`;

            if (!map.has(key)) map.set(key, {shc: item, quantity: 1});
            else map.get(key)!.quantity += 1;
        }
        return Array.from(map.values());
    }

    useEffect(() => {
        if (data.length > 0) setDetail(countShoppingCart(data));
        else setDetail(undefined);
    }, [data]);

    return (
        <>
            {error && error.response?.data?.message && <Alert message={error.response.data.message} type="error"/>}

            {mobileDialog && (
                <MobileDialog
                    isOpen={openMobileDialog}
                    onClose={() => setOpenMobileDialog(false)}
                    status={mobileDialog.status ? "success" : "error"}
                    message={mobileDialog.text}
                />
            )}

            <DialogComponation scrollBody={false} isOpen={isOpen} onClose={onClose}>
                <div className="w-full max-w-md mx-auto">
                    {/* Card */}
                    <div
                        className="rounded-3xl bg-white border border-gray-100 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="bg-emerald-600 px-6 py-5 flex-shrink-0">
                            <h2 className="text-xl font-extrabold text-white text-center">Xác nhận đơn hàng</h2>
                            <p className="text-sm text-emerald-100 text-center mt-1">
                                Bàn: <span className="font-bold">{tableName || tableId}</span>
                            </p>
                        </div>

                        {/* Body */}
                        <div className="px-4 py-4 flex-1 overflow-y-auto bg-gray-50">
                            {data.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">Giỏ hàng trống</p>
                                </div>
                            ) : (
                                <div className="space-y-3 pb-3">
                                    {detail &&
                                        detail.map((it, idx) => {
                                            const itemTotal = it.shc.size.price * it.quantity;

                                            return (
                                                <div
                                                    key={idx}
                                                    className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden"
                                                >
                                                    <div className="p-4">
                                                        <div className="flex gap-3 items-start">
                                                            {/* img */}
                                                            <div
                                                                className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                                                                <img
                                                                    src={it.shc.urlImg}
                                                                    alt={it.shc.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="min-w-0">
                                                                        <h3 className="font-extrabold text-gray-900 text-base leading-tight truncate">
                                                                            {it.shc.name}
                                                                        </h3>
                                                                        <div className="mt-1 flex items-center gap-2">
                                      <span
                                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                        {it.shc.size.name}
                                      </span>
                                                                            <span
                                                                                className="text-xs font-bold text-gray-500">x{it.quantity}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-right shrink-0">
                                                                        <div
                                                                            className="text-xs text-gray-500 font-medium">Tạm
                                                                            tính
                                                                        </div>
                                                                        <div
                                                                            className="text-base font-extrabold text-emerald-600 whitespace-nowrap">
                                                                            {formatCurrency(itemTotal)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* note */}
                                                                {it.shc.note && (
                                                                    <div
                                                                        className="mt-3 rounded-2xl bg-amber-50 border border-amber-100 px-3 py-2">
                                                                        <div
                                                                            className="text-[11px] font-extrabold text-amber-700">Ghi
                                                                            chú
                                                                        </div>
                                                                        <div
                                                                            className="text-sm text-amber-900">{it.shc.note}</div>
                                                                    </div>
                                                                )}

                                                                {/* toppings */}
                                                                {it.shc.toppings.length > 0 && (
                                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                                        <div
                                                                            className="flex items-center justify-between mb-2">
                                                                            <p className="text-xs font-extrabold text-gray-700 uppercase">Topping</p>
                                                                            <p className="text-[11px] text-gray-500">Theo
                                                                                số lượng món</p>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            {it.shc.toppings.map((tp, tpi) => (
                                                                                <div
                                                                                    key={tpi}
                                                                                    className="flex items-center justify-between rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2"
                                                                                >
                                                                                    <div className="min-w-0">
                                                                                        <div
                                                                                            className="text-sm font-bold text-gray-800 truncate">
                                                                                            {tp.name}
                                                                                        </div>
                                                                                        <div
                                                                                            className="text-xs text-gray-500">
                                                                                            x{tp.quantity}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div
                                                                                        className="text-sm font-extrabold text-emerald-600">
                                                                                        +{formatCurrency(tp.price * tp.quantity)}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>

                        {/* Footer sticky */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Tổng cộng</div>
                                    <div className="text-2xl font-extrabold text-emerald-600">
                                        {formatCurrency(totalPrice)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="
                    flex-1 h-12 rounded-2xl
                    border border-gray-200
                    text-gray-700 font-extrabold
                    hover:bg-gray-50 active:scale-[0.99]
                    transition
                  "
                                >
                                    Quay lại
                                </button>

                                <button
                                    onClick={() => {
                                        setOpen(true);
                                        onClose();
                                    }}
                                    className="
                    flex-[2] h-12 rounded-2xl
                    bg-emerald-600 text-white font-extrabold
                    hover:bg-emerald-700 active:scale-[0.99]
                    transition shadow-lg shadow-emerald-600/20
                    flex items-center justify-center
                  "
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"/>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
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
                </div>
            </DialogComponation>

            <DialogConfim
                loading={loading}
                handleConfirm={handleConfirm}
                isOpen={open}
                onClose={() => setOpen(false)}
            />
        </>
    );
};

///////////////////////////////////////////////////////////

type Prop = {
    isOpen: boolean;
    onClose: () => void;
    handleConfirm: (TypePayment: string) => void;
    loading: boolean;
};

const DialogConfim: React.FC<Prop> = ({isOpen, onClose, handleConfirm, loading}) => {
    const {tableId, setTable} = useTableContext();
    const {id} = useParams<{ id: string }>();

    const [isTableInvalid, setIsTableInvalid] = useState<boolean>(tableId === "default_id");
    const [typePayment, setTypePayment] = useState<string>("VNPay");
    const [paymentmeth, setPaymentmeth] = useState<number>(1);

    const {run} = useGetSetting();

    useEffect(() => {
        (async () => {
            try {
                const res: BaseEntityResponse_v2<number> = await run();
                if (res.statusCode === "200") {
                    setPaymentmeth(res.data);
                    setTypePayment(res.data === 1 ? "VNPay" : "COD");
                }
            } catch {
                setPaymentmeth(1);
            }
        })();
    }, []);

    useEffect(() => {
        if (isTableInvalid) {
            const tempStr = localStorage.getItem(TABLE_STORE);
            if (tempStr) {
                try {
                    const temp: Table[] = JSON.parse(tempStr);
                    if (temp.length > 0) {
                        setTable(temp[0].id, temp[0].status, temp[0].name);
                    }
                } catch {
                }
            }
            setIsTableInvalid(false);
        }
    }, [id, tableId, setTable, isTableInvalid]);

    const handlePaymentTypeSelect = useCallback((type: string) => setTypePayment(type), []);

    return (
        <DialogComponation isOpen={isOpen} onClose={onClose} scrollBody={false}>
            <div className="w-full max-w-sm mx-auto">
                <div className="rounded-3xl bg-white border border-gray-100 shadow-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-white">
                        <h2 className="text-xl font-extrabold text-gray-900 text-center">Xác nhận thanh toán</h2>
                        <p className={`text-sm text-center mt-2 ${isTableInvalid ? "text-red-600" : "text-gray-500"}`}>
                            {isTableInvalid
                                ? "Số bàn không hợp lệ. Vui lòng quét đúng mã QR trên bàn."
                                : "Bạn muốn thanh toán như thế nào?"}
                        </p>
                    </div>

                    <div className="px-5 py-5 bg-gray-50">
                        <div className="space-y-3">
                            <button
                                onClick={() => handlePaymentTypeSelect("VNPay")}
                                disabled={isTableInvalid || paymentmeth !== 1}
                                className={`
                                  relative w-full rounded-3xl border p-4 text-left transition
                                  ${typePayment === "VNPay"
                                    ? "bg-green-50 border-green-500 ring-2 ring-green-100 shadow-sm"
                                    : "bg-white border-gray-200 hover:border-gray-300"}
                                  ${isTableInvalid || paymentmeth !== 1 ? "opacity-60 cursor-not-allowed" : ""}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-11 w-11 rounded-2xl bg-green-100 border border-green-200 grid place-items-center shrink-0">
                                        <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M2.25 7.5h19.5m-19.5 0v9a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-9m-19.5 0L21.75 7.5M4.5 12h4.125"/>
                                        </svg>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="text-base font-extrabold text-gray-900">Thanh toán trước</div>
                                        <div className="text-sm text-gray-600">VNPay</div>
                                    </div>

                                    {typePayment === "VNPay" && (
                                        <div className="h-7 w-7 rounded-full bg-green-600 grid place-items-center">
                                            <Check className="w-4 h-4 text-white"/>
                                        </div>
                                    )}
                                </div>
                            </button>

                            <button
                                onClick={() => handlePaymentTypeSelect("COD")}
                                disabled={isTableInvalid || paymentmeth !== 2}
                                className={`
                                  relative w-full rounded-3xl border p-4 text-left transition
                                  ${typePayment === "COD"
                                    ? "bg-orange-50 border-orange-500 ring-2 ring-orange-100 shadow-sm"
                                    : "bg-white border-gray-200 hover:border-gray-300"}
                                  ${isTableInvalid || paymentmeth !== 2 ? "opacity-60 cursor-not-allowed" : ""}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-11 w-11 rounded-2xl bg-orange-100 border border-orange-200 grid place-items-center shrink-0">
                                        <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="text-base font-extrabold text-gray-900">Thanh toán sau</div>
                                        <div className="text-sm text-gray-600">COD</div>
                                    </div>

                                    {typePayment === "COD" && (
                                        <div className="h-7 w-7 rounded-full bg-orange-600 grid place-items-center">
                                            <Check className="w-4 h-4 text-white"/>
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="px-5 py-4 bg-white border-t border-gray-100">
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="
                                  flex-1 h-12 rounded-2xl
                                  border border-gray-200
                                  text-gray-700 font-extrabold
                                  hover:bg-gray-50 active:scale-[0.99]
                                  transition
                                "
                            >
                                Hủy
                            </button>

                            <button
                                onClick={() => handleConfirm(typePayment)}
                                className="
                                  flex-1 h-12 rounded-2xl
                                  bg-emerald-600 text-white font-extrabold
                                  hover:bg-emerald-700 active:scale-[0.99]
                                  transition shadow-lg shadow-emerald-600/20
                                "
                            >
                                {loading ? "Đang tạo..." : "Xác nhận"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DialogComponation>
    );
};
