'use client'
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
import {MobileDialog} from "@/components/common/MobileDialog";
import {useTableContext} from "@/hooks/context/Context";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";
import {useGetTable} from "@/hooks/customHooks/useTableHooks";

export default function ProductionDetailPage({id}: { id: string }) {

    const router = useRouter();
    const [data, setData] = useState<ProductionDetail>();
    const [open, setOpent] = useState<boolean>(false);
    const [size, setSize] = useState<{ id: string; name: string; price: number } | undefined>();
    const [content, setContent] = useState<string>('')
    const context = useProductContext();
    const {setProduct, clearProduct} = context;
    const [opendialog, setOpendialog] = useState<boolean>(false);
    const [dataLog, setDataLog] = useState<{ status: boolean, text: string }>()
    const {tableId} = useTableContext();
    const {deviceToken} = useDeviceToken();
    const {run} = useGetTable();

    const {
        data: dataProduct,
        loading: dataLoading,
        run: dataRun,
    } = useGetProductionID();


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

    const getSizeSymbol = (sizeName: string): string => {
        const lowerName = sizeName.toLowerCase();
        if (lowerName.includes('large') || lowerName.includes('lớn')) return 'L';
        if (lowerName.includes('medium') || lowerName.includes('vừa')) return 'M';
        if (lowerName.includes('small') || lowerName.includes('nhỏ')) return 'S';
        return sizeName.charAt(0).toUpperCase();
    };

    useEffect(() => {
        if (dataProduct?.data) {
            setData(dataProduct.data)
            if (dataProduct.data) {

                const largeSize = dataProduct.data.sizes.find(s =>
                    s.sizeName.toLowerCase().includes('large') || s.sizeName.toLowerCase().includes('lớn')
                );

                const defaultSize = largeSize || dataProduct.data.sizes[0];

                setSize({
                    id: defaultSize.id,
                    name: defaultSize.sizeName,
                    price: defaultSize.price,
                })
            }
        }
    }, [dataProduct]);


    const handle = (id: string, name: string, urlImg: string) => {
        if (size) {
            setProduct(id, name, urlImg, size?.price, size?.id, size?.name, "");
            setContent("Lưu giỏ hàng");
        } else {
            setDataLog({status: false, text: "Vui lòng chọn size"});
            setOpendialog(true);
        }
    }

    const CheckTable = async () => {
        // const res: ErroTable | Table = await run(tableId, deviceToken);
        // console.log(res)
        // if (res as ErroTable) {
        //     setDataLog({status: false, text: "Bàn không còn hiệu lực với tiết bị hiện tại"});
        //     setOpendialog(true);
        //     return false;
        // } else {
        //     return true;
        // }
        return true;
    }

    const handleClose = useCallback(() => {
        clearProduct();
        setOpent(false);
    }, [setProduct]);

    const sizeOrder: Record<string, number> = {
        s: 1,
        m: 2,
        l: 3
    };

    const getSizeKey = (sizeName: string): number => {
        const lower = sizeName.toLowerCase();
        if (lower.includes('small') || lower.includes('nhỏ')) return sizeOrder.s;
        if (lower.includes('medium') || lower.includes('vừa')) return sizeOrder.m;
        if (lower.includes('large') || lower.includes('lớn')) return sizeOrder.l;
        return 99;
    };


    return (
        <>
            {
                dataLoading ? (
                    <Loading/>
                ) : data && data.name ?
                    (
                        <div className="mx-auto w-full bg-white min-h-screen">
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
                                        </div>

                                        <div className="flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                                            <Star className="w-5 h-5 fill-green-500 text-green-500"/>
                                        </div>
                                    </div>
                                </div>


                                <div className="flex items-center justify-between py-4 mb-6 border-b border-gray-100">
                                    <div className="text-4xl font-bold text-green-600">
                                        {formatCurrency(data.price)}
                                    </div>

                                    {/*<Button*/}
                                    {/*    className="px-6 py-3 bg-green-100 text-green-700 hover:bg-green-200 transition-all duration-300 rounded-full font-medium"*/}
                                    {/*    content="Xem Topping"*/}
                                    {/*    handle={() => {*/}
                                    {/*        router.push(`/productions/topping/${id}`)*/}
                                    {/*    }}*/}
                                    {/*/>*/}
                                </div>


                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h2>
                                    <p className="text-gray-600 leading-relaxed text-base">
                                        {data.description}
                                    </p>
                                </div>


                                <div className="mb-12">
                                    <h3 className="text-xl font-bold mb-6 text-gray-900">Chọn size</h3>


                                    <div className="flex gap-3 justify-center">
                                        {data.sizes
                                            .slice()
                                            .sort((a, b) => getSizeKey(a.sizeName) - getSizeKey(b.sizeName))
                                            .map(value => (
                                                <button
                                                    key={value.id}
                                                    onClick={() => {
                                                        setSize({
                                                            id: value.id,
                                                            name: value.sizeName,
                                                            price: value.price
                                                        })
                                                    }}
                                                    className={`flex-1 max-w-[120px] py-4 px-6 rounded-2xl border-2 transition-all duration-200 ${
                                                        size?.name === value.sizeName
                                                            ? 'border-green-500 bg-green-50 shadow-md scale-105'
                                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                    }`}
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className={`text-3xl font-bold ${
                                                            size?.name === value.sizeName
                                                                ? 'text-green-600'
                                                                : 'text-gray-700'
                                                        }`}>
                                                            {getSizeSymbol(value.sizeName)}
                                                        </div>
                                                        <div className={`text-xs font-medium ${
                                                            size?.name === value.sizeName
                                                                ? 'text-green-600'
                                                                : 'text-gray-500'
                                                        }`}>
                                                            {formatCurrency(Number(value.price))}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>


                                    <div
                                        className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-lg">
                                        <div className="flex items-center gap-3">

                                            <button
                                                onClick={async () => {
                                                    const check = await CheckTable();
                                                    if (check) {
                                                        handle(data?.id, data?.name, data?.urlImg);
                                                        setOpent(true);
                                                    }
                                                }}
                                                className="flex items-center justify-center gap-2 w-full py-3 px-4
                                                                 text-white bg-green-600 hover:bg-gray-100
                                                                 font-semibold text-base rounded-2xl shadow-md
                                                                 transition-all duration-300 transform active:scale-95"
                                            >
                                                <svg
                                                    className="w-6 h-6"
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
                                                <span>Thêm vào giỏ</span>
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

            {
                size && (
                    <ChoceToping
                        id={id}
                        isOpen={open}
                        onClose={handleClose}
                        id_size={size?.id ?? ''}
                        content={content}/>
                )
            }
            {
                dataLog && (
                    <MobileDialog isOpen={opendialog} onClose={() => setOpendialog(false)} status="warning"
                                  message={dataLog?.text}/>
                )
            }
        </>
    )
}