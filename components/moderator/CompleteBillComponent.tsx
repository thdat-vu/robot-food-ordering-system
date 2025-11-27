import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Loader,
  AlertCircle,
  Printer,
  Mail,
  Download,
} from "lucide-react";
import { tableService } from "@/service/moderator/TableService";
import { Bill } from "@/entites/moderator/BillModel";

interface CompleteBillComponentProps {
  invoiceId: string;
}
// Main Component
const CompleteBillComponent = ({ invoiceId }: CompleteBillComponentProps) => {
  const [billData, setBillData] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate API fetch - Replace with your actual API call
  useEffect(() => {
    fetchBillData();
  }, []);

  const fetchBillData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tableService.getInvoiceById(invoiceId);

      console.log(response);
      if (!response) {
        setBillData(null);
        setError("Không có invoiceId");
        return;
      }

      if (response.statusCode === 200 && response.data) {
        console.log("fetch data successfully: invoice", response.data);
        setBillData(response.data); // ✅ Bill
      } else {
        setBillData(null);
        setError(response.message || "Không thể tải hóa đơn");
      }
    } catch (err: any) {
      setBillData(null);
      setError(err?.message || "Lỗi kết nối. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!invoiceId) return;
    fetchBillData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const getPaymentMethodName = (method: string | number) => {
    const methods: { [key: string]: string } = {
      "0": "Tiền mặt (COD)",
      "1": "VNPay",
      "2": "PayOS",
    };
    return methods[method.toString()] || "Chưa thanh toán";
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Tính năng tải xuống đang được phát triển");
  };

  const handleEmail = () => {
    alert("Tính năng gửi email đang được phát triển");
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải hóa đơn...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchBillData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // No Data State
  if (!billData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy hóa đơn</p>
        </div>
      </div>
    );
  }

  const totalItems = billData.details.length;
  const finalAmount =
    billData.finalAmount > 0
      ? billData.finalAmount
      : billData.totalAmount - billData.discount;
  const receiptNumber = billData.id.slice(-6).toUpperCase();
  const isPaid = ["1", "2", "3", 1, 2, 3].includes(billData.paymentMethod);

  // Store info - Replace with your actual store data
  const storeInfo = {
    name: "Sweet & Salt Factory - Steakhouse",
    address:
      "449c Trần Hưng Đạo, Cầu Kho, Quận 1, Thành phố Hồ Chí Minh 700000, Việt Nam",
    phone: "0937142618",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Success Badge */}
        {isPaid && (
          <div className="mb-4 bg-green-500 text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-bold text-lg">Thanh toán thành công!</p>
                <p className="text-green-50 text-sm">Cảm ơn quý khách</p>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden print-area">
          {/* Top Tear Effect */}
          <div
            className="h-3 bg-white"
            style={{
              backgroundImage:
                "radial-gradient(circle at 10px 0, transparent 10px, white 10px)",
              backgroundSize: "20px 100%",
              backgroundRepeat: "repeat-x",
            }}
          ></div>

          {/* Main Content */}
          <div className="px-8 py-6 bg-white">
            {/* Store Header */}
            <div className="text-center mb-6 pb-6 border-b-2 border-dashed border-gray-300">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {storeInfo.name}
              </h1>
              <p className="text-xs text-gray-600 leading-relaxed mb-1">
                {storeInfo.address}
              </p>
              <p className="text-xs text-gray-600">{storeInfo.phone}</p>
            </div>

            {/* Receipt Title */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Phiếu Thanh Toán
              </h2>
              <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg">
                <p className="text-xs text-gray-500">Số phiếu</p>
                <p className="text-lg font-bold text-gray-800">
                  {billData.invoiceCode}
                </p>
              </div>
            </div>

            {/* Info Section */}
            <div className="mb-6 text-sm space-y-2 bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày tạo</span>
                <span className="font-semibold text-gray-800">
                  {billData.createdTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">T.Ngân:</span>
                <span className="font-semibold text-gray-800">
                  {billData.cashierName || "Chưa có"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bàn:</span>
                <span className="font-bold text-blue-600">
                  {billData.tableName}
                </span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-gray-600"></span>
                <span className="font-semibold text-gray-800">Tại quầy</span>
              </div> */}
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

            {/* Items Header */}
            <div className="flex justify-between mb-3 text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">
              <span className="flex-1">Tên</span>
              <span className="w-16 text-center">SL</span>
              <span className="w-24 text-right">Tổng</span>
            </div>

            {/* Items List */}
            <div className="space-y-3 mb-4">
              {billData.details.map((item, index) => (
                <div
                  key={item.orderItemId}
                  className="hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <div className="flex justify-between text-sm">
                    <span className="flex-1 font-medium text-gray-800">
                      {item.productName}
                    </span>
                    <span className="w-16 text-center text-gray-700">
                      {item.quantity || 1}
                    </span>
                    <span className="w-24 text-right font-semibold text-gray-800">
                      {formatCurrency(item.totalMoney)}
                    </span>
                  </div>
                  {/* {item.toppings?.length > 0  && (
                    <div className="text-xs text-gray-500 ml-2 mt-1">
                      + {item.toppings.}
                    </div>
                  )} */}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

            {/* Totals */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Tổng SL món</span>
                <span className="font-semibold">{totalItems}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800">
                <span>Thành tiền</span>
                <span>{formatCurrency(billData.totalAmount)}</span>
              </div>

              {billData.discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(billData.discount)}</span>
                </div>
              )}
            </div>

            {/* Final Total */}
            <div className="bg-blue-600 text-white rounded-xl p-4 mb-4 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-base font-bold">Tổng thanh toán</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(finalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-blue-50">
                <span>+ {getPaymentMethodName(billData.paymentMethod)}</span>
                <span className="font-semibold">
                  {formatCurrency(finalAmount)}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

            {/* Thank You */}
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-gray-800 mb-1">
                Cảm ơn quý khách!
              </p>
              <p className="text-sm text-gray-600">Hẹn gặp lại</p>
            </div>
          </div>

          {/* Bottom Tear Effect */}
          <div
            className="h-3 bg-white"
            style={{
              backgroundImage:
                "radial-gradient(circle at 10px 100%, transparent 10px, white 10px)",
              backgroundSize: "20px 100%",
              backgroundRepeat: "repeat-x",
            }}
          ></div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-3 gap-3 no-print">
          <button
            onClick={handlePrint}
            className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-xl shadow-lg border border-gray-200 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span className="text-sm">In</span>
          </button>
          <button
            onClick={handleEmail}
            className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-xl shadow-lg border border-gray-200 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span className="text-sm">Email</span>
          </button>
          <button
            onClick={handleDownload}
            className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-xl shadow-lg border border-gray-200 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Lưu</span>
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .bg-gradient-to-br {
            background: white !important;
          }
          .shadow-2xl {
            box-shadow: none !important;
          }import { Response } from '@/api/moderator/TableApi';

          .print-area {
            max-width: 80mm;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};

export default CompleteBillComponent;
