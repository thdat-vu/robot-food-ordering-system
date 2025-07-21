import React, { useState } from 'react';
import TableDetailDialog from './ModeratorFeedbackFromTable';

const ModeratorScreen = () => {
  const mockData = {
    '05': {
      id: '05',
      requests: [
        { time: 'hiện tại', content: 'Xin thêm đũa', note: 'Không', pay: 'Chưa Thanh Toán' },
        { time: '10:50 25/07/2025', content: 'Xin thêm đũa', note: 'Không', pay: 'Đã Thanh Toán' },
        { time: '9:00 25/07/2025', content: 'Đồ ăn nguội', note: 'Có', pay: 'Đã Thanh Toán' },
      ],
    },
    '06': {
      id: '06',
      requests: [
        { time: '10:00 25/07/2025', content: 'Xin thêm nước', note: 'Không', pay: 'Chưa Thanh Toán' },
        { time: '11:00 25/07/2025', content: 'Xin thêm khăn giấy', note: 'Có', pay: 'Đã Thanh Toán' },
      ],
    },
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  // ✅ Bắt đầu với các bàn trong mockData có chuông
  const [tablesWithBell, setTablesWithBell] = useState(() =>
    Object.keys(mockData).reduce((acc, tableId) => {
      acc[tableId] = true;
      return acc;
    }, {})
  );

  const handleBellClick = (id) => {
    const data = mockData[id];
    if (data) {
      setSelectedTable(data);
      setOpenDialog(true);
    }
  };

  // ✅ Callback từ TableDetailDialog để cập nhật chuông
  const handleStatusChange = (tableId, allConfirmed) => {
    setTablesWithBell((prev) => ({
      ...prev,
      [tableId]: !allConfirmed,
    }));
  };

  // ✅ Tạo grid 12 bàn
  const cells = Array.from({ length: 12 }, (_, index) => {
    const id = (index + 1).toString().padStart(2, '0');
    return {
      id,
      isBell: tablesWithBell[id],
    };
  });

  return (
    <div className="w-screen h-screen bg-gray-100 p-4 md:p-8 overflow-hidden">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full h-full flex flex-col">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          BẢNG QUẢN LÝ MODERATOR
        </h2>

        {/* Grid các bàn */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 flex-1 overflow-auto">
          {cells.map((cell) => (
            <div
              key={cell.id}
              className={`relative flex items-center justify-center aspect-square rounded-2xl text-5xl font-semibold text-gray-700
                transition duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg
                ${cell.isBell ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-white'}`}
            >
              {cell.isBell ? (
                <>
                  <span>{cell.id}</span>
                  <span
                    onClick={() => handleBellClick(cell.id)}
                    className="absolute top-2 right-2 text-orange-500 text-2xl md:text-3xl animate-pulse cursor-pointer"
                  >
                    🔔
                  </span>
                </>
              ) : (
                <span>{cell.id}</span>
              )}
            </div>
          ))}
        </div>

        {/* Dialog hiển thị chi tiết table */}
        <TableDetailDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          tableData={selectedTable}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};

export default ModeratorScreen;
