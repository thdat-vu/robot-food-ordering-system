"use client";

import React, { useState } from "react";
import { Search, X, Loader, AlertCircle, FileText } from "lucide-react";
import { tableService } from "@/service/moderator/TableService";
import { Bill, CustomerLatestInvoice } from "@/entites/moderator/BillModel";
import CompleteBillComponent from "./CompleteBillComponent";
import { Star } from "lucide-react";

interface InvoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string, type: "success" | "error" | "warning") => void;
}

const InvoiceSearchModal: React.FC<InvoiceSearchModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<CustomerLatestInvoice | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate Vietnamese phone number format
  const validatePhoneNumber = (phoneNumber: string): boolean => {
    // Remove all spaces and special characters
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Vietnamese phone number: 10 digits, starting with 0
    const phoneRegex = /^0\d{9}$/;
    
    return phoneRegex.test(cleanPhone);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setValidationError(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      setValidationError("Vui lòng nhập số điện thoại");
      onShowToast?.("Vui lòng nhập số điện thoại", "warning");
      return;
    }

    // Validate phone format
    if (!validatePhoneNumber(phone)) {
      setValidationError("Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số, bắt đầu bằng số 0");
      onShowToast?.("Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số, bắt đầu bằng số 0", "error");
      return;
    }

    try {
      setLoading(true);
      setValidationError(null);
      setSearchResult(null);

      const response = await tableService.getLatestInvoiceByPhone(phone);

      if (response && response.data) {
        setSearchResult(response.data);
      } else {
        onShowToast?.("Không tìm thấy hóa đơn cho số điện thoại này.", "warning");
      }
    } catch (err: any) {
      console.error("Invoice search error:", err);
      
      // Handle different error types with toast notifications
      if (err.message?.includes("404")) {
        onShowToast?.("Không tìm thấy hóa đơn cho số điện thoại này.", "warning");
      } else if (err.message?.includes("400")) {
        onShowToast?.("Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.", "error");
      } else if (err.message?.includes("500")) {
        onShowToast?.("Lỗi hệ thống. Vui lòng thử lại sau.", "error");
      } else {
        onShowToast?.("Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tra cứu hóa đơn</h2>
              <p className="text-blue-100 text-sm">Tìm khách hàng và hóa đơn theo SĐT</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b bg-slate-50">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Nhập số điện thoại khách hàng..."
                className={`w-full pl-12 pr-4 py-3 bg-white border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  validationError ? "border-red-300 focus:ring-red-500" : "border-slate-200"
                }`}
                autoFocus
              />
              {validationError && (
                <div className="absolute left-0 -bottom-5 text-xs text-red-500 font-medium">
                  {validationError}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                "Tìm kiếm"
              )}
            </button>
          </form>
        </div>

        {/* Result Area */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Đang tìm kiếm thông tin...</p>
            </div>
          )}

          {!loading && !searchResult && (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <div className="bg-slate-200 p-6 rounded-full mb-4">
                <FileText className="h-12 w-12 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Kết quả tìm kiếm sẽ hiển thị tại đây</p>
            </div>
          )}

          {searchResult && !loading && (
            <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-6">
              {/* Customer Info Card */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Khách hàng</h3>
                  <p className="text-xl font-bold text-slate-900">{searchResult.customerName}</p>
                  <p className="text-sm text-slate-500">{searchResult.phoneNumber}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold border border-amber-200">
                    <Star className="w-4 h-4 fill-amber-500" />
                    {searchResult.totalPoins} điểm
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{searchResult.restaurantName}</p>
                </div>
              </div>

              {/* Invoice Section */}
              {searchResult.invoice ? (
                <div>
                  <div className="mb-4 flex items-center gap-2 text-slate-600 font-medium">
                    <FileText className="h-5 w-5" />
                    Hóa đơn mới nhất:
                  </div>
                  <CompleteBillComponent invoiceId={searchResult.invoice.id} />
                </div>
              ) : (
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center">
                  <p className="text-slate-500 font-medium">Khách hàng chưa có hóa đơn nào.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceSearchModal;
