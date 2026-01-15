"use client";
import React, {useCallback, useEffect, useState} from "react";
import {ShoppingCart} from "@/entites/Props/ShoppingCart";
import {Minus, Plus, ShoppingBag, Trash2, AlertTriangle} from "lucide-react";
import formatCurrency from "@/unit/unit";
import {
    loadListFromLocalStorage,
    removeProduction,
    updateProduction,
    addProduction
} from "@/store/ShoppingCart";
import {ConfimOrder} from "@/app/features/components/ConfimOrder";
import {SHOPPING_CARTS} from "@/key-store";
import {checkTable, ErroTable} from "@/api/TableApi";
import {useCheckTable, useGetTable} from "@/hooks/customHooks/useTableHooks";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";
import {useRouter} from "next/navigation";
import {MobileDialogB2} from "@/components/common/MobileDialogB2";
import {useTableContext} from "@/hooks/context/Context";
import {Table} from "@/entites/respont/Table";

type DetailType = {
    shc: ShoppingCart;
    quantity: number;
};

const DeleteConfirmModal: React.FC<{
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    itemName: string;
}> = ({isOpen, onConfirm, onCancel, itemName}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60]">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={onCancel}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="h-10 w-10 rounded-2xl bg-red-50 grid place-items-center border border-red-100">
                                <AlertTriangle className="h-5 w-5 text-red-600"/>
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base font-extrabold text-gray-900">Xác nhận xóa</h3>
                                <p className="text-xs text-gray-500">Thao tác này không thể hoàn tác</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">
                            Bạn có chắc muốn xóa{" "}
                            <span className="font-bold text-gray-900">"{itemName}"</span>{" "}
                            khỏi giỏ hàng?
                        </p>

                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={onCancel}
                                className="
                  flex-1 h-11 rounded-2xl
                  border border-gray-200
                  text-gray-700 font-bold
                  hover:bg-gray-50 active:scale-[0.99]
                  transition
                "
                            >
                                Hủy
                            </button>
                            <button
                                onClick={onConfirm}
                                className="
                  flex-1 h-11 rounded-2xl
                  bg-red-600 text-white font-bold
                  hover:bg-red-700 active:scale-[0.99]
                  transition shadow-lg shadow-red-600/15
                "
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface Props {
    onChange: (tab: "food" | "ordered") => void;
}

