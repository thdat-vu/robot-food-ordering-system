"use client";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {useGetCamplain} from "@/hooks/customHooks/useFeedbackHooks";
import {useTableContext} from "@/hooks/context/Context";
import {Camplanin} from "@/api/FeedbackApi";
import {BaseEntityResponse_v2} from "@/entites/BaseEntity";

export const OrtherServicePage: React.FC = () => {
    const {tableId} = useTableContext();
    const {run} = useGetCamplain();

    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dataShow, setDataShow] = useState<Camplanin[]>([]);

    const mountedRef = useRef(true);
    const inFlightRef = useRef(false);
    const lastSigRef = useRef<string>("");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const runRef = useRef(run);
    const tableIdRef = useRef(tableId);

    useEffect(() => {
        runRef.current = run;
        tableIdRef.current = tableId;
    }, [run, tableId]);

    const getKey = (item: any) => {
        return String(
            item?.id ??
            item?.complainId ??
            item?.feedbackId ??
            `${item?.createData ?? ""}-${item?.feedBack ?? ""}-${item?.resolutionNote ?? ""}-${item?.isPending ?? ""}`
        );
    };

    const makeSig = (arr: any[]) => {
        return arr
            .map((x: any) => {
                const id = x?.id ?? x?.complainId ?? x?.feedbackId ?? "";
                const pending = x?.isPending ? 1 : 0;
                const created = String(x?.createData ?? "");
                const fb = String(x?.feedBack ?? "");
                const rn = String(x?.resolutionNote ?? "");
                return `${id}|${pending}|${created}|${rn}|${fb}`;
            })
            .sort()
            .join("~");
    };

    const fetchData = async (mode: "initial" | "poll" | "manual" = "poll") => {
        const currentTableId = tableIdRef.current;
        if (!currentTableId) {
            if (mode === "initial") setInitialLoading(false);
            return;
        }
        if (inFlightRef.current) return;

        inFlightRef.current = true;
        if (mode === "initial") setInitialLoading(true);
        if (mode !== "initial") setRefreshing(true);

        try {
            const res: BaseEntityResponse_v2<Camplanin[]> = await runRef.current(currentTableId);
            if (!mountedRef.current) return;

            const ok = String((res as any)?.statusCode) === "200";
            const next = ok && Array.isArray(res.data) ? (res.data as Camplanin[]) : [];

            const sig = makeSig(next);
            if (sig !== lastSigRef.current) {
                lastSigRef.current = sig;
                setDataShow(next);
            }

            if (!ok && mode === "initial") {
                lastSigRef.current = "";
                setDataShow([]);
            }
        } catch {
            if (mode === "initial") {
                lastSigRef.current = "";
                setDataShow([]);
            }
        } finally {
            if (!mountedRef.current) return;
            if (mode === "initial") setInitialLoading(false);
            setRefreshing(false);
            inFlightRef.current = false;
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        lastSigRef.current = "";
        inFlightRef.current = false;

        if (intervalRef.current) clearInterval(intervalRef.current);

        fetchData("initial");

        intervalRef.current = setInterval(() => {
            if (document.visibilityState === "visible" && !inFlightRef.current) {
                fetchData("poll");
            }
        }, 15000);

        return () => {
            mountedRef.current = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleManualRefresh = async () => {
        if (inFlightRef.current || !tableIdRef.current) return;
        await fetchData("manual");
    };

    const isEmpty = !initialLoading && dataShow.length === 0;

    const counts = useMemo(() => {
        const pending = dataShow.filter((x: any) => !!x?.isPending).length;
        return {pending, done: dataShow.length - pending, total: dataShow.length};
    }, [dataShow]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/85 backdrop-blur">
                <div className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-[17px] font-medium tracking-tight text-gray-900 truncate">
                                Phản hồi của bạn
                            </h1>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                <span
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-normal text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500"/>
                  Chờ xử lý <span className="font-medium text-gray-900">{counts.pending}</span>
                </span>
                                <span
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-normal text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-600"/>
                  Đã xử lý <span className="font-medium text-gray-900">{counts.done}</span>
                </span>
                                <span
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-normal text-gray-700">
                  Tổng <span className="font-medium text-gray-900">{counts.total}</span>
                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {refreshing && !initialLoading && (
                                <span
                                    className="hidden sm:inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-normal text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse"/>
                  Đang cập nhật
                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleManualRefresh}
                                disabled={inFlightRef.current || !tableIdRef.current}
                                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 shadow-sm hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Làm mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 pt-4 pb-24 space-y-3">
                {initialLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i}
                                 className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="animate-pulse h-6 w-28 bg-gray-200 rounded-xl"/>
                                        <div className="animate-pulse h-4 w-20 bg-gray-200 rounded-lg"/>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        <div className="animate-pulse h-3 w-full bg-gray-200 rounded"/>
                                        <div className="animate-pulse h-3 w-11/12 bg-gray-200 rounded"/>
                                        <div className="animate-pulse h-3 w-8/12 bg-gray-200 rounded"/>
                                    </div>
                                    <div className="mt-4 animate-pulse h-10 w-full bg-gray-100 rounded-xl"/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isEmpty && (
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-10">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div
                                className="h-14 w-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                    />
                                </svg>
                            </div>
                            <p className="mt-4 text-base font-medium text-gray-800">Chưa có phản hồi nào</p>
                            <p className="mt-1 text-sm text-gray-500">Khi bạn gửi phản hồi, nó sẽ hiển thị ở đây.</p>
                        </div>
                    </div>
                )}

                {!initialLoading &&
                    dataShow.length > 0 &&
                    dataShow.map((item: any) => {
                        const pending = !!item?.isPending;
                        return (
                            <div
                                key={getKey(item)}
                                className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                    <span
                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border ${
                                            pending
                                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                        }`}
                                    >
                                                          <span
                                                              className={`h-2 w-2 rounded-full ${pending ? "bg-amber-500" : "bg-emerald-600"}`}/>
                                        {pending ? "Chưa xử lý" : "Đã xử lý"}
                                                        </span>

                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                          {String(item?.createData ?? "")}
                                        </span>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Nội
                                            dung</p>
                                        <p className="mt-2 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                                            {String(item?.feedBack ?? "")}
                                        </p>
                                    </div>

                                    {!!item?.resolutionNote && (
                                        <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-3">
                                            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Ghi
                                                chú xử lý</p>
                                            <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                                {String(item?.resolutionNote)}
                                            </p>
                                        </div>
                                    )}

                                    <div
                                        className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                          {pending ? "Hệ thống đang tiếp nhận phản hồi" : "Phản hồi đã được xử lý"}
                                        </span>
                                        <span
                                            className={`text-xs font-medium ${pending ? "text-amber-700" : "text-emerald-700"}`}>
                                              {pending ? "Đang chờ" : "Hoàn tất"}
                                            </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};
