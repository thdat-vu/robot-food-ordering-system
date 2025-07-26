"use client"
import React, {useEffect, useState} from "react";
import {ShoppingCart, Topping} from "@/entites/Props/ShoppingCart";
import {Minus, ShoppingBag, Trash2} from "lucide-react";
import formatCurrency, {totolPrice} from "@/unit/unit";
import {
    loadListFromLocalStorage,
    removeProduction,
    updateProduction
} from "@/store/ShoppingCart";
import {IoMdAdd} from "react-icons/io";
import {ConfimOrder} from "@/app/features/components/ConfimOrder";

export const ShoppingCartList: React.FC = () => {


    const [cartItems, setCartItems] = useState<ShoppingCart[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(false)


    const calculateItemTotal = (item: ShoppingCart) => {
        const toppingsTotal = item.toppings.reduce((sum, topping) => sum + topping.price, 0);
        return item.size.price + toppingsTotal;
    };


    const calculateGrandTotal = () => {
        return cartItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    };


    const removeItem = (index: number) => {

        setCartItems(prevState => prevState.filter((_, index1) => index1 !== index))
        removeProduction("shopping-carts", index)
    }


    const remoteItemToping = (index: number, topping: string, isAdd: boolean) => {
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
                    }
                    : item
            );
            const updatedItem = updatedItems[index];
            if (updatedItem) updateProduction("shopping-carts", updatedItem, index);
            return updatedItems;
        });
    };


    useEffect(() => {
        const data = loadListFromLocalStorage<ShoppingCart>("shopping-carts");
        setCartItems(data);
    }, []);


    useEffect(() => {
        (() => {
            let sum = totolPrice(cartItems);
            setTotalPrice(sum);
        })()
    }, [cartItems]);

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
                    {cartItems.map((item, index) => (
                        <div key={index}
                             className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-start space-x-3">

                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img
                                            src={item.urlImg}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 text-base leading-tight">
                                                    {item.name}
                                                </h3>
                                                <div className="mt-1 flex items-center">
                                                <span
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {item.size.name}
                                                </span>
                                                    <span className="ml-2 text-sm font-medium text-gray-600">
                                                    {formatCurrency(item.size.price)}
                                                </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => removeItem(index)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>


                                </div>
                            </div>


                            {item.toppings.length > 0 && (
                                <div className="px-4 pb-4">
                                    <div className="border-t border-gray-100 pt-3">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Topping:</p>
                                        <div className="space-y-2">
                                            <ToppingCartList item={item} index={index}
                                                             removeToppingFromItem={remoteItemToping}/>
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
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Phí giao hàng:</span>
                            <span className="font-medium text-green-600">Miễn phí</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2">
                            <div className="flex justify-between">
                                <span className="text-base font-semibold text-gray-900">Tổng cộng:</span>
                                <span className="text-lg font-bold text-green-600">
                                {formatCurrency(totalPrice)}
                            </span>
                            </div>
                        </div>
                    </div>

                    <ActionButtons handle={() => setOpen(true)}/>
                </div>
            </div>
            <ConfimOrder isOpen={open} onClose={() => setOpen(false)}/>
        </>
    );
};


const ActionButtons: React.FC<{ handle: () => void }> = ({handle}) => {
    return (
        <>
            <div className="flex space-x-3">
                {/*<button*/}
                {/*    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">*/}
                {/*    Tiếp tục mua*/}
                {/*</button>*/}
                <button
                    onClick={handle}
                    className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
                    Gọi Món
                </button>
            </div>
        </>
    )
}

const ToppingCartList: React.FC<{
    item: ShoppingCart,
    index: number;
    removeToppingFromItem: (index: number, idTopping: string, isAdd: boolean) => void
}> = ({item, index, removeToppingFromItem}) => {
    return (
        <>
            {item.toppings.map((topping) => (
                <div key={topping.id}
                     className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                        <div
                            className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
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
                                                        {formatCurrency(topping.price * topping.quantity)}
                                                    </span>
                        <button
                            onClick={() => removeToppingFromItem(index, topping.id, false)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Minus className="w-3 h-3"/>
                        </button>

                        <span className="text-sm font-semibold text-green-600">
                                                        {topping.quantity}
                                                    </span>

                        <button
                            onClick={() => removeToppingFromItem(index, topping.id, true)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <IoMdAdd className="w-3 h-3"/>
                        </button>
                    </div>
                </div>
            ))}
        </>
    )
}