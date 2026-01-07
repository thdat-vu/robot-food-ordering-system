import React, {useEffect, useMemo, useState} from "react";
import {BottomModal} from "@/components/common/BottomModal";
import {useGetToppingForProduct} from "@/hooks/customHooks/userTopingHooks";
import {ToppingProduct} from "@/entites/respont/Topping";
import formatCurrency from "@/unit/unit";
import {Check, Minus, Plus, ShoppingBag} from "lucide-react";
import {useProductContext} from "@/hooks/context/ContextProduct";
import {ShoppingCart, Topping} from "@/entites/Props/ShoppingCart";
import {addProduction} from "@/store/ShoppingCart";
import {useTableContext} from "@/hooks/context/Context";
import {ConfimOrder} from "@/app/features/components/ConfimOrder";
import {SHOPPING_CARTS} from "@/key-store";
import {MobileDialog} from "@/components/common/MobileDialog";
import {useRouter} from "next/navigation";
import {MobileDialogB2} from "@/components/common/MobileDialogB2";
import {useCheckTable} from "@/hooks/customHooks/useTableHooks";
import {BaseEntityResponse_v2} from "@/entites/BaseEntity";
import {checkTable} from "@/api/TableApi";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";

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
    const [quanlityPr, setQuanlityPr] = useState<number>(1);
    const {run} = useCheckTable();

    const [selectedToppings, setSelectedToppings] = useState<{
        [key: string]: { name: string, price: number, quanlity: number }
    }>({});
    const context = useProductContext();
    const {tableId} = useTableContext();
    const {size_name, name, size, price, urlImg} = context;
    const [open, setOpen] = useState<boolean>(false);
    const [res, setRes] = useState<ShoppingCart[]>()
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const router = useRouter();
    const {deviceToken} = useDeviceToken();

    const [openConfin, setOpenConfin] = useState<boolean>(false);
    const [dataDialog, setDataDialog] = useState<{ status: boolean, text: string }>()

    const [openTableInvalid, setOpenTableInvalid] = useState<boolean>(false);
    const [mess, setMess] = useState<string>("")


    const {
        run: runGetToppingForProduct,
        loading: loadinggetToppingsForProduct,
        data: dataToppings
    } = useGetToppingForProduct();

    // Hàm chuyển đổi tên size thành ký hiệu
    const getSizeSymbol = (sizeName: string): string => {
        const lowerName = sizeName.toLowerCase();
        if (lowerName.includes('Large') || lowerName.includes('lớn')) return 'L';
        if (lowerName.includes('medium') || lowerName.includes('vừa')) return 'M';
        if (lowerName.includes('Small') || lowerName.includes('nhỏ')) return 'S';
        return sizeName.charAt(0).toUpperCase();
    };

    const handleCheck = async (): Promise<boolean> => {
        if (!tableId) return false;
        if (!deviceToken) return false;

        try {
            const res: BaseEntityResponse_v2<checkTable> = await run(tableId, deviceToken);
            console.log(res)
            setMess(res.message)
            return res.data.isMatch;
        } catch (error) {
            setMess("Mạng yếu không thể thực hiện thao tác tiếp theo")
            return false;
        }
    }

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

    const handleSave = async () => {
        // Kiểm tra bàn còn hiệu lực không
        const isTableValid = await handleCheck();


        if (!isTableValid) {
            // Bàn không còn hiệu lực - hiển thị dialog cảnh báo
            setOpenTableInvalid(true);
            onClose();
            return;
        }

        // Bàn còn hiệu lực - tiếp tục xử lý
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
            case 'Gọi món ngay':
                setRes(Array(quanlityPr).fill(temp));
                setOpen(true);
                break;
            case 'Lưu giỏ hàng':
                const items = Array(quanlityPr).fill(temp);
                items.forEach(value => {
                    addProduction<ShoppingCart>(SHOPPING_CARTS, value);
                });
                setDataDialog({status: true, text: "Thêm giỏ hàng thành công"});
                setOpenConfin(true);
                break;
            default:
                break;
        }
        onClose();
    };

    // Tính tổng tiền
    const calculateTotal = () => {
        const productTotal = price * quanlityPr;
        const toppingsTotal = Object.values(selectedToppings).reduce((sum, topping) => {
            return sum + (topping.price * topping.quanlity);
        }, 0);
        return productTotal + toppingsTotal;
    };

    // Xử lý khi bàn không còn hiệu lực
    const handleTableInvalidConfirm = () => {
        setOpenTableInvalid(false);
        onClose();
        router.push(`/${tableId}`);
    };

    return (
        <>
            {/* Dialog cảnh báo bàn không còn hiệu lực */}
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

            {/* Dialog thêm giỏ hàng thành công */}
            {dataDialog && (
                <MobileDialogB2
                    isOpen={openConfin}
                    onClose={() => {
                        setOpenConfin(false);
                        router.back()
                    }}
                    leftConten="Có"
                    rigttConten="Không"
                    leftClick={() => router.back()}
                    rightClick={() => router.push(`/productions/order/${id}`)}
                    status={dataDialog.status ? "success" : "warning"}
                    message="Bạn có muốn gọi thêm món không?"
                />
            )}

            <BottomModal
                id={id}
                title="Tùy chỉnh món ăn"
                isOpen={isOpen}
                onClose={onClose}
            >
                <div className="px-5 pb-6 bg-white">

                    {/* Size Info Card */}
                    <div className="mb-6 p-4 bg-green-50 rounded-2xl border border-green-200">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">
                                Size đã chọn:
                            </span>
                            <span
                                className="font-bold text-green-600">{getSizeSymbol(size_name)}</span>
                            <span className="font-bold text-xl text-green-600">{formatCurrency(price)}</span>
                        </div>
                    </div>

                    {/* Product Quantity - Simple */}
                    <div className="mb-6 bg-white rounded-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-green-600"/>
                            Số lượng món
                        </h3>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuanlityPr(Math.max(1, quanlityPr - 1))}
                                    disabled={quanlityPr <= 1}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                                        quanlityPr <= 1
                                            ? 'bg-gray-100 cursor-not-allowed opacity-50'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                >
                                    <Minus className="w-5 h-5 text-gray-700"/>
                                </button>

                                <input
                                    type="number"
                                    value={quanlityPr}
                                    min={1}
                                    max={20}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "") {
                                            setQuanlityPr(1);
                                            return;
                                        }

                                        const num = Number(value);
                                        if (!isNaN(num)) {
                                            setQuanlityPr(num);
                                        }
                                    }}
                                    onBlur={() => {
                                        let value = Number(quanlityPr);

                                        if (isNaN(value) || value < 1) value = 1;
                                        if (value > 20) value = 20;

                                        setQuanlityPr(value);
                                    }}
                                    className="w-16 px-2 py-1 border rounded text-center text-lg font-semibold"
                                />


                                <button
                                    onClick={() => setQuanlityPr(Math.min(20, quanlityPr + 1))}
                                    disabled={quanlityPr >= 20}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                                        quanlityPr >= 20
                                            ? 'bg-green-300 cursor-not-allowed opacity-50'
                                            : 'bg-green-500 hover:bg-green-600'
                                    }`}
                                >
                                    <Plus className="w-5 h-5 text-white"/>
                                </button>
                            </div>

                            <div className="text-right">
                                <div className="text-xs text-gray-500 mb-1">Thành tiền</div>
                                <div className="text-xl font-bold text-green-600">
                                    {formatCurrency(price * quanlityPr)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Toppings Section - Simple */}
                    {!loadinggetToppingsForProduct && data.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Topping thêm</h3>

                            <div className="space-y-3">
                                {data.map((topping) => {
                                    const toppingData = selectedToppings[topping.id];
                                    const quantity = toppingData ? toppingData.quanlity : 0;

                                    return (
                                        <div
                                            key={topping.id}
                                            className="bg-gray-50 rounded-2xl p-4"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                {topping.imageUrl && (
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200">
                                                        <img
                                                            src={topping.imageUrl}
                                                            alt={topping.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{topping.name}</h4>
                                                    <span className="text-green-600 font-bold">
                                                        +{formatCurrency(topping.price)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">


                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() =>
                                                            updateToppingQuantity(
                                                                topping.id,
                                                                -1 * quanlityPr,
                                                                topping.name,
                                                                topping.price * quanlityPr
                                                            )
                                                        }
                                                        disabled={quantity === 0}
                                                        className={`
                                                                        w-10 h-10 rounded-xl
                                                                        flex items-center justify-center
                                                                        transition-all active:scale-95
                                                                        ${quantity === 0
                                                            ? 'bg-gray-100 cursor-not-allowed opacity-40'
                                                            : 'bg-white hover:bg-gray-100'}
                                                                    `}
                                                    >
                                                        <Minus className="w-4 h-4 text-gray-700"/>
                                                    </button>

                                                    {/* INPUT */}
                                                    <input
                                                        type="number"
                                                        value={quantity}
                                                        min={0}
                                                        max={20}
                                                        onChange={(e) => {
                                                            let newVal = Number(e.target.value);
                                                            if (isNaN(newVal)) return;

                                                            // clamp 0–20
                                                            if (newVal < 0) newVal = 0;
                                                            if (newVal > 20) newVal = 20;

                                                            const oldVal = quantity;
                                                            if (newVal === oldVal) return;

                                                            // tăng
                                                            if (newVal > oldVal) {
                                                                for (let i = 0; i < newVal - oldVal; i++) {
                                                                    updateToppingQuantity(
                                                                        topping.id,
                                                                        +1 * quanlityPr,
                                                                        topping.name,
                                                                        topping.price * quanlityPr
                                                                    );
                                                                }
                                                            }

                                                            // giảm
                                                            if (newVal < oldVal) {
                                                                for (let i = 0; i < oldVal - newVal; i++) {
                                                                    updateToppingQuantity(
                                                                        topping.id,
                                                                        -1 * quanlityPr,
                                                                        topping.name,
                                                                        topping.price * quanlityPr
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                        className={`
            w-12 h-10
            text-center font-bold text-lg
            border rounded-xl
            focus:outline-none focus:ring-2 focus:ring-green-400
            transition-all
            ${quantity > 0 ? 'text-green-600 border-green-300' : 'text-gray-400 border-gray-300'}
        `}
                                                    />

                                                    <button
                                                        onClick={() =>
                                                            updateToppingQuantity(
                                                                topping.id,
                                                                +1 * quanlityPr,
                                                                topping.name,
                                                                topping.price * quanlityPr
                                                            )
                                                        }
                                                        disabled={quantity >= 20}
                                                        className={`
            w-10 h-10 rounded-xl
            flex items-center justify-center
            transition-all active:scale-95
            ${quantity >= 20
                                                            ? 'bg-green-300 cursor-not-allowed opacity-50'
                                                            : 'bg-green-500 hover:bg-green-600'}
        `}
                                                    >
                                                        <Plus className="w-4 h-4 text-white"/>
                                                    </button>
                                                </div>


                                                {quantity > 0 && (
                                                    <div className="font-bold text-green-600">
                                                        {formatCurrency(topping.price * quantity)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Order Summary - Simple */}
                    {(Object.keys(selectedToppings).length > 0 || quanlityPr > 1) && (
                        <div className="mb-6 bg-gray-50 rounded-2xl p-4">
                            <h4 className="font-bold text-gray-900 mb-3">Chi tiết đơn hàng</h4>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">{name} ({size_name}) × {quanlityPr}</span>
                                    <span
                                        className="font-bold text-gray-900">{formatCurrency(price * quanlityPr)}</span>
                                </div>

                                {Object.entries(selectedToppings).map(([toppingId, toppingData]) => (
                                    <div key={toppingId} className="flex justify-between items-center text-sm">
                                        <span
                                            className="text-gray-600">+ {toppingData.name} × {toppingData.quanlity}</span>
                                        <span className="font-semibold text-gray-700">
                                            {formatCurrency(toppingData.price * toppingData.quanlity / quanlityPr)}
                                        </span>
                                    </div>
                                ))}

                                <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                                    <span className="font-bold text-gray-900">Tổng cộng</span>
                                    <span className="text-xl font-bold text-green-600">
                                        {formatCurrency(calculateTotal())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Note Section */}
                    <div className="mb-6">
                        <label className="block font-bold text-gray-900 mb-3">
                            Ghi chú cho món ăn
                        </label>
                        <div className="relative">
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Ví dụ: Ít đá, không đường, thêm tương ớt..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all placeholder-gray-400 text-gray-700"
                                rows={3}
                                maxLength={200}
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                {note.length}/200
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 px-4 border border-gray-300 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-[2] py-3.5 px-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-5 h-5"/>
                            <span>{content}</span>
                        </button>
                    </div>
                </div>
            </BottomModal>

            <ConfimOrder onChange={() => {
            }} ShoppingCart={res} isOpen={open} onClose={() => setOpen(false)}/>
        </>
    );
};