import React, { useState } from 'react';
import FeedbackDetailDialog from './FeedbackDetailDialog'; // ✅ Adjust path as needed
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ModeratorFeedbackFromTable = ({ open, onClose, tableData }) => {
  if (!open || !tableData) return null;

  const staffList = [
    { id: '1', name: 'Quốc Triệu' },
    { id: '2', name: 'Nhật Trường' },
    { id: '3', name: 'Thành Đạt' },
    { id: '4', name: 'Trúc Phi' },
  ];

  const [assignments, setAssignments] = useState({});
  const [confirmedRows, setConfirmedRows] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleAssign = (index, staffId) => {
    setAssignments((prev) => ({ ...prev, [index]: staffId }));
  };

  const handleConfirm = (index) => {
    console.log("Confirm clicked", index); // ✅ kiểm tra click
    const assigned = assignments[index];
    if (!assigned) {
      toast.error('Vui lòng chọn nhân viên để xử lý!');
      return;
    }
  
    setConfirmedRows((prev) => ({ ...prev, [index]: true }));
  
    const staff = staffList.find((s) => s.id === assigned);
    if (staff) {
      console.log("Staff found", staff.name); // ✅ kiểm tra logic
      toast.success(`Feedback ${index + 1} đã giao cho ${staff.name}`);
    } else {
      toast.error(`Không tìm thấy nhân viên phù hợp!`);
    }
  };
  

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Chi tiết bàn {tableData.id}</h2>

          <table className="min-w-full border rounded-lg overflow-hidden shadow-sm text-sm">
            <thead className="bg-blue-100 text-gray-700 text-center">
              <tr>
                <th className="px-4 py-3 border">Thời Gian</th>
                <th className="px-4 py-3 border">Nội Dung</th>
                <th className="px-4 py-3 border">Ghi Chú</th>
                <th className="px-4 py-3 border">Thanh Toán</th>
                <th className="px-4 py-3 border">Nhân viên</th>
                <th className="px-4 py-3 border">Xác nhận</th>
              </tr>
            </thead>
            <tbody>
              {tableData.requests.map((req, index) => {
                const isConfirmed = confirmedRows[index];

                return (
                  <tr
                    key={index}
                    onClick={() => setSelectedRequest(req)}
                    className={`text-center cursor-pointer even:bg-white odd:bg-gray-50 ${
                      isConfirmed ? 'bg-green-50' : 'hover:bg-blue-50'
                    } transition duration-200`}
                  >
                    <td className="px-3 py-2 border">{req.time}</td>
                    <td className="px-3 py-2 border">{req.content}</td>
                    <td className="px-3 py-2 border">{req.note}</td>
                    <td className="px-3 py-2 border">{req.pay}</td>
                    <td className="px-3 py-2 border">
                      <select
                        disabled={isConfirmed}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-full px-2 py-1 rounded border ${
                          isConfirmed
                            ? 'bg-gray-200 text-gray-600'
                            : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
                        }`}
                        value={assignments[index] || ''}
                        onChange={(e) => handleAssign(index, e.target.value)}
                      >
                        <option value="">Chọn nhân viên</option>
                        {staffList.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 border">
                      {isConfirmed ? (
                        <span className="text-green-600 font-semibold">✅ Hoàn thành</span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent opening detail
                            handleConfirm(index);
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow-sm"
                        >
                          ✔
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-4 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Feedback detail popup */}
      <FeedbackDetailDialog
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        tableId={tableData.id}
      />
       <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};


export default ModeratorFeedbackFromTable;
