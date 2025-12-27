import React from "react";

/* ================= TYPES ================= */

type HeaderInfoProps = {
  tableName?: string | null;
  totalCount: number;
  sessionId?: string | null;
};

/* ================= COMPONENT ================= */

export const HeaderInfo: React.FC<HeaderInfoProps> = ({
  tableName,
  totalCount,
  sessionId,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Lịch sử hoạt động
      </h1>

      {tableName && <p className="text-gray-600">{tableName}</p>}

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <span>Tổng: {totalCount} hoạt động</span>

        {sessionId && (
          <>
            <span>•</span>
            <span>Session: {sessionId.slice(0, 8)}...</span>
          </>
        )}
      </div>
    </div>
  );
};

export default HeaderInfo;
