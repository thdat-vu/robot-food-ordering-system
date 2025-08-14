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
import {SHOPPING_CARTS} from "@/key-store";

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
    const [quanlityPr, setQuanlityPr] = useState<number>(1)

    const [selectedToppings, setSelectedToppings] = useState<{
        [key: string]: { name: string, price: number, quanlity: number }
    }>({});
    const context = useProductContext();
    const tableId = useTableContext();
    const {size_name, name, size, price, urlImg} = context;
    const [open, setOpen] = useState<boolean>(false);
    const [res, setRes] = useState<ShoppingCart[]>()
    const [totalPrice, setTotalPrice] = useState<number>(0);

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

    useEffect(() => {
        const x = () => {
            return Object.values(selectedToppings).reduce((sum, topping) => {
                return sum + (topping.price * topping.quanlity);
            }, 0);
        }
        const sum = x();
        setTotalPrice(sum);

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


        switch (content) {
            case 'Gọi món ngay' :
                setRes(Array(quanlityPr).fill(temp));
                setOpen(true);
                break;
            case 'Lưu võ hàng':
                var a = Array(quanlityPr).fill(temp);
                a.forEach(value => {
                    addProduction<ShoppingCart>(SHOPPING_CARTS, value);
                })
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
                title="Tùy chỉnh món ăn"
                isOpen={isOpen}
                onClose={onClose}
            >
                <div className="px-5 pb-6 bg-white">
                    {/* Header section */}
                    <div className="mb-5 p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Size đã chọn:</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-emerald-700">{size_name}</span>
                                <span className="font-bold text-gray-900">{formatCurrency(price)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Product quantity */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Số lượng</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setQuanlityPr(Math.max(1, quanlityPr - 1))}
                                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-emerald-500 transition-colors active:scale-95"
                                >
                                    <Minus className="w-4 h-4 text-gray-600"/>
                                </button>

                                <span className="w-10 text-center font-semibold text-lg text-gray-800">
                                        {quanlityPr}
                                    </span>

                                <button
                                    onClick={() => setQuanlityPr(quanlityPr + 1)}
                                    className="w-10 h-10 rounded-full border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors active:scale-95"
                                >
                                    <Plus className="w-4 h-4 text-white"/>
                                </button>
                            </div>

                            <div className="text-emerald-600 font-bold">
                                {formatCurrency(price * quanlityPr)}
                            </div>
                        </div>
                    </div>

                    {/* Toppings section */}
                    {!loadinggetToppingsForProduct && data.length > 0 && (
                        <div className="space-y-4 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Topping (tùy chọn)</h3>

                            {data.map((topping) => {
                                const toppingData = selectedToppings[topping.id];
                                const quantity = toppingData ? toppingData.quanlity : 0;

                                return (
                                    <div key={topping.id}
                                         className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{topping.name}</h4>
                                                <p className="text-emerald-600 font-bold mt-1">
                                                    +{formatCurrency(topping.price)}
                                                </p>
                                            </div>

                                            {topping.imageUrl && (
                                                <div className="ml-4">
                                                    <div
                                                        className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border">
                                                        <img
                                                            src={topping.imageUrl}
                                                            alt={topping.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => updateToppingQuantity(topping.id, -1 * quanlityPr, topping.name, topping.price * quanlityPr)}
                                                    disabled={quantity === 0}
                                                    className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-40 hover:border-emerald-500 transition-colors active:scale-95"
                                                >
                                                    <Minus className="w-4 h-4 text-gray-600"/>
                                                </button>

                                                <span
                                                    className={`w-8 text-center font-semibold text-lg ${quantity > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                        {quantity}
                                                    </span>

                                                <button
                                                    onClick={() => updateToppingQuantity(topping.id, quanlityPr, topping.name, topping.price * quanlityPr)}
                                                    className="w-9 h-9 rounded-full border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors active:scale-95"
                                                >
                                                    <Plus className="w-4 h-4 text-white"/>
                                                </button>
                                            </div>

                                            {quantity > 0 && (
                                                <div className="flex items-center text-emerald-600 font-medium">
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

                    {(Object.keys(selectedToppings).length > 0 || quanlityPr > 1) && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3">Tóm tắt đơn hàng</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm py-1">
                                    <span className="text-gray-600">{name} ({size_name}) × {quanlityPr}</span>
                                    <span
                                        className="font-medium text-gray-800">{formatCurrency(price * quanlityPr)}</span>
                                </div>

                                {Object.entries(selectedToppings).map(([toppingId, toppingData]) => (
                                    <div key={toppingId} className="flex justify-between text-sm py-1">
                                            <span
                                                className="text-gray-600">{toppingData.name} × {toppingData.quanlity}</span>
                                        <span className="font-medium text-gray-800">
                                                +{formatCurrency(toppingData.price * toppingData.quanlity / quanlityPr)}
                                            </span>
                                    </div>
                                ))}

                            </div>
                        </div>
                    )}

                    {/* Note section */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú cho món ăn
                        </label>
                        <div className="relative">
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Ví dụ: Ít đá, không đường, thêm tương ớt..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-700"
                                    rows={3}
                                    maxLength={200}
                                />
                            <div className="absolute bottom-2 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                                {note.length}/200
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3.5 px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-md hover:shadow-lg"
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