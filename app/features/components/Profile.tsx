'use client'
import React, {useState} from 'react';
import {ChevronRight} from 'lucide-react';
import Button from "@/components/common/Button";
import {CallStaff} from "@/app/features/components/CallStaff";
import {Rating} from "@/app/features/components/Rating";
import {Payment} from "@/app/features/components/Payment";
import {IoIosArrowBack} from "react-icons/io";
import {useRouter} from "next/navigation";

export default function Profile({id}: { id: string }) {

    const router = useRouter();

    const [isCallStaffOpen, setIsCallStaffOpen] = useState<boolean>(false);
    const [isRatingOpen, setIsRatingOpen] = useState<boolean>(false);
    const [isPaymentOpen, setPaymentOpen] = useState<boolean>(false);

    const infor = id !== "undefined" ? id : "!";


    return (
        <>

            <div className="h-full w-full mx-auto bg-gray-50 min-h-screen">
                <button className="btn-circle  ms-3 mt-3 mb-2 ml-4 items-center "
                        onClick={() => {
                            router.back()
                        }}
                >
                    <IoIosArrowBack className="text-black text-4xl "/>
                </button>
                <div className="mx-4 mb-6 mt-2">
                    <div
                        className="bg-gradient-to-r from-orange-100 to-red-800 rounded-2xl p-4 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-red-800 mb-1">Thức ăn nhanh</h2>

                                <button
                                    className="bg-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                    XEM NGAY
                                </button>

                                <div className="flex items-center mt-3 space-x-2">
                                    <div
                                        className="w-6 h-6 bg-orange-300 rounded-full flex items-center justify-center">
                                        <span className="text-xs">🍔</span>
                                    </div>
                                    <div
                                        className="w-6 h-6 bg-orange-300 rounded-full flex items-center justify-center">
                                        <span className="text-xs">🍟</span>
                                    </div>
                                    <div
                                        className="w-6 h-6 bg-orange-300 rounded-full flex items-center justify-center">
                                        <span className="text-xs">🥤</span>
                                    </div>
                                    <span className="text-xs text-gray-600">+3</span>
                                </div>
                            </div>

                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center ml-4">
                                <div className="w-28 h-28 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-4xl">🍽️</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <span
                            className="text-lg text-gray-600 font-semibold"> {infor === "!" ? "" : " Bàn " + id}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Chúng tôi sẽ trợ đỡ cho bạn tại đây!</p>

                    <div className="bg-blue-400 text-white p-3 rounded-lg mb-4 flex items-center justify-between">
                        <span className="font-medium">Nhập số điện thoại để tích điểm</span>
                        <ChevronRight className="w-5 h-5"/>
                    </div>

                    <div className="flex justify-center space-x-2">
                        <Button
                            content="Thanh toán"
                            className="bg-red-200 hover:bg-red-400 text-red-800 px-4 py-2 rounded-full text-sm"
                            handle={() => setPaymentOpen(true)}
                        />
                        <Button
                            content="Gọi Nhân Viên"
                            className="bg-red-200 hover:bg-red-400 text-red-800 px-4 py-2 rounded-full text-sm"
                            handle={() => setIsCallStaffOpen(true)}
                        />
                        <Button
                            content="Đánh Giá"
                            className="bg-red-200 hover:bg-red-400 text-red-800 px-4 py-2 rounded-full text-sm"
                            handle={() => {
                                setIsRatingOpen(true)
                            }}
                        />
                    </div>
                </div>

                <div className="mx-4 mb-6">
                    <div
                        className="bg-gradient-to-r from-green-400 to-green-600 rounded-2xl p-4 relative overflow-hidden">
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-1">RAU QUẢ</h2>
                                <h2 className="text-2xl font-bold text-black mb-2">THỰC ĐƠN MÓN ẨM</h2>
                                <p className="text-xs text-gray-700 mb-3">Thực đơn rau củ ngon và bổ dưỡng dành cho
                                    bạn</p>

                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-700">Giảm</span>
                                    <span
                                        className="bg-green-300 text-green-800 px-2 py-1 rounded text-xs font-semibold">50%</span>
                                </div>

                                <button
                                    className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-semibold mt-2">
                                    MÓN HAY GỢI Ý
                                </button>
                            </div>

                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center ml-4">
                                <div
                                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-3xl">🥗</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                <span className="text-lg ml-4 text-gray-600 font-semibold">
                    Những món ăn thịnh hành.
                </span>
                </div>

                <div className="px-4">
                    <div className="flex items-center space-x-3 mb-4 bg-white p-3 rounded-lg">
                        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🥤</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-600">Chọn một trong các loại size: S, M, L, XL. Thêm
                                topping:
                                Trân châu...</p>
                            <p className="text-yellow-600 font-bold text-sm">165.000 đ</p>
                        </div>
                        <button className="bg-yellow-400 text-white px-3 py-1 rounded-full text-xs">
                            Thêm
                        </button>
                    </div>

                    <div className="flex items-center space-x-3 mb-4 bg-white p-3 rounded-lg">
                        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🥤</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-600">Chọn một trong các loại size: S, M, L, XL. Thêm
                                topping:
                                Trân châu...</p>
                            <p className="text-yellow-600 font-bold text-sm">165.000 đ</p>
                        </div>
                        <button className="bg-yellow-400 text-white px-3 py-1 rounded-full text-xs">
                            Thêm
                        </button>
                    </div>
                </div>
            </div>
            <CallStaff
                id={id}
                isOpen={isCallStaffOpen}
                onClose={() => setIsCallStaffOpen(false)}
                onSave={() => {
                }}
            />
            <Rating
                id={id}
                isOpen={isRatingOpen}
                onClose={() => setIsRatingOpen(false)}
                onSave={() => {
                }}
            />
            <Payment
                id={id}
                orderId={''}
                isOpen={isPaymentOpen}
                onClose={() => setPaymentOpen(false)}
                onSave={() => {
                }}
            />
        </>
    )
        ;
}