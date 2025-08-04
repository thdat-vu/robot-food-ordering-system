import React, {useEffect, useMemo, useState} from "react";
import {BottomModal} from "@/components/common/BottomModal";
import {useGetToppingForProduct} from "@/hooks/customHooks/userTopingHooks";
import {ToppingProduct} from "@/entites/respont/Topping";
import formatCurrency from "@/unit/unit";
import {Check, Minus, Plus} from "lucide-react";
import {useProductContext} from "@/hooks/context/ContextProduct";
import {ShoppingCart, Topping} from "@/entites/Props/ShoppingCart";
import {addProduction} from "@/store/ShoppingCart";
import {useTableContext} from "@/hooks/context/Context";
import {ConfimOrder} from "@/app/features/components/ConfimOrder";

type ChoceTopingProps = {
    id: string;
    isOpen: boolean;
    onClose: () => void;
    id_size: string;
    content: string;
}

export const ChoceToping: React.FC<ChoceTopingProps> = ({
                                                            isOpen,
                                                            onClose,
                                                            content = "Gọi món ngay",
                                                            id_size,
                                                            id
                                                        }) => {

    const [data, setData] = useState<ToppingProduct[]>([]);
    const [note, setNote] = useState<string>('')

    const [selectedToppings, setSelectedToppings] = useState<{
        [key: string]: { name: string, price: number, quanlity: number }
    }>({});

    const context = useProductContext();
    const tableId = useTableContext();
    const {size_name, name, size, price, urlImg} = context;
    const [open, setOpen] = useState<boolean>(false);
    const [res, setRes] = useState<ShoppingCart>()

    const {
        run: runGetToppingForProduct,
        loading: loadinggetToppingsForProduct,
        data: dataToppings
    } = useGetToppingForProduct();


    useEffect(() => {
        (async () => {
            await runGetToppingForProduct(id);
        })()
    }, [id]);

    useEffect(() => {
        if (dataToppings)
            setData(dataToppings.data)
    }, [dataToppings]);

    const totalPrice = useMemo(() => {
        return Object.values(selectedToppings).reduce((sum, topping) => {
            return sum + (topping.price * topping.quanlity);
        }, 0);
    }, [selectedToppings]);

    const updateToppingQuantity = (
        toppingId: string,
        change: number,
        name: string,
        price: number
    ) => {
        setSelectedToppings(prev => {
            const current = prev[toppingId];
            const currentQuantity = current ? current.quanlity : 0;
            const newQuantity = Math.max(0, currentQuantity + change);

            if (newQuantity === 0) {
                const {[toppingId]: _, ...rest} = prev;
                return rest;
            }

            return {
                ...prev,
                [toppingId]: {
                    name,
                    price,
                    quanlity: newQuantity
                }
            };
        });
    };

    const handleSave = () => {
        const toppingsArray: Topping[] = Object.entries(selectedToppings).map(([id, topping]) => {
            const originalTopping = data.find(t => t.id === id);

            return {
                id,
                name: topping.name,
                price: topping.price,
                quantity: topping.quanlity,
                imgUrl: originalTopping?.imageUrl || ''
            };
        });

        const temp: ShoppingCart = {
            size: {id: size, name: size_name, price: price},
            urlImg: urlImg,
            name: name,
            id: id,
            toppings: toppingsArray,
            note: note
        };

        console.log(temp);

        switch (content) {
            case 'Gọi món ngay' :
                console.log(temp)
                setRes(temp);
                setOpen(true);
                break;
            case 'Lưu võ hàng':
                addProduction<ShoppingCart>("shopping-carts", temp);
                const d = localStorage.getItem("shopping-cart");
                console.log(d);
                break;
            default:
                break;
        }
        onClose();
    };


    return (
        <>
            <BottomModal
                id={id}
                title="Chọn topping"
                isOpen={isOpen}
                onClose={onClose}
            >
                <div className="px-6 pb-6 bg-white">
                    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Size đã chọn:</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-green-700">{size_name}</span>
                                <span className="font-bold text-gray-900">{formatCurrency(price)}</span>
                            </div>
                        </div>
                    </div>

                    {loadinggetToppingsForProduct && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        </div>
                    )}

                    {!loadinggetToppingsForProduct && data.length > 0 && (
                        <div className="space-y-4 mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Chọn topping (tùy chọn)</h3>

                            {data.map((topping) => {
                                const toppingData = selectedToppings[topping.id];
                                const quantity = toppingData ? toppingData.quanlity : 0;

                                return (
                                    <div key={topping.id}
                                         className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{topping.name}</h4>

                                                <p className="text-green-600 font-bold mt-2">
                                                    {formatCurrency(topping.price)}
                                                </p>
                                            </div>

                                            {topping.imageUrl && (
                                                <div className="w-16 h-16 ml-4 rounded-lg overflow-hidden bg-gray-100">
                                                    <img
                                                        src={topping.imageUrl}
                                                        alt={topping.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => updateToppingQuantity(topping.id, -1, topping.name, topping.price)}
                                                    disabled={quantity === 0}
                                                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-500 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4 text-gray-600"/>
                                                </button>

                                                <span className="w-8 text-center font-semibold text-lg">
                                                    {quantity}
                                                </span>

                                                <button
                                                    onClick={() => updateToppingQuantity(topping.id, 1, topping.name, topping.price)}
                                                    className="w-8 h-8 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4 text-white"/>
                                                </button>
                                            </div>

                                            {quantity > 0 && (
                                                <div className="flex items-center text-green-600">
                                                    <Check className="w-4 h-4 mr-1"/>
                                                    <span className="font-semibold">
                                                        {formatCurrency(topping.price * quantity)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!loadinggetToppingsForProduct && data.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Không có topping nào khả dụng</p>
                        </div>
                    )}

                    {Object.keys(selectedToppings).length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Tóm tắt đơn hàng</h4>
                            <div className="space-y-2">
                                {/* Base Product */}
                                <div className="flex justify-between text-sm">
                                    <span>{name} ({size_name})</span>
                                    <span className="font-semibold">{formatCurrency(price)}</span>
                                </div>

                                {Object.entries(selectedToppings).map(([toppingId, toppingData]) => (
                                    <div key={toppingId} className="flex justify-between text-sm">
                                        <span>{toppingData.name} x {toppingData.quanlity}</span>
                                        <span className="font-semibold">
                                            {formatCurrency(toppingData.price * toppingData.quanlity)}
                                        </span>
                                    </div>
                                ))}

                                <div className="border-t border-gray-200 pt-2 mt-3">
                                    <div className="flex justify-between font-bold">
                                        <span>Tổng cộng:</span>
                                        <span className="text-green-600">
                                            {formatCurrency(price + totalPrice)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Note Input Section */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú (tùy chọn)
                        </label>
                        <textarea
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="Thêm ghi chú cho đơn hàng của bạn..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                            rows={3}
                            maxLength={200}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">
                                Ví dụ: Ít đá, nhiều đường, không khuấy...
                            </span>
                            <span className="text-xs text-gray-400">
                                {note.length}/200
                            </span>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                        >
                            {content}
                        </button>
                    </div>
                </div>
            </BottomModal>
            <ConfimOrder ShoppingCart={res} isOpen={open} onClose={() => setOpen(false)}/>
        </>
    );
};