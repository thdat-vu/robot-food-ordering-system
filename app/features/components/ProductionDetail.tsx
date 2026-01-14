'use client'
import React, {useCallback, useEffect, useState} from "react";
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
    const [content, setContent] = useState<string>('');
    const {setProduct, clearProduct} = useProductContext();

    const [opendialog, setOpendialog] = useState<boolean>(false);
    const [dataLog, setDataLog] = useState<{ status: boolean, text: string }>();

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
                if (confine) router.back();
            } else {
                await dataRun(id);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setData(dataProduct.data);

            const largeSize = dataProduct.data.sizes.find(s =>
                s.sizeName.toLowerCase().includes('large') || s.sizeName.toLowerCase().includes('lớn')
            );
            const defaultSize = largeSize || dataProduct.data.sizes[0];

            setSize({
                id: defaultSize.id,
                name: defaultSize.sizeName,
                price: defaultSize.price,
            });
        }
    }, [dataProduct]);

    const handle = (idP: string, name: string, urlImg: string) => {
        if (size) {
            setProduct(idP, name, urlImg, size.price, size.id, size.name, "");
            setContent("Lưu giỏ hàng");
        } else {
            setDataLog({status: false, text: "Vui lòng chọn size"});
            setOpendialog(true);
        }
    };

    const CheckTable = async () => {
        return true;
    };

    const handleClose = useCallback(() => {
        clearProduct();
        setOpent(false);
    }, [clearProduct]);

    const sizeOrder: Record<string, number> = {s: 1, m: 2, l: 3};

    const getSizeKey = (sizeName: string): number => {
        const lower = sizeName.toLowerCase();
        if (lower.includes('small') || lower.includes('nhỏ')) return sizeOrder.s;
        if (lower.includes('medium') || lower.includes('vừa')) return sizeOrder.m;
        if (lower.includes('large') || lower.includes('lớn')) return sizeOrder.l;
        return 99;
    };

    return (
        <>
            {dataLoading ? (
                <Loading/>
            ) : data && data.name ? (
                <div className="min-h-screen w-full bg-gray-50">
                    {/* HERO (ảnh) */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="
                              absolute top-4 left-4 z-20
                              h-11 w-11 rounded-full
                              bg-white/90 backdrop-blur
                              shadow-md border border-white/50
                              grid place-items-center
                              hover:bg-white
                              active:scale-95 transition
                            "
                            aria-label="Quay lại"
                        >
                            <IoIosArrowBack className="text-black text-2xl"/>
                        </button>

                        <div
                            className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] overflow-hidden bg-gray-200">
                            <img
                                src={data.urlImg}
                                alt={data.name}
                                className="w-full h-full object-cover"
                            />
                            {/* gradient mềm, giảm cảm giác “cắt đôi” */}
                            <div
                                className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent"/>
                        </div>
                    </div>

                    {/* CONTENT CARD: bỏ đường kẽ giữa ảnh và content bằng shadow + border mịn + bo tròn */}
                    <div className="mx-auto w-full max-w-3xl px-3 sm:px-4">
                        <div
                            className="
                              relative -mt-10 sm:-mt-14
                              rounded-[28px]
                              bg-white
                              shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]
                              border border-gray-100
                              overflow-hidden
                            "
                        >
                            <div className="px-5 sm:px-7 py-6">
                                {/* TÊN MÓN: font bình thường nhưng đậm & to hơn */}
                                <h1 className="text-[26px] sm:text-[32px] font-semibold text-gray-900 leading-snug">
                                    {data.name}
                                </h1>

                                {/* Giá */}
                                <div className="mt-5">
                                    <p className="text-xs text-gray-500 font-medium">Giá</p>
                                    <div
                                        className="mt-1 text-4xl sm:text-[44px] font-extrabold text-green-600 tracking-tight">
                                        {formatCurrency(data.price)}
                                    </div>
                                </div>

                                {/* Divider mềm */}
                                <div className="mt-6 h-px bg-gray-100"/>

                                {/* Mô tả */}
                                <div className="mt-6 space-y-2">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Mô tả sản phẩm</h2>
                                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                        {data.description}
                                    </p>
                                </div>

                                {/* Size */}
                                <div className="mt-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Chọn size</h3>
                                        {size?.name && (
                                            <span className="text-sm font-semibold text-gray-600">
                                                Đang chọn:{" "}
                                                <span className="text-gray-900">{getSizeSymbol(size.name)}</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {data.sizes
                                            .slice()
                                            .sort((a, b) => getSizeKey(a.sizeName) - getSizeKey(b.sizeName))
                                            .map(value => {
                                                const active = size?.name === value.sizeName;

                                                return (
                                                    <button
                                                        key={value.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSize({
                                                                id: value.id,
                                                                name: value.sizeName,
                                                                price: value.price
                                                            });
                                                        }}
                                                        className={`
                                                          rounded-2xl border
                                                          px-3 py-3 sm:py-4
                                                          transition-all duration-200
                                                          active:scale-[0.99]
                                                          ${active
                                                            ? "bg-green-50 border-green-500 shadow-md ring-2 ring-green-100"
                                                            : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
                                                        `}
                                                    >
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <div
                                                                className={`text-2xl sm:text-3xl font-bold ${active ? "text-green-700" : "text-gray-800"}`}
                                                            >
                                                                {getSizeSymbol(value.sizeName)}
                                                            </div>
                                                            <div
                                                                className={`text-[11px] sm:text-xs font-semibold ${active ? "text-green-700" : "text-gray-500"}`}
                                                            >
                                                                {formatCurrency(Number(value.price))}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                    </div>

                                    {/* spacer tránh bị che bottom bar */}
                                    <div className="h-60"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="fixed bottom-0 left-0 right-0 z-40">
                        <div className="bg-white/95 backdrop-blur border-t border-gray-200">
                            <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const check = await CheckTable();
                                        if (check) {
                                            handle(data.id, data.name, data.urlImg);
                                            setOpent(true);
                                        }
                                    }}
                                    className="
                                      w-full h-12 sm:h-14
                                      rounded-2xl
                                      bg-green-600 text-white
                                      font-bold text-base
                                      shadow-lg shadow-green-600/20
                                      hover:bg-green-700
                                      active:scale-[0.99]
                                      transition
                                      flex items-center justify-center gap-2
                                    "
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
                </div>
            ) : (
                <></>
            )}

            {size && (
                <ChoceToping
                    id={id}
                    isOpen={open}
                    onClose={handleClose}
                    id_size={size?.id ?? ''}
                    content={content}
                />
            )}

            {dataLog && (
                <MobileDialog
                    isOpen={opendialog}
                    onClose={() => setOpendialog(false)}
                    status="warning"
                    message={dataLog?.text}
                />
            )}
        </>
    );
}
