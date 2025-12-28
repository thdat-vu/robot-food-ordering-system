"use client";
import React, {useEffect, useState} from "react";
import {useGetCamplain} from "@/hooks/customHooks/useFeedbackHooks";
import {useTableContext} from "@/hooks/context/Context";
import {Camplanin} from "@/api/FeedbackApi";
import {BaseEntityResponse_v2} from "@/entites/BaseEntity";

export const OrtherServicePage: React.FC = () => {
    const {tableId} = useTableContext();
    const {run} = useGetCamplain();

    const [data, setData] = useState<Camplanin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res: BaseEntityResponse_v2<Camplanin[]> = await run(tableId);

            if (res.statusCode == "200") {
                setData(res.data as Camplanin[]);
            } else {
                setData([]);
            }

            setLoading(false);
        })();
    }, []);

    return (
        <div className="p-10 flex flex-col gap-3 h-auto bg-gray-50 min-h-screen">
            {loading && (
                <div className="space-y-3 w-full">
                    <div className="animate-pulse bg-gray-300 h-32 rounded-xl"></div>
                    <div className="animate-pulse bg-gray-300 h-32 rounded-xl"></div>
                    <div className="animate-pulse bg-gray-300 h-32 rounded-xl"></div>
                </div>
            )}

            {!loading && data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <p className="text-base font-medium">Chưa có phản hồi nào</p>
                </div>
            )}

            {!loading &&
                data.length > 0 &&
                data.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                        <div className="p-4">
                            <div className="mb-3">
                                <p className="text-sm text-gray-500 mb-1.5">Nội dung:</p>
                                <p className="text-gray-800 leading-relaxed">{item.feedBack}</p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Trạng thái:</span>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                            item.isPending
                                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        }`}>
                                        {item.isPending ? "Chưa xử lý" : "Đã xử lý"}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-400">
                                    {item.createData.toString()}
                                </p>
                            </div>

                            {item.resolutionNote && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">Ghi chú xử lý:</p>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg">{item.resolutionNote}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            }
        </div>
    );
};