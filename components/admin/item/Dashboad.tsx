"use client";

import {Card, CardContent} from "@/components/ui/card";
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from "recharts";
import {useEffect, useState} from "react";
import {useDashboadApi} from "@/hooks/admin/useAdminHooks";
import {topMostOrderedProducts} from "@/api/admin/adminApi";

// format mặc định theo hôm nay
const getDefaultValue = (mode: "year" | "month" | "day") => {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    if (mode === "year") return year;
    if (mode === "month") return `${month}/${year}`;
    return `${day}/${month}/${year}`;
};

export default function DashboardPage() {
    const [mode, setMode] = useState<"year" | "month" | "day">("year");
    const [value, setValue] = useState<string>(() => getDefaultValue("year"));
    const [data, setData] = useState<topMostOrderedProducts | null>(null);

    const {run} = useDashboadApi();

    const handleModeChange = (newMode: "year" | "month" | "day") => {
        setMode(newMode);
        setValue(getDefaultValue(newMode)); // đổi tab thì auto set về hôm nay theo mode
    };

    // Tạo params để gọi API
    const buildQuery = () => {
        if (!value) return null;

        if (mode === "year") {
            return {Year: value};
        }

        if (mode === "month") {
            const [month, year] = value.split("/");
            if (!month || !year) return null;
            return {Year: year, Month: month};
        }

        const [day, month, year] = value.split("/");
        if (!day || !month || !year) return null;
        return {Year: year, Month: month, Day: day};
    };

    // debounce 600ms
    useEffect(() => {
        const query = buildQuery();

        if (!query) {
            setData(null);
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            const res = await run(query.Year, query.Month, query.Day);

            if (res?.data) {
                setData(res.data);
            } else {
                setData(null);
            }
        }, 600);

        return () => window.clearTimeout(timeoutId);
    }, [mode, value]);

    const queryPreview = buildQuery() ?? {};

    return (
        <div className="p-6 space-y-6">
            {/* ===== Filter ===== */}
            <Card className="rounded-2xl">
                <CardContent className="p-4 space-y-3">
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleModeChange("year")}
                            className={mode === "year" ? "font-semibold" : "text-muted-foreground"}
                        >
                            Năm
                        </button>

                        <button
                            onClick={() => handleModeChange("month")}
                            className={mode === "month" ? "font-semibold" : "text-muted-foreground"}
                        >
                            Tháng
                        </button>

                        <button
                            onClick={() => handleModeChange("day")}
                            className={mode === "day" ? "font-semibold" : "text-muted-foreground"}
                        >
                            Ngày
                        </button>
                    </div>

                    <input
                        className="border rounded-xl px-3 py-2 w-full"
                        placeholder={
                            mode === "year"
                                ? "VD: 2025"
                                : mode === "month"
                                    ? "VD: 12/2025"
                                    : "VD: 10/12/2025"
                        }
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    
                </CardContent>
            </Card>

            {/* ===== Nếu chưa có data thì không render gì nặng ===== */}
            {!data ? (
                <div className="text-center text-muted-foreground">
                    Không có dữ liệu để hiển thị
                </div>
            ) : (
                <>
                    {/* ===== KPI Cards ===== */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard title="Tổng người dùng" value={data.totalUsers}/>
                        <KpiCard title="Tổng sản phẩm" value={data.totalProducts}/>
                        <KpiCard title="Tổng lượt gọi món" value={data.totalOrderItems}/>
                        <KpiCard title="Số món bị huỷ" value={data.totalCancelledItems}/>
                    </div>

                    {/* ===== Highlight Cards ===== */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <HighlightCard
                            title="Món được gọi nhiều nhất"
                            name={data.mostOrderedProduct.productName}
                            count={data.mostOrderedProduct.orderCount}
                        />

                        <HighlightCard
                            title="Món được gọi ít nhất"
                            name={data.leastOrderedProduct.productName}
                            count={data.leastOrderedProduct.orderCount}
                        />
                    </div>

                    {/* ===== Bar Chart ===== */}
                    <Card className="rounded-2xl">
                        <CardContent className="p-5">
                            <h2 className="text-lg font-semibold mb-4">
                                Top 5 món được gọi nhiều nhất
                            </h2>

                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.top5MostOrderedProducts ?? []}>
                                        <XAxis dataKey="productName"/>
                                        <YAxis/>
                                        <Tooltip/>
                                        <Bar dataKey="orderCount" radius={[8, 8, 0, 0]}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

function KpiCard({title, value}: { title: string; value: number }) {
    return (
        <Card className="rounded-2xl">
            <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
            </CardContent>
        </Card>
    );
}

function HighlightCard({
                           title,
                           name,
                           count,
                       }: {
    title: string;
    name: string;
    count: number;
}) {
    return (
        <Card className="rounded-2xl">
            <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-lg font-semibold mt-1">{name}</p>
                <p className="text-sm mt-1">
                    Số lượt: <span className="font-medium">{count}</span>
                </p>
            </CardContent>
        </Card>
    );
}