export const ShoppingCartList: React.FC<Props> = ({onChange}) => {
    const [detail, setDetail] = useState<DetailType[] | undefined>();
    const [cartItems, setCartItems] = useState<ShoppingCart[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(false);
    const [mess, setMess] = useState<string>("");
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        itemId: string;
        itemName: string;
    }>({isOpen: false, itemId: "", itemName: ""});
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    const [openTableInvalid, setOpenTableInvalid] = useState<boolean>(false);
    const {run: runCheckTable} = useCheckTable();
    const {deviceToken} = useDeviceToken();
    const router = useRouter();
    const {run} = useGetTable();
    const {tableId, setTable} = useTableContext();

    useEffect(() => {
        (async () => {
            if (!deviceToken) return;

            try {
                const res: Table | ErroTable = await run(tableId, deviceToken);
                if ("id" in res) {
                    setTable(res.id, res.status, res.name);
                }
            } catch {
            }
        })();
    }, [tableId, deviceToken]);

    const calculateItemTotal = (item: DetailType) => {
        let sum = 0;
        sum += item.shc.size.price * item.quantity;
        item.shc.toppings.forEach(value => (sum += value.price * item.quantity));
        return sum;
    };

    const calculateGrandTotal = () => {
        if (detail) return detail.reduce((sum, item) => sum + calculateItemTotal(item), 0);
        return 0;
    };

    const handleRemove = useCallback(async (id: string) => {
        try {
            setIsRemoving(id);

            const currentItems = loadListFromLocalStorage<ShoppingCart>(SHOPPING_CARTS);

            const indexes = currentItems
                .map((item, index) => (item.id === id ? index : -1))
                .filter(index => index !== -1)
                .sort((a, b) => b - a);

            indexes.forEach(index => {
                removeProduction<ShoppingCart>(SHOPPING_CARTS, index);
            });

            const updatedItems = loadListFromLocalStorage<ShoppingCart>(SHOPPING_CARTS);
            setCartItems(updatedItems);
        } finally {
            setIsRemoving(null);
        }
    }, []);

    const handleQuantityChange = useCallback((itemDetail: DetailType, isIncrease: boolean) => {
        const currentItems = loadListFromLocalStorage<ShoppingCart>(SHOPPING_CARTS);

        if (isIncrease) {
            addProduction<ShoppingCart>(SHOPPING_CARTS, itemDetail.shc);
        } else {
            const targetItem = itemDetail.shc;
            let toppingString = "";
            targetItem.toppings.forEach(value => {
                toppingString += `${value.id}+${value.quantity}-`;
            });
            const targetKey = `${targetItem.id}_${targetItem.size.id}_${toppingString}_${targetItem.note}`;

            const indexToRemove = currentItems.findIndex(item => {
                let itemToppingString = "";
                item.toppings.forEach(value => {
                    itemToppingString += `${value.id}+${value.quantity}-`;
                });
                const itemKey = `${item.id}_${item.size.id}_${itemToppingString}_${item.note}`;
                return itemKey === targetKey;
            });

            if (indexToRemove !== -1) {
                removeProduction<ShoppingCart>(SHOPPING_CARTS, indexToRemove);
            }
        }

        const updatedItems = loadListFromLocalStorage<ShoppingCart>(SHOPPING_CARTS);
        setCartItems(updatedItems);
    }, []);

    const initiateDelete = (id: string, name: string) => {
        setDeleteConfirm({isOpen: true, itemId: id, itemName: name});
    };

    const confirmDelete = () => {
        handleRemove(deleteConfirm.itemId);
        setDeleteConfirm({isOpen: false, itemId: "", itemName: ""});
    };

    const cancelDelete = () => {
        setDeleteConfirm({isOpen: false, itemId: "", itemName: ""});
    };

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
        if (cartItems.length > 0) setDetail(countShoppingCart(cartItems));
        else setDetail(undefined);
    }, [cartItems]);

    const remoteItemTopping = (index: number, topping: string, isAdd: boolean) => {
        setCartItems(prevState => {
            const updatedItems = prevState.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        toppings: item.toppings.map(t =>
                            t.id === topping ? {...t, quantity: Math.max(isAdd ? t.quantity + 1 : t.quantity - 1, 0)} : t
                        )
                    }
                    : item
            );
            const updatedItem = updatedItems[index];
            if (updatedItem) updateProduction<ShoppingCart>(SHOPPING_CARTS, updatedItem, index);
            return updatedItems;
        });
    };

    const load = useCallback(() => {
        const data = loadListFromLocalStorage<ShoppingCart>(SHOPPING_CARTS);
        setCartItems(data);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (detail) setTotalPrice(calculateGrandTotal());
    }, [detail]);

    const handleCheck = async (): Promise<boolean> => {
        if (!tableId) return false;
        if (!deviceToken) return false;

        try {
            const res = await runCheckTable(tableId, deviceToken);
            setMess(res.message);
            return res.data.isMatch;
        } catch {
            setMess("Mạng yếu không thể thực hiện thao tác tiếp theo");
            return false;
        }
    };

    const check = async () => {
        const isTableValid = await handleCheck();
        if (!isTableValid) {
            setOpenTableInvalid(true);
            return;
        }
        setOpen(true);
    };

    const handleTableInvalidConfirm = () => {
        setOpenTableInvalid(false);
        router.push(`/${tableId}`);
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                    <h2 className="text-xl font-extrabold text-gray-700 mb-1">Giỏ hàng trống</h2>
                    <p className="text-gray-500 text-sm">Thêm sản phẩm để bắt đầu mua sắm</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100">
                    <div className="px-4 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-extrabold text-gray-900">
                                Giỏ hàng <span className="text-gray-400 font-bold">({cartItems.length})</span>
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">Kiểm tra số lượng & topping trước khi gọi
                                món</p>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium">Tổng cộng</p>
                            <p className="text-lg font-extrabold text-green-600">
                                {formatCurrency(calculateGrandTotal())}
                            </p>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="px-4 py-4 space-y-4 pb-28">
                    {detail &&
                        detail.map((item, index) => (
                            <div
                                key={`${item.shc.id}-${index}`}
                                className={`rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden transition-all ${
                                    isRemoving === item.shc.id ? "opacity-50 pointer-events-none" : ""
                                }`}
                            >
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                                            <img
                                                src={item.shc.urlImg}
                                                alt={item.shc.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="font-extrabold text-gray-900 text-base leading-tight truncate">
                                                        {item.shc.name}
                                                    </h3>

                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                          {item.shc.size.name}
                                                        </span>
                                                        <span className="text-sm font-bold text-gray-700">
                                                          {formatCurrency(item.shc.size.price)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => initiateDelete(item.shc.id, item.shc.name)}
                                                    disabled={isRemoving === item.shc.id}
                                                    className="h-9 w-9 rounded-2xl grid place-items-center
                                                             text-gray-400 hover:text-red-600 hover:bg-red-50
                                                             border border-transparent hover:border-red-100
                                                             transition active:scale-[0.98] disabled:opacity-50"
                                                    title="Xóa khỏi giỏ hàng"
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleQuantityChange(item, false)}
                                                        disabled={item.quantity <= 1}
                                                        className={`
                                                                  h-10 w-10 rounded-2xl border transition active:scale-95
                                                                  ${item.quantity <= 1 ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"
                                                            : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"}
                                                                `}
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            <Minus className="w-4 h-4"/>
                                                        </div>
                                                    </button>

                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        min={1}
                                                        max={20}
                                                        onChange={(e) => {
                                                            let newVal = Number(e.target.value);
                                                            if (isNaN(newVal)) return;
                                                            if (newVal < 1) newVal = 1;
                                                            if (newVal > 20) newVal = 20;

                                                            const oldVal = item.quantity;
                                                            if (newVal === oldVal) return;

                                                            if (newVal > oldVal) {
                                                                for (let i = 0; i < newVal - oldVal; i++) handleQuantityChange(item, true);
                                                            } else {
                                                                for (let i = 0; i < oldVal - newVal; i++) handleQuantityChange(item, false);
                                                            }
                                                        }}
                                                        className="
                                                                  w-14 h-10 rounded-2xl
                                                                  border border-gray-200
                                                                  text-center font-extrabold text-base text-gray-900
                                                                  focus:outline-none focus:ring-2 focus:ring-green-400
                                                                  transition
                                                                "
                                                    />

                                                    <button
                                                        onClick={() => handleQuantityChange(item, true)}
                                                        disabled={item.quantity >= 20}
                                                        className={`
                                                                      h-10 w-10 rounded-2xl transition active:scale-95
                                                                      ${item.quantity >= 20
                                                            ? "bg-green-200 text-white cursor-not-allowed opacity-60"
                                                            : "bg-green-600 hover:bg-green-700 text-white shadow-sm"}
                                                                    `}
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            <Plus className="w-4 h-4"/>
                                                        </div>
                                                    </button>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-xs text-gray-500 font-medium">Tạm tính</div>
                                                    <div className="text-sm font-extrabold text-green-600">
                                                        {formatCurrency(item.shc.size.price * item.quantity)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Note */}
                                            {item.shc.note && (
                                                <div
                                                    className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2">
                                                    <span
                                                        className="text-sm text-gray-600 italic">📝 {item.shc.note}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {item.shc.toppings.length > 0 && (
                                    <div className="px-4 pb-4">
                                        <div className="border-t border-gray-100 pt-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-extrabold text-gray-900">Topping</p>
                                                <p className="text-xs text-gray-500">Tự nhân theo số lượng món</p>
                                            </div>
                                            <div className="space-y-2">
                                                <ToppingCartList
                                                    quantity={item.quantity}
                                                    item={item.shc}
                                                    index={index}
                                                    removeToppingFromItem={remoteItemTopping}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-600">Tổng món này</span>
                                        <span className="text-base font-extrabold text-gray-900">
                                          {formatCurrency(calculateItemTotal(item))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>

                <div className="fixed bottom-0 left-0 right-0 z-20">
                    <div className="bg-white/95 backdrop-blur border-t border-gray-200">
                        <div className="px-4 py-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Tổng cộng</div>
                                    <div className="text-2xl font-extrabold text-green-600">
                                        {formatCurrency(calculateGrandTotal())}
                                    </div>
                                </div>
                                <div className="text-right text-xs text-gray-500">
                                    <div>Tạm tính: <span
                                        className="font-bold text-gray-700">{formatCurrency(totalPrice)}</span></div>
                                </div>
                            </div>

                            <ActionButtons handle={check}/>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={deleteConfirm.isOpen}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                itemName={deleteConfirm.itemName}
            />

            <ConfimOrder onChange={onChange} ShoppingCart={undefined} isOpen={open} onClose={() => setOpen(false)}/>

            <MobileDialogB2
                isOpen={openTableInvalid}
                onClose={handleTableInvalidConfirm}
                leftConten="Đồng ý"
                rigttConten=""
                leftClick={handleTableInvalidConfirm}
                rightClick={() => {
                }}
                status="warning"
                message={mess}
            />
        </>
    );
};

const ActionButtons: React.FC<{ handle: () => void }> = ({handle}) => {
    return (
        <div className="flex gap-3">
            <button
                onClick={handle}
                className="
                          flex-1 h-12 rounded-2xl
                          bg-green-600 text-white font-extrabold
                          hover:bg-green-700 active:scale-[0.99]
                          transition shadow-lg shadow-green-600/20
                          flex items-center justify-center gap-2
                        "
            >
                <ShoppingBag className="w-5 h-5"/>
                Gọi Món
            </button>
        </div>
    );
};

const ToppingCartList: React.FC<{
    item: ShoppingCart;
    index: number;
    removeToppingFromItem: (index: number, idTopping: string, isAdd: boolean) => void;
    quantity: number;
}> = ({item, quantity}) => {
    return (
        <>
            {item.toppings.map((topping) => (
                <div
                    key={topping.id}
                    className="flex items-center justify-between rounded-2xl bg-white border border-gray-100 px-3 py-2"
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <div
                            className="w-9 h-9 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                            <img
                                src={topping.imgUrl}
                                alt={topping.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-sm font-bold text-gray-800 truncate">{topping.name}</span>
                    </div>

                    <div className="text-right shrink-0">
                        <div className="text-sm font-extrabold text-green-600">
                            {formatCurrency(topping.price * quantity)}
                        </div>
                        <div className="text-xs font-bold text-gray-500">
                            x{topping.quantity * quantity}
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};
