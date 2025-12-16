"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { useDashboadApi } from "@/hooks/admin/useAdminHooks";
import { topMostOrderedProducts } from "@/api/admin/adminApi";
import {
  Users,
  Package,
  ShoppingCart,
  XCircle,
  Calendar,
  BarChart3,
  Sparkles,
  Award,
  AlertCircle,
} from "lucide-react";

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

type Mode = "year" | "month" | "day";
const BAR_COLORS = [
  "#6366f1", // Top 1 - Indigo
  "#22c55e", // Top 2 - Green
  "#f59e0b", // Top 3 - Amber
  "#ef4444", // Top 4 - Red
  "#0ea5e9", // Top 5 - Sky
];
export default function DashboardPage() {
  const [mode, setMode] = useState<Mode>("year");
  const [value, setValue] = useState<string>(() => getDefaultValue("year"));
  const [data, setData] = useState<topMostOrderedProducts | null>(null);
  const [loading, setLoading] = useState(false);

  const { run } = useDashboadApi();

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setValue(getDefaultValue(newMode));
  };

  // Tạo params để gọi API
  const buildQuery = () => {
    if (!value) return null;

    if (mode === "year") return { Year: value };

    if (mode === "month") {
      const [month, year] = value.split("/");
      if (!month || !year) return null;
      return { Year: year, Month: month };
    }

    const [day, month, year] = value.split("/");
    if (!day || !month || !year) return null;
    return { Year: year, Month: month, Day: day };
  };

  // debounce 600ms
  useEffect(() => {
    const query = buildQuery();

    if (!query) {
      setData(null);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);
        const res = await run(query.Year, query.Month, query.Day);
        setData(res?.data ?? null);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, value]);

  // Chart safe
  const chartData = Array.isArray(data?.top5MostOrderedProducts)
    ? data!.top5MostOrderedProducts
    : [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900">
                  Bảng Điều Khiển Quản Trị
                </h1>
                <p className="text-slate-700 mt-1 font-medium">
                  Phân tích thông minh & trực quan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 rounded-2xl shadow-md">
              <Calendar className="w-5 h-5 text-white" />
              <div className="text-white">
                <div className="text-xs font-semibold opacity-95">
                  {mode === "year"
                    ? "Năm"
                    : mode === "month"
                    ? "Tháng"
                    : "Ngày"}
                </div>
                <div className="text-sm font-black">{value}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <Card className="rounded-3xl shadow-lg border border-slate-200 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => handleModeChange("year")}
                  className={`px-8 py-3 rounded-2xl font-bold transition-all duration-200 ${
                    mode === "year"
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                  type="button"
                >
                  Năm
                </button>

                <button
                  onClick={() => handleModeChange("month")}
                  className={`px-8 py-3 rounded-2xl font-bold transition-all duration-200 ${
                    mode === "month"
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                  type="button"
                >
                  Tháng
                </button>

                <button
                  onClick={() => handleModeChange("day")}
                  className={`px-8 py-3 rounded-2xl font-bold transition-all duration-200 ${
                    mode === "day"
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                  type="button"
                >
                  Ngày
                </button>
              </div>

              <input
                className="flex-1 border-2 border-slate-300 rounded-2xl px-5 py-3 text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-500/20 transition-all bg-white"
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
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <Card className="rounded-3xl shadow-lg border border-slate-200 bg-white">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-slate-700" />
              </div>
              <p className="text-slate-900 font-bold text-lg">
                Đang tải dữ liệu…
              </p>
              <p className="text-slate-600 text-sm mt-1">
                Vui lòng chờ một chút
              </p>
            </CardContent>
          </Card>
        ) : !data ? (
          <Card className="rounded-3xl shadow-lg border border-slate-200 bg-white">
            <CardContent className="p-20 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
                <BarChart3 className="w-12 h-12 text-slate-700" />
              </div>
              <p className="text-slate-900 text-xl font-black mb-2">
                Không có dữ liệu để hiển thị
              </p>
              <p className="text-slate-700 text-sm font-medium">
                Vui lòng chọn khoảng thời gian để xem thống kê
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <KpiCard
                title="Tổng người dùng"
                value={data.totalUsers}
                icon={<Users className="w-6 h-6" />}
                color="blue"
              />
              <KpiCard
                title="Tổng sản phẩm"
                value={data.totalProducts}
                icon={<Package className="w-6 h-6" />}
                color="emerald"
              />
              <KpiCard
                title="Tổng lượt gọi món"
                value={data.totalOrderItems}
                icon={<ShoppingCart className="w-6 h-6" />}
                color="purple"
              />
              <KpiCard
                title="Số món bị huỷ"
                value={data.totalCancelledItems}
                icon={<XCircle className="w-6 h-6" />}
                color="rose"
              />
            </div>

            {/* Highlight Cards (FIX NULL) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.mostOrderedProduct ? (
                <HighlightCard
                  title="Món được gọi nhiều nhất"
                  name={data.mostOrderedProduct.productName}
                  count={data.mostOrderedProduct.orderCount}
                  icon={<Award className="w-6 h-6" />}
                  color="amber"
                  badge="Top #1"
                />
              ) : (
                <EmptyHighlightCard title="Món được gọi nhiều nhất" />
              )}

              {data.leastOrderedProduct ? (
                <HighlightCard
                  title="Món được gọi ít nhất"
                  name={data.leastOrderedProduct.productName}
                  count={data.leastOrderedProduct.orderCount}
                  icon={<AlertCircle className="w-6 h-6" />}
                  color="slate"
                  badge="Cần cải thiện"
                />
              ) : (
                <EmptyHighlightCard title="Món được gọi ít nhất" />
              )}
            </div>

            {/* Chart */}
            <Card className="rounded-3xl shadow-lg border border-slate-200 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">
                        Top 5 Sản Phẩm Bán Chạy
                      </h2>
                      <p className="text-sm text-slate-700 mt-1 font-medium">
                        Thống kê món ăn được yêu thích nhất
                      </p>
                    </div>
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <div className="p-10 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50">
                    <p className="text-slate-900 font-bold">
                      Chưa có dữ liệu Top 5 trong khoảng thời gian này
                    </p>
                    <p className="text-slate-600 text-sm mt-1">
                      Hãy thử đổi bộ lọc Năm/Tháng/Ngày hoặc khoảng thời gian
                      khác.
                    </p>
                  </div>
                ) : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          strokeOpacity={1}
                        />

                        <XAxis
                          dataKey="productName"
                          tick={{
                            fill: "#0f172a",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                          tickLine={{ stroke: "#94a3b8" }}
                          axisLine={{ stroke: "#94a3b8" }}
                          angle={-18}
                          textAnchor="end"
                          height={90}
                        />

                        <YAxis
                          tick={{
                            fill: "#0f172a",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                          tickLine={{ stroke: "#94a3b8" }}
                          axisLine={{ stroke: "#94a3b8" }}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            border: "1px solid rgba(148, 163, 184, 0.35)",
                            borderRadius: "16px",
                            boxShadow: "0 20px 50px rgba(2,6,23,0.18)",
                            padding: "12px 16px",
                          }}
                          labelStyle={{
                            fontWeight: 800,
                            color: "#0f172a",
                            marginBottom: 4,
                          }}
                          itemStyle={{ fontWeight: 700 }}
                          cursor={{ fill: "rgba(79, 70, 229, 0.10)" }}
                        />

                        <Bar
                          dataKey="orderCount"
                          radius={[12, 12, 0, 0]}
                          maxBarSize={80}
                        >
                          {chartData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={BAR_COLORS[index % BAR_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

/* ===================== Components ===================== */

function KpiCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "purple" | "rose";
}) {
  const colorStyles = {
    blue: {
      bg: "from-blue-600 to-cyan-600",
      light: "from-blue-50 to-cyan-50",
      icon: "bg-blue-100 text-blue-700",
      text: "from-blue-700 to-cyan-700",
    },
    emerald: {
      bg: "from-emerald-600 to-teal-600",
      light: "from-emerald-50 to-teal-50",
      icon: "bg-emerald-100 text-emerald-700",
      text: "from-emerald-700 to-teal-700",
    },
    purple: {
      bg: "from-violet-600 to-indigo-600",
      light: "from-violet-50 to-indigo-50",
      icon: "bg-violet-100 text-violet-700",
      text: "from-violet-700 to-indigo-700",
    },
    rose: {
      bg: "from-rose-600 to-pink-600",
      light: "from-rose-50 to-pink-50",
      icon: "bg-rose-100 text-rose-700",
      text: "from-rose-700 to-pink-700",
    },
  };

  const styles = colorStyles[color];

  return (
    <Card className="rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden group hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 relative">
      {/* overlay nằm dưới content */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${styles.light} opacity-20`}
      />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className={`${styles.icon} p-4 rounded-2xl shadow-md`}>
            {icon}
          </div>
        </div>

        <p className="text-sm text-slate-800 font-bold mb-2 uppercase tracking-wide">
          {title}
        </p>

        <p
          className={`text-4xl font-black bg-gradient-to-r ${styles.text} bg-clip-text text-transparent leading-tight`}
        >
          {value.toLocaleString()}
        </p>

        <div
          className={`mt-4 h-2 bg-gradient-to-r ${styles.bg} rounded-full`}
        />
      </CardContent>
    </Card>
  );
}

function HighlightCard({
  title,
  name,
  count,
  icon,
  color,
  badge,
}: {
  title: string;
  name: string;
  count: number;
  icon: React.ReactNode;
  color: "amber" | "slate";
  badge: string;
}) {
  const colorStyles = {
    amber: {
      badge: "from-amber-600 to-orange-600",
      icon: "from-amber-600 to-orange-700",
      text: "from-amber-700 to-orange-700",
      border: "bg-gradient-to-r from-amber-500 to-orange-600",
    },
    slate: {
      badge: "from-slate-700 to-slate-900",
      icon: "from-slate-700 to-slate-900",
      text: "from-slate-800 to-slate-900",
      border: "bg-gradient-to-r from-slate-600 to-slate-800",
    },
  };

  const styles = colorStyles[color];

  return (
    <Card className="rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden group hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
      <div className={`h-2 ${styles.border}`} />

      <CardContent className="p-7">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm text-slate-800 font-bold uppercase tracking-wide">
                {title}
              </p>
              <span
                className={`px-3 py-1 bg-gradient-to-r ${styles.badge} text-white text-xs font-black rounded-full shadow-md`}
              >
                {badge}
              </span>
            </div>

            <p className="text-2xl font-black text-slate-900 mb-3">{name}</p>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-800 font-semibold">
                Số lượt:
              </span>
              <span
                className={`text-3xl font-black bg-gradient-to-r ${styles.text} bg-clip-text text-transparent`}
              >
                {count.toLocaleString()}
              </span>
            </div>
          </div>

          <div
            className={`bg-gradient-to-br ${styles.icon} p-4 rounded-2xl text-white shadow-lg`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyHighlightCard({ title }: { title: string }) {
  return (
    <Card className="rounded-3xl border border-dashed border-slate-300 bg-white shadow-sm">
      <CardContent className="p-7 text-center">
        <p className="text-sm text-slate-800 font-bold uppercase tracking-wide mb-2">
          {title}
        </p>
        <p className="text-slate-600 text-sm font-medium">
          Chưa có dữ liệu trong khoảng thời gian này
        </p>
      </CardContent>
    </Card>
  );
}
