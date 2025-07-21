import React from 'react';

const FeedbackDetailDialog = ({ open, onClose, request, tableId }) => {
  if (!open || !request) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center">Bàn {tableId}</h2>
  
      <div className="flex flex-col md:flex-row gap-6">
        {/* Hình ảnh bên trái */}
        <div className="flex-1 flex items-center justify-center">
        <iframe
            src="https://map-doan-nhattruowngs-projects.vercel.app/map/5"
            width="100%"
            height="600"
            style={{ border: "none" }}
            title="Map Embed"
            />

        </div>
  
        {/* Nội dung bên phải */}
        <div className="flex-1 text-sm">
          <p className="text-lg font-semibold mb-2">Chi tiết</p>
          <ul className="mb-4 space-y-2">
            <li>• <strong>Nội dung:</strong> {request.content}</li>
            <li>• <strong>Ghi chú:</strong> {request.note || 'Không có'}</li>
            <li>• <strong>Thanh toán:</strong> {request.pay}</li>
          </ul>
  
          <div className="text-right">
            <button
              onClick={onClose}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  );
};

export default FeedbackDetailDialog;
