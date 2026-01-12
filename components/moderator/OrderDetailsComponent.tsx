import React, { useState } from "react";
import {
  Package,
  Loader,
  AlertCircle,
  Utensils,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { OrderItemDetail } from "@/entites/moderator/BillModel";
import { getStatusBadge } from "@/lib/utils/statusBadge";

interface OrderDetailsComponentProps {
  orderItems: OrderItemDetail[];
  loading?: boolean;
  error?: string | null;
}

const OrderDetailsComponent: React.FC<OrderDetailsComponentProps> = ({
  orderItems,
  loading = false,
  error = null,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  // Using shared status badge utility

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // No Data State
  if (!orderItems || orderItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Không có món ăn nào</p>
        </div>
      </div>
    );
  }

  const totalQuantity = orderItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + (item.totalMoney || 0),
    0
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng số món</p>
                <p className="text-xl font-bold text-gray-900">
                  {totalQuantity} món
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Tổng tiền</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(totalAmount)} đ
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-10">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tên món
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                    SL
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    Đơn giá
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orderItems.map((item, index) => {
                  const hasToppings = item.toppings && item.toppings.length > 0;
                  const isExpanded = expandedRows.has(index);

                  return (
                    <React.Fragment key={item.orderItemId || index}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {hasToppings ? (
                            <button
                              onClick={() => toggleRow(index)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              aria-label="Toggle toppings"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          ) : (
                            <span className="inline-block w-6 text-center">
                              {index + 1}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {item.productName}
                            </span>
                            {hasToppings && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                +{item.toppings!.length} topping
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">
                            {item.quantity || 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          {formatCurrency(item.unitPrice)} đ
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-gray-900">
                            {formatCurrency(item.totalMoney)} đ
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Toppings Row */}
                      {hasToppings && isExpanded && (
                        <tr className="bg-amber-50">
                          <td></td>
                          <td colSpan={5} className="px-4 py-3">
                            <div className="bg-white border border-amber-200 rounded-lg p-3">
                              <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
                                🍯 Topping đã chọn:
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {item.toppings!.map((topping, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-sm bg-amber-50 rounded px-3 py-1.5"
                                  >
                                    <span className="text-amber-900 font-medium">
                                      • {topping.name}
                                    </span>
                                    <span className="font-semibold text-amber-800">
                                      +{formatCurrency(topping.price)} đ
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-left">
                    <span className="font-bold text-lg">Tổng cộng</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 font-bold text-base">
                      {totalQuantity}
                    </span>
                  </td>
                  <td colSpan={2} className="px-4 py-4 text-right">
                    <span className="text-sm text-blue-100">Tổng thanh toán</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-bold text-xl">
                      {formatCurrency(totalAmount)} đ
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsComponent;
