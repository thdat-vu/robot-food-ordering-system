'use client'
import Button from "@/components/common/Button";
import React, {useCallback, useEffect, useState} from "react";
import {Star} from "lucide-react";
import {IoIosArrowBack} from "react-icons/io";
import {useRouter} from "next/navigation";
import {useGetProductionID} from "@/hooks/customHooks/useProductionHooks";
import formatCurrency, {CheckID} from "@/unit/unit";
import {ProductionDetail} from "@/entites/respont/Production";
import {Loading} from "@/components/common/Loading";
import {ChoceToping} from "@/components/common/ChoceToping";
import {useProductContext} from "@/hooks/context/ContextProduct";


export default function ProductionDetailPage({id}: { id: string }) {

    const router = useRouter();
    const [data, setData] = useState<ProductionDetail>();
    const [open, setOpent] = useState<boolean>(false);
    const [size, setSize] = useState<{ id: string, name: string, price: number }>();
    const [content, setContent] = useState<string>('')
    const context = useProductContext();
    const {setProduct, clearProduct} = context;


    const {
        data: dataProduct,
        loading: dataLoading,
        run: dataRun,
    } = useGetProductionID();

    console.log(dataProduct)


    useEffect(() => {
        (async () => {
            if (!CheckID(id)) {
                const confine = window.confirm("Sản phẩm không tồn tại");
                if (confine)
                    router.back();
            } else {
                await dataRun(id);
            }
        })()
    }, [id]);

    useEffect(() => {
        if (dataProduct?.data) {
            setData(dataProduct.data)
        }
    }, [dataProduct]);


    const handle = (id: string, name: string, urlImg: string) => {
        if (size)
            setProduct(id, name, urlImg, size?.price, size?.id, size?.name);
    }

    const handleClose = useCallback(() => {
        clearProduct();
        setOpent(false);
    }, [setProduct]);

    return (
        <>
            {
                dataLoading ? (
                    <Loading/>
                ) : data && data.name ?
                    (
                        <div className="mx-auto bg-white min-h-screen">
                            <div className="relative">
                                <button
                                    className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all duration-200"
                                    onClick={() => {
                                        router.back()
                                    }}
                                >
                                    <IoIosArrowBack className="text-black text-2xl"/>
                                </button>

                                <div className="w-full h-64 sm:h-80 md:h-96 overflow-hidden">
                                    <img
                                        src={data.urlImg}
                                        alt={data.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>


                            <div className="px-6 py-6 bg-white rounded-t-3xl -mt-6 relative z-10 shadow-lg">
                                <div className="mb-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 pr-4">
                                            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
                                                {data.name}
                                            </h1>
                                            <p className="text-gray-500 text-lg">With Chocolate</p>
                                        </div>

                                        <div className="flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                                            <Star className="w-5 h-5 fill-green-500 text-green-500"/>
                                            <span className="text-gray-700 font-medium">4.6 (1,250)</span>
                                        </div>
                                    </div>
                                </div>


                                <div className="flex items-center justify-between py-4 mb-6 border-b border-gray-100">
                                    <div className="text-4xl font-bold text-green-600">
                                        {formatCurrency(data.price)}
                                    </div>

                                    <Button
                                        className="px-6 py-3 bg-green-100 text-green-700 hover:bg-green-200 transition-all duration-300 rounded-full font-medium"
                                        content="Xem Topping"
                                        handle={() => {
                                            router.push(`/productions/topping/${id}`)
                                        }}
                                    />
                                </div>


                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h2>
                                    <p className="text-gray-600 leading-relaxed text-base">
                                        {data.description}
                                    </p>
                                </div>


                                <div className="mb-12">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Chọn size</h3>
                                    <div className="space-y-3">
                                        {data.sizes.map(value => (
                                            <button
                                                key={value.id}
                                                onClick={() => setSize({
                                                    id: value.id,
                                                    name: value.sizeName,
                                                    price: value.price
                                                })}
                                                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                                                    size?.name === value.sizeName
                                                        ? 'border-gray-500 bg-green-300 text-green-700 shadow-sm'
                                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="font-semibold text-lg">{value.sizeName}</div>
                                                    <div className="font-bold text-green-600">
                                                        {formatCurrency(Number(value.price))}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div
                                        className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <Button
                                                content="Gọi món ngay"
                                                handle={() => {
                                                    // router.push(`/productions/order/${id}`);
                                                    handle(data?.id, data?.name, data?.urlImg)
                                                    setContent('Gọi món ngay');
                                                    setOpent(true);
                                                }}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform active:scale-95 text-lg"
                                            />

                                            <button
                                                onClick={() => {
                                                    handle(data?.id, data?.name, data?.urlImg)
                                                    setContent('Lưu võ hàng');
                                                    setOpent(true);
                                                }}
                                                className="w-14 h-14 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-md"
                                            >
                                                <svg
                                                    className="w-6 h-6 text-green-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-24"></div>
                            </div>

                        </div>
                    ) : (
                        <> </>
                    )
            }
            <ChoceToping
                id={id}
                isOpen={open}
                onClose={handleClose}
                id_size={size?.id ?? ''}
                // size_name={size?.name ?? ''}
                content={content}/>
        </>
    )
}