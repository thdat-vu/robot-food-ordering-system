"use client"
import React, {useCallback, useEffect, useState} from "react";
import {ShoppingCart, Topping} from "@/entites/Props/ShoppingCart";
import {Minus, ShoppingBag, Trash2, AlertTriangle} from "lucide-react";
import formatCurrency, {totolPrice} from "@/unit/unit";
import {
    loadListFromLocalStorage,
    removeProduction,
    updateProduction
} from "@/store/ShoppingCart";
import {ConfimOrder} from "@/app/features/components/ConfimOrder";
import {SHOPPING_CARTS} from "@/key-store";

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-red-600"/>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Xác nhận xóa
                            </h3>
                        </div>
                    </div>
                    <div className="mb-4">
                        <p className="text-sm text-gray-500">
                            Bạn có chắc chắn muốn xóa "<span className="font-medium text-gray-900">{itemName}</span>"
                            khỏi giỏ hàng không?
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ShoppingCartList: React.FC = () => {
    const [detail, setDetail] = useState<DetailType[] | undefined>()
    const [cartItems, setCartItems] = useState<ShoppingCart[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        itemId: string;
        itemName: string;
    }>({isOpen: false, itemId: '', itemName: ''});
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    const calculateItemTotal = (item: DetailType) => {
        let sum = 0;
        sum += item.shc.size.price * item.quantity;
        item.shc.toppings.forEach(value => sum += value.price * item.quantity);
        return sum;
    };

    const calculateGrandTotal = () => {
        if (detail)
            return detail.reduce((sum, item) => sum + calculateItemTotal(item), 0);
        return 0;
    };

    const handleRemove = useCallback(async (id: string) => {
        try {
            setIsRemoving(id);

            const currentItems = loadListFromLocalStorage<ShoppingCart>(SHOPPING_CARTS);

            const indexes = currentItems
                .map((item, index) => item.id === id ? index : -1)
                .filter(index => index !== -1)
                .sort((a, b) => b - a);

            indexes.forEach(index => {
                removeProduction<ShoppingCart>(SHOPPING_CARTS, index);
            });

            const updatedItems = loadListFromLocalStorage<ShoppingCart>(SHOPPING_CARTS);
            setCartItems(updatedItems);

        } catch (error) {
            console.error('Error removing item:', error);
        } finally {
            setIsRemoving(null);
        }
    }, []);

    const initiateDelete = (id: string, name: string) => {
        setDeleteConfirm({
            isOpen: true,
            itemId: id,
            itemName: name
        });
    };

    const confirmDelete = () => {
        handleRemove(deleteConfirm.itemId);
        setDeleteConfirm({isOpen: false, itemId: '', itemName: ''});
    };

    const cancelDelete = () => {
        setDeleteConfirm({isOpen: false, itemId: '', itemName: ''});
    };

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
        if (cartItems.length > 0) {
            const grouped = countShoppingCart(cartItems);
            setDetail(grouped);
        } else {
            setDetail(undefined);
        }
    }, [cartItems]);

    const remoteItemTopping = (index: number, topping: string, isAdd: boolean) => {
        setCartItems(prevState => {
            const updatedItems = prevState.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        toppings: item.toppings.map(t =>
                            t.id === topping
                                ? {...t, quantity: Math.max(isAdd ? t.quantity + 1 : t.quantity - 1, 0)}
                                : t
                        )
                    } : item
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
        if (detail) {
            let sum = calculateGrandTotal();
            setTotalPrice(sum);
        }
    }, [detail]);

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">Giỏ hàng trống</h2>
                    <p className="text-gray-400">Thêm sản phẩm để bắt đầu mua sắm</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="px-4 py-4 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900">
                            Giỏ hàng ({cartItems.length})
                        </h1>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Tổng cộng</p>
                            <p className="text-lg font-bold text-green-600">
                                {formatCurrency(calculateGrandTotal())}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 space-y-4">
                    {detail && detail.map((item, index) => (
                        <div key={`${item.shc.id}-${index}`}
                             className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 ${
                                 isRemoving === item.shc.id ? 'opacity-50 pointer-events-none' : ''
                             }`}>
                            <div className="p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img
                                            src={item.shc.urlImg}
                                            alt={item.shc.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 text-base leading-tight">
                                                    {item.shc.name}
                                                </h3>
                                                <div className="mt-1 flex items-center">
                                                    <span
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {item.shc.size.name} (x{item.quantity})
                                                    </span>
                                                    <span className="ml-2 text-sm font-medium text-gray-600">
                                                        {formatCurrency(item.shc.size.price * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => initiateDelete(item.shc.id, item.shc.name)}
                                                disabled={isRemoving === item.shc.id}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                                                title="Xóa khỏi giỏ hàng"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {item.shc.note && (
                                <div className="px-4 pb-2">
                                    <span className="text-sm text-gray-500 italic">📝 {item.shc.note}</span>
                                </div>
                            )}

                            {item.shc.toppings.length > 0 && (
                                <div className="px-4 pb-4">
                                    <div className="border-t border-gray-100 pt-3">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Topping:</p>
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
                                    <span className="text-sm font-medium text-gray-600">Tổng món này:</span>
                                    <span className="text-base font-bold text-gray-900">
                                        {formatCurrency(calculateItemTotal(item))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tạm tính ({cartItems.length} món):</span>
                            <span className="font-medium">{formatCurrency(totalPrice)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2">
                            <div className="flex justify-between">
                                <span className="text-base font-semibold text-gray-900">Tổng cộng:</span>
                                <span className="text-lg font-bold text-green-600">
                                    {formatCurrency(calculateGrandTotal())}
                                </span>
                            </div>
                        </div>
                    </div>

                    <ActionButtons handle={() => setOpen(true)}/>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteConfirm.isOpen}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                itemName={deleteConfirm.itemName}
            />

            <ConfimOrder ShoppingCart={undefined} isOpen={open} onClose={() => setOpen(false)}/>
        </>
    );
};

const ActionButtons: React.FC<{ handle: () => void }> = ({handle}) => {
    return (
        <div className="flex space-x-3">
            <button
                onClick={handle}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
                Gọi Món
            </button>
        </div>
    )
}

const ToppingCartList: React.FC<{
    item: ShoppingCart,
    index: number;
    removeToppingFromItem: (index: number, idTopping: string, isAdd: boolean) => void;
    quantity: number;
}> = ({item, index, removeToppingFromItem, quantity}) => {
    return (
        <>
            {item.toppings.map((topping) => (
                <div key={topping.id}
                     className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            <img
                                src={topping.imgUrl}
                                alt={topping.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">
                            {topping.name}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-green-600">
                            {formatCurrency(topping.price * quantity)}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                            (x{topping.quantity * quantity})
                        </span>
                    </div>
                </div>
            ))}
        </>
    )
}