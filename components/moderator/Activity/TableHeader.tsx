import React from "react";

const TableHeader: React.FC = () => {
  const headers: string[] = [
    "Loại hoạt động",
    "Mã hoạt động",
    "Chi tiết",
    "Thời gian",
    "Trạng thái",
  ];

  return (
    <thead className="bg-gray-50">
      <tr>
        {headers.map((header, idx) => (
          <th
            key={idx}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
