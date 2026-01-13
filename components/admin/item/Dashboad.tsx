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
  PieChart,
  Pie,
  Legend,
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
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { vi } from "date-fns/locale";

// Helper to format display value from Date
const formatDisplayValue = (
  date: Date | null,
  mode: "year" | "month" | "day"
): string => {
  if (!date) return "";
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    () => new Date()
  );
  const [data, setData] = useState<topMostOrderedProducts | null>(null);
  const [loading, setLoading] = useState(false);

  const { run } = useDashboadApi();

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    // Keep the same date when switching modes
  };

  // Tạo params để gọi API
  const buildQuery = () => {
    if (!selectedDate) return null;

    const year = String(selectedDate.getFullYear());
    const month = String(selectedDate.getMonth() + 1);
    const day = String(selectedDate.getDate());

    if (mode === "year") return { Year: year };
    if (mode === "month") return { Year: year, Month: month };
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
  }, [mode, selectedDate]);

  // Chart safe
  const chartData = Array.isArray(data?.top5MostOrderedProducts)
    ? data!.top5MostOrderedProducts
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header với hiệu ứng gradient động */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-blue-600/10 to-purple-600/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/60">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl blur-lg opacity-50 animate-pulse" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Bảng Điều Khiển Quản Trị
                </h1>
                <p className="text-slate-700 mt-1 font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-600" />
                  Phân tích thông minh & trực quan
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex items-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 rounded-2xl shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
                <div className="text-white">
                  <div className="text-xs font-bold opacity-90">
                    {mode === "year"
                      ? "Năm"
                      : mode === "month"
                      ? "Tháng"
                      : "Ngày"}
                  </div>
                  <div className="text-sm font-black">
                    {formatDisplayValue(selectedDate, mode)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter với hiệu ứng glass morphism */}
        <Card className="rounded-3xl shadow-xl border border-white/60 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => handleModeChange("year")}
                  className={`px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                    mode === "year"
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/50"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200 hover:shadow-md"
                  }`}
                  type="button"
                >
                  Năm
                </button>

                <button
                  onClick={() => handleModeChange("month")}
                  className={`px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                    mode === "month"
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/50"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200 hover:shadow-md"
                  }`}
                  type="button"
                >
                  Tháng
                </button>

                <button
                  onClick={() => handleModeChange("day")}
                  className={`px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                    mode === "day"
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/50"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200 hover:shadow-md"
                  }`}
                  type="button"
                >
                  Ngày
                </button>
              </div>

              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={vi}
              >
                <div className="flex-1">
                  {mode === "year" && (
                    <DatePicker
                      views={["year"]}
                      value={selectedDate}
                      onChange={(newValue) => setSelectedDate(newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "1rem",
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              fontWeight: 600,
                              "&:hover": {
                                backgroundColor: "white",
                              },
                              "&.Mui-focused": {
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#7c3aed",
                                  borderWidth: 2,
                                },
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                  {mode === "month" && (
                    <DatePicker
                      views={["year", "month"]}
                      value={selectedDate}
                      onChange={(newValue) => setSelectedDate(newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "1rem",
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              fontWeight: 600,
                              "&:hover": {
                                backgroundColor: "white",
                              },
                              "&.Mui-focused": {
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#7c3aed",
                                  borderWidth: 2,
                                },
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                  {mode === "day" && (
                    <DatePicker
                      value={selectedDate}
                      onChange={(newValue) => setSelectedDate(newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "1rem",
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              fontWeight: 600,
                              "&:hover": {
                                backgroundColor: "white",
                              },
                              "&.Mui-focused": {
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#7c3aed",
                                  borderWidth: 2,
                                },
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </LocalizationProvider>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <Card className="rounded-3xl shadow-xl border border-white/60 bg-white/80 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-blue-600/20 rounded-2xl blur-xl animate-pulse" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-violet-600 animate-pulse" />
                </div>
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
          <Card className="rounded-3xl shadow-xl border border-white/60 bg-white/80 backdrop-blur-xl">
            <CardContent className="p-20 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200/50 to-slate-300/50 rounded-3xl blur-2xl" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <BarChart3 className="w-12 h-12 text-slate-600" />
                </div>
              </div>
              <p className="text-slate-900 text-xl font-black mb-2">
                Không có dữ liệu để hiển thị
              </p>
              <p className="text-slate-700 text-sm font-medium">
                Vui lòng chọn khoảng thời gian để xem thống kê
              </p>
            </CardContent>
          </Card>
        ) : data.totalUsers === 0 &&
          data.totalProducts === 0 &&
          data.totalOrderItems === 0 &&
          data.totalCancelledItems === 0 &&
          data.totalRemakeItems === 0 &&
          data.totalComplains === 0 &&
          data.totalComplainsHandled === 0 &&
          data.totalComplainsPending === 0 &&
          !data.mostOrderedProduct &&
          !data.leastOrderedProduct &&
          chartData.length === 0 ? (
          <Card className="rounded-3xl shadow-xl border border-white/60 bg-white/80 backdrop-blur-xl">
            <CardContent className="p-20 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/50 to-teal-300/50 rounded-3xl blur-2xl" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <CheckCircle className="w-16 h-16 text-emerald-600" />
                </div>
              </div>
              <p className="text-slate-900 text-xl font-black mb-2">
                Không có hoạt động nào
              </p>
              <p className="text-slate-700 text-sm font-medium">
                Chưa có dữ liệu thống kê trong khoảng thời gian này
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Cards - Only show if there's any data */}
            {(data.totalUsers > 0 ||
              data.totalProducts > 0 ||
              data.totalOrderItems > 0 ||
              data.totalCancelledItems > 0 ||
              data.totalRemakeItems > 0 ||
              data.totalComplains > 0 ||
              data.totalComplainsHandled > 0 ||
              data.totalComplainsPending > 0) && (
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
                <KpiCard
                  title="Số món làm lại"
                  value={data.totalRemakeItems}
                  icon={<RefreshCw className="w-6 h-6" />}
                  color="cyan"
                />
              </div>
            )}

            {/* Highlight Cards - Only show if both products exist */}
            {(data.mostOrderedProduct || data.leastOrderedProduct) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.mostOrderedProduct && (
                  <HighlightCard
                    title="Món được gọi nhiều nhất"
                    name={data.mostOrderedProduct.productName}
                    count={data.mostOrderedProduct.orderCount}
                    icon={<Award className="w-6 h-6" />}
                    color="amber"
                    badge="Top #1"
                  />
                )}

                {data.leastOrderedProduct && (
                  <HighlightCard
                    title="Món được gọi ít nhất"
                    name={data.leastOrderedProduct.productName}
                    count={data.leastOrderedProduct.orderCount}
                    icon={<AlertCircle className="w-6 h-6" />}
                    color="slate"
                    badge="Cần cải thiện"
                  />
                )}
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Top 5 Products Chart */}
              <Card className="rounded-3xl shadow-xl border border-white/60 bg-white/80 backdrop-blur-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-blue-50/50 pointer-events-none" />
                <CardContent className="p-8 relative">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl blur-md opacity-50" />
                        <div className="relative w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-black bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                          Top 5 Sản Phẩm Bán Chạy
                        </h2>
                        <p className="text-sm text-slate-700 mt-1 font-semibold">
                          Thống kê món ăn được yêu thích nhất
                        </p>
                      </div>
                    </div>
                  </div>

                  {chartData.length === 0 ? (
                    <div className="p-10 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-gradient-to-br from-slate-50 to-white">
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
                            strokeOpacity={0.8}
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
                              backdropFilter: "blur(12px)",
                            }}
                            labelStyle={{
                              fontWeight: 800,
                              color: "#0f172a",
                              marginBottom: 4,
                            }}
                            itemStyle={{ fontWeight: 700 }}
                            cursor={{ fill: "rgba(79, 70, 229, 0.10)" }}
                            formatter={(value: any, name: string) => [
                              value,
                              "Số lượt",
                            ]}
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

              {/* Complaint Status Dashboard */}
              <Card className="rounded-3xl shadow-xl border border-white/60 bg-white/80 backdrop-blur-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-emerald-50/50 pointer-events-none" />
                <CardContent className="p-8 relative">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-emerald-600 rounded-2xl blur-md opacity-50" />
                        <div className="relative w-12 h-12 bg-gradient-to-br from-orange-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-black bg-gradient-to-r from-orange-600 to-emerald-600 bg-clip-text text-transparent">
                          Xử Lý Đơn Khiếu Nại
                        </h2>
                        <p className="text-sm text-slate-700 mt-1 font-semibold">
                          Thống kê tình trạng khiếu nại
                        </p>
                      </div>
                    </div>
                  </div>

                  {data.totalComplains === 0 ? (
                    <div className="p-10 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-gradient-to-br from-slate-50 to-white">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                      </div>
                      <p className="text-slate-900 font-bold text-lg">
                        Không có khiếu nại
                      </p>
                      <p className="text-slate-600 text-sm mt-1">
                        Chưa có đơn khiếu nại nào trong khoảng thời gian này
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Pie Chart */}
                      <div className="h-[280px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "Đã xử lý",
                                  value: data.totalComplainsHandled,
                                  fill: "#10b981",
                                },
                                {
                                  name: "Đang xử lý",
                                  value: data.totalComplainsPending,
                                  fill: "#f59e0b",
                                },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              label={({
                                cx,
                                cy,
                                midAngle,
                                innerRadius,
                                outerRadius,
                                value,
                              }: any) => {
                                if (
                                  typeof midAngle === "undefined" ||
                                  typeof cx === "undefined" ||
                                  typeof cy === "undefined"
                                ) {
                                  return null;
                                }
                                const RADIAN = Math.PI / 180;
                                const radius =
                                  25 +
                                  (innerRadius || 0) +
                                  ((outerRadius || 0) - (innerRadius || 0));
                                const x =
                                  cx + radius * Math.cos(-midAngle * RADIAN);
                                const y =
                                  cy + radius * Math.sin(-midAngle * RADIAN);

                                return (
                                  <text
                                    x={x}
                                    y={y}
                                    fill="#0f172a"
                                    textAnchor={x > cx ? "start" : "end"}
                                    dominantBaseline="central"
                                    className="font-bold text-sm"
                                  >
                                    {`${value} (${(
                                      (value / data.totalComplains) *
                                      100
                                    ).toFixed(1)}%)`}
                                  </text>
                                );
                              }}
                            >
                              {[
                                {
                                  name: "Đã xử lý",
                                  value: data.totalComplainsHandled,
                                  fill: "#10b981",
                                },
                                {
                                  name: "Đang xử lý",
                                  value: data.totalComplainsPending,
                                  fill: "#f59e0b",
                                },
                              ].map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.fill}
                                  stroke="white"
                                  strokeWidth={3}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.98)",
                                border: "1px solid rgba(148, 163, 184, 0.35)",
                                borderRadius: "12px",
                                boxShadow: "0 10px 30px rgba(2,6,23,0.15)",
                                padding: "8px 12px",
                                backdropFilter: "blur(12px)",
                              }}
                              itemStyle={{ fontWeight: 700, fontSize: "13px" }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              iconType="circle"
                              iconSize={10}
                              wrapperStyle={{
                                paddingTop: "20px",
                                fontSize: "14px",
                                fontWeight: "700",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Stats Cards */}
                      <div className="grid grid-cols-3 gap-4">
                        {/* Total */}
                        <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-xs font-bold text-slate-700 uppercase">
                              Tổng
                            </p>
                          </div>
                          <p className="text-2xl font-black bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                            {data.totalComplains}
                          </p>
                        </div>

                        {/* Handled */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-xs font-bold text-emerald-800 uppercase">
                              Đã xử lý
                            </p>
                          </div>
                          <p className="text-2xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                            {data.totalComplainsHandled}
                          </p>
                          <p className="text-xs text-emerald-700 font-bold mt-1">
                            {(
                              (data.totalComplainsHandled /
                                data.totalComplains) *
                              100
                            ).toFixed(1)}
                            %
                          </p>
                        </div>

                        {/* Pending */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                              <Clock className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-xs font-bold text-amber-800 uppercase">
                              Đang xử lý
                            </p>
                          </div>
                          <p className="text-2xl font-black bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                            {data.totalComplainsPending}
                          </p>
                          <p className="text-xs text-amber-700 font-bold mt-1">
                            {(
                              (data.totalComplainsPending /
                                data.totalComplains) *
                              100
                            ).toFixed(1)}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
  color:
    | "blue"
    | "emerald"
    | "purple"
    | "rose"
    | "slate"
    | "amber"
    | "orange"
    | "cyan";
}) {
  const colorStyles = {
    blue: {
      bg: "from-blue-600 to-cyan-600",
      light: "from-blue-50 to-cyan-50",
      icon: "bg-blue-100 text-blue-700",
      text: "from-blue-700 to-cyan-700",
      glow: "from-blue-500/20 to-cyan-500/20",
    },
    emerald: {
      bg: "from-emerald-600 to-teal-600",
      light: "from-emerald-50 to-teal-50",
      icon: "bg-emerald-100 text-emerald-700",
      text: "from-emerald-700 to-teal-700",
      glow: "from-emerald-500/20 to-teal-500/20",
    },
    purple: {
      bg: "from-violet-600 to-indigo-600",
      light: "from-violet-50 to-indigo-50",
      icon: "bg-violet-100 text-violet-700",
      text: "from-violet-700 to-indigo-700",
      glow: "from-violet-500/20 to-indigo-500/20",
    },
    rose: {
      bg: "from-rose-600 to-pink-600",
      light: "from-rose-50 to-pink-50",
      icon: "bg-rose-100 text-rose-700",
      text: "from-rose-700 to-pink-700",
      glow: "from-rose-500/20 to-pink-500/20",
    },
    slate: {
      bg: "from-slate-700 to-slate-900",
      light: "from-slate-50 to-white",
      icon: "bg-slate-100 text-slate-700 ring-slate-200",
      text: "from-slate-800 to-slate-950",
      glow: "from-slate-500/20 to-slate-700/20",
    },
    amber: {
      bg: "from-amber-600 to-orange-600",
      light: "from-amber-50 to-white",
      icon: "bg-amber-100 text-amber-700 ring-amber-200",
      text: "from-amber-700 to-orange-700",
      glow: "from-amber-500/20 to-orange-500/20",
    },
    orange: {
      bg: "from-orange-600 to-red-600",
      light: "from-orange-50 to-white",
      icon: "bg-orange-100 text-orange-700 ring-orange-200",
      text: "from-orange-700 to-red-700",
      glow: "from-orange-500/20 to-red-500/20",
    },
    cyan: {
      bg: "from-cyan-600 to-blue-600",
      light: "from-cyan-50 to-blue-50",
      icon: "bg-cyan-100 text-cyan-700",
      text: "from-cyan-700 to-blue-700",
      glow: "from-cyan-500/20 to-blue-500/20",
    },
  };

  const styles = colorStyles[color];

  return (
    <Card className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-xl overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative">
      {/* Animated gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${styles.light} opacity-30 group-hover:opacity-40 transition-opacity duration-300`}
      />

      {/* Glow effect */}
      <div
        className={`absolute -inset-0.5 bg-gradient-to-br ${styles.glow} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="relative">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${styles.bg} rounded-2xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
            />
            <div
              className={`relative ${styles.icon} p-4 rounded-2xl shadow-md group-hover:shadow-lg transition-shadow duration-300`}
            >
              {icon}
            </div>
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

        <div className="relative mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-r ${styles.bg} rounded-full transform origin-left group-hover:scale-x-110 transition-transform duration-500`}
          />
        </div>
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
      glow: "from-amber-500/30 to-orange-500/30",
    },
    slate: {
      badge: "from-slate-700 to-slate-900",
      icon: "from-slate-700 to-slate-900",
      text: "from-slate-800 to-slate-900",
      border: "bg-gradient-to-r from-slate-600 to-slate-800",
      glow: "from-slate-500/30 to-slate-700/30",
    },
  };

  const styles = colorStyles[color];

  return (
    <Card className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-xl overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative">
      {/* Glow effect */}
      <div
        className={`absolute -inset-0.5 bg-gradient-to-br ${styles.glow} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className={`h-2 ${styles.border} relative z-10`} />

      <CardContent className="p-7 relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm text-slate-800 font-bold uppercase tracking-wide">
                {title}
              </p>
              <span
                className={`px-3 py-1 bg-gradient-to-r ${styles.badge} text-white text-xs font-black rounded-full shadow-md group-hover:shadow-lg transition-shadow duration-300`}
              >
                {badge}
              </span>
            </div>

            <p className="text-2xl font-black text-slate-900 mb-3 group-hover:text-slate-950 transition-colors">
              {name}
            </p>

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

          <div className="relative">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${styles.icon} rounded-2xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
            />
            <div
              className={`relative bg-gradient-to-br ${styles.icon} p-4 rounded-2xl text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
            >
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyHighlightCard({ title }: { title: string }) {
  return (
    <Card className="rounded-3xl border-2 border-dashed border-slate-300 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
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
