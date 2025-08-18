import React, {useEffect, useState} from "react";

interface TableItem {
    id: string;
    name: string;
    status: string;
    qrCode: string;
}

export default function ModeratorTableManagement() {
    const [data, setData] = useState<TableItem[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [selectedQr, setSelectedQr] = useState<string>("");
    const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);

    useEffect(() => {
        fetch("https://be-robo.zd-dev.xyz/api/table")
            .then((res) => res.json())
            .then((json) => setData(json.items))
            .catch((err) => console.error(err));
    }, []);

    const handleOpen = (table: TableItem) => {
        setSelectedTable(table);
        setSelectedQr(table.qrCode);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedQr("");
        setSelectedTable(null);
    };  
    const handleToggleStatus = (table: TableItem) => {
        const currentStatus = table.status.toString();
        const newStatus = currentStatus === "0" ? "1" : "0";
      
        // UI update trước cho mượt
        setData((prevData) =>
          prevData.map((item) =>
            item.id === table.id ? { ...item, status: newStatus } : item
          )
        );
      
        // Backend update (chỉ gửi id + status)
        fetch(`http://localhost:5235/api/Table/${table.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: table.id,
            status: Number(newStatus),
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
          })
          .then((json) => console.log("Status updated:", json))
          .catch((err) => {
            console.error("Error updating status:", err);
            // rollback nếu fail
            setData((prevData) =>
              prevData.map((item) =>
                item.id === table.id ? { ...item, status: currentStatus } : item
              )
            );
          });
      };
      
    

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available':
            case '0':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'occupied':
            case '1':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'reserved':
            case '2':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available':
            case '0':
                return 'Available';
            case 'occupied':
            case '1':
                return 'Occupied';
            case 'reserved':
            case '2':
                return 'Reserved';
            default:
                return status;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Table Management</h1>
                    <p className="text-gray-600">Manage restaurant tables and QR codes</p>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <h2 className="text-xl font-semibold text-white">Tables Overview</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                    Table Name
                                </th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                    QR Code
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {data.map((row, index) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            <div
                                                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                                {row.name.charAt(0)}
                                            </div>
                                            <span className="text-gray-900 font-medium">{row.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                      <span 
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(row.status)}`}>
                        {getStatusText(row.status)}
                      </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <button
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                            onClick={() => handleOpen(row)}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                                            </svg>
                                            View QR
                                        </button>
                                    </td>
                                    <td>
                                            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                                            <label className="inline-flex items-center me-5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={row.status === "0"}   // 0 = Available
                                                onChange={() => handleToggleStatus(row)}
                                                className="sr-only peer"
                                            />
                                            <div
                                                className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700
                                                        peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800
                                                        peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                                                        peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5
                                                        after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full
                                                        after:h-5 after:w-5 after:transition-all dark:border-gray-600
                                                        peer-checked:bg-green-600 dark:peer-checked:bg-green-600">
                                            </div>
                                            <span
                                                className={`ms-3 text-sm font-medium border px-2 py-1 rounded-full ${getStatusColor(row.status)}`}
                                            >
                                                {getStatusText(row.status)}
                                            </span>
                                            </label>

                                    </div>
                                    </td>



                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {data.length === 0 && (
                            <div className="text-center py-12">
                                <div
                                    className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No tables found</h3>
                                <p className="text-gray-500">Loading table data...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Modal */}
            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div
                        className="bg-white rounded-2xl shadow-2xl relative max-w-md w-full transform transition-all duration-300 scale-100">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">QR Code - {selectedTable?.name}</h2>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
                                onClick={handleClose}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="bg-gray-50 rounded-xl p-6 mb-4 text-center">
                                <img
                                    src={selectedQr}
                                    alt="QR Code"
                                    className="w-full h-64 object-contain rounded-lg mb-4"
                                />
                                {/* Table Info */}
                                <div className="bg-white rounded-lg p-4 shadow-sm border">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedTable?.name}</h3>
                                    <p className="text-gray-600 text-sm mb-1">Scan QR code to order</p>
                                    <div className="flex items-center justify-center gap-2">
                    <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTable?.status || '')}`}>
                      {getStatusText(selectedTable?.status || '')}
                    </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                Print and place this QR code on the table for customers to scan
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                                </svg>
                                Print QR Code
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}