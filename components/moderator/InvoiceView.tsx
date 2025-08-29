import React from "react";
import { InvoiceResponse } from "@/lib/api/invoices";

interface InvoiceProps {
  invoice: InvoiceResponse | null;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const InvoiceView: React.FC<InvoiceProps> = ({ invoice, onClose }) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return 'N/A';
    }
  };
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`

        <html>
          <head>
            <title>Hóa đơn ${invoice?.tableName}</title>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              background: #f8fafc;
              padding: 0;
              margin: 0;
            }
            .bill-container {
              max-width: 420px;
              margin: 32px auto;
              background: #fff;
              border-radius: 16px;
              box-shadow: 0 4px 24px #0001;
              padding: 32px 28px 24px 28px;
              border: 1.5px solid #e2e8f0;
            }
            .bill-header {
              text-align: center;
              margin-bottom: 18px;
            }
            .bill-logo {
              width: 54px;
              margin-bottom: 8px;
              opacity: 0.95;
            }
            .bill-title {
              font-size: 1.5rem;
              font-weight: bold;
              color: #059669;
              letter-spacing: 1px;
              margin-bottom: 2px;
            }
            .bill-table {
              font-size: 1.1rem;
              font-weight: 500;
              color: #334155;
              margin-bottom: 8px;
            }
            .bill-status {
              font-size: 0.98rem;
              color: #64748b;
              margin-bottom: 12px;
            }
            ul.bill-list {
              list-style: none;
              padding: 0;
              margin: 0 0 12px 0;
              border-top: 1.5px solid #e2e8f0;
              border-bottom: 1.5px solid #e2e8f0;
            }
            ul.bill-list li {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 10px 0;
              border-bottom: 1px dashed #e2e8f0;
              font-size: 1rem;
            }
            ul.bill-list li:last-child {
              border-bottom: none;
            }
            .item-info {
              max-width: 220px;
            }
            .item-name {
              font-weight: 500;
              color: #0f172a;
            }
            .item-detail {
              font-size: 0.93em;
              color: #64748b;
              margin-left: 2px;
            }
            .item-topping {
              font-size: 0.92em;
              color: #16a34a;
              margin-left: 2px;
            }
            .item-price {
              font-weight: 600;
              color: #059669;
              white-space: nowrap;
              margin-left: 8px;
            }
            .bill-total {
              font-size: 1.18rem;
              font-weight: bold;
              color: #059669;
              text-align: right;
              margin-top: 16px;
              margin-bottom: 8px;
            }
            .bill-footer {
              font-size: 0.98rem;
              color: #64748b;
              text-align: center;
              margin-top: 18px;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
            }
          </style>
          </head>
          <body>
            <div class="bill-container">
              <div class="bill-header">
                <img class="bill-logo" src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Logo" />
                <div class="bill-title">HÓA ĐƠN THANH TOÁN</div>
                <div class="bill-table">${invoice?.tableName}</div>
                <div class="bill-status">Trạng thái: ${invoice?.paymentStatus}</div>
              </div>
              <ul class="bill-list">
                ${invoice?.details
                  .map((item) => {
                    const totalItemPrice = item.totalMoney;
                    return `<li>
                      <div class="item-info">
                        <span class="item-name">${item.productName}</span>
                      </div>
                      <span class="item-price">${totalItemPrice.toLocaleString("vi-VN")}đ</span>
                    </li>`;
                  })
                  .join("")}
              </ul>
              <div class="bill-total">Tổng cộng: ${invoice?.totalMoney.toLocaleString("vi-VN")}đ</div>
              <div class="bill-footer">
                Thời gian: ${formatDate(invoice?.createdTime)}<br/>
                Xin cảm ơn quý khách!<br/>
                --- SEB Waiter ---
              </div>
            </div>
            <script>
              window.onload = function () {
                window.print();
                window.onafterprint = function () {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    }
  };
  if (!invoice) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-xl w-[420px] text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-semibold">Không tìm thấy hóa đơn</p>
            <p className="text-sm">Hóa đơn cho bàn này không tồn tại hoặc đã bị xóa</p>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-2 px-4 rounded-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-[420px]">
        <h2 className="text-xl font-bold mb-4">Hóa đơn - {invoice.tableName}</h2>

        <ul className="divide-y divide-gray-200">
          {invoice?.details.map((item) => (
            <li key={item.orderItemId} className="flex justify-between py-2">
              <span>{item.productName}</span>
              <span>{item.unitPrice.toLocaleString("vi-VN")}đ</span>
            </li>
          ))}
        </ul>
          
        <div className="mt-4 text-right font-bold">
          Tổng cộng: {invoice?.totalMoney.toLocaleString("vi-VN")}đ
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handlePrint}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg"
          >
            In hóa đơn
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
