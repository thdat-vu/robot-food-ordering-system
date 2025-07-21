import React , { useState }  from 'react';
import TableDetailDialog from './ModeratorFeedbackFromTable';
import FeedbackDetailDialog from './FeedbackDetailDialog';

const ModeratorScreen = () => {
  const cells = Array.from({ length: 12 }, (_, index) => ({
    id: (index + 1).toString().padStart(2, '0'),
    isBell: index === 4,
  }));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const mockData = {
    '05': {
      id: '05',
      requests: [
        { time: 'Now', content: 'Xin thêm đũa', note: 'No', pay: 'No' },
        { time: '10:50 25/07/2025', content: 'Xin thêm đũa', note: 'No', pay: 'Yes' },
        { time: '9:00 25/07/2025', content: 'Đồ ăn nguội', note: 'Yes', pay: 'Yes' },
      ],
    },
  };

  const handleBellClick = (id) => {
    const data = mockData[id];
    if (data) {
      setSelectedTable(data);
      setOpenDialog(true);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-100 p-4 md:p-8 overflow-auto">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full h-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center ">
          Moderator management Table
        </h2>

       <div className="grid grid-cols-4 gap-6 h-full p-4">
        {cells.map((cell) => (
          <div
            key={cell.id}
            className={`relative flex items-center justify-center h-full min-h-[120px] rounded-2xl text-5xl font-semibold text-gray-700 
              transition duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg 
              ${cell.isBell ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-white'}`}
          >
            {cell.isBell ? (
              <>
                <span>{cell.id}</span>
                <span onClick={() => handleBellClick(cell.id)} className="absolute top-2 right-2 text-orange-500 text-2xl md:text-3xl animate-pulse">🔔</span>
              </>
            ) : (
              <span>{cell.id}</span>
            )}
          </div>
        ))}
      </div>

      </div>
       {/* Dialog */}

       <TableDetailDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        tableData={selectedTable}
      />
    </div>
  );
};

export default ModeratorScreen;
