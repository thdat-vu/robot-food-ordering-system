import React, { useCallback, useEffect, useState } from "react";
import {
  useGetTableApi,
  useDeleteTable,
} from "@/hooks/admin/useAdminHooks";
import { BaseEntity } from "@/entites/BaseEntity";
import { Table } from "@/api/admin/adminApi";
import { TableDashboard } from "./item/TableDashboard";

export const TableManagerPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { run: getTables } = useGetTableApi();
  const { run: deleteTable } = useDeleteTable();

  const handleRefresh = useCallback(async () => {
    const res: BaseEntity<Table[]> = await getTables();
    if (res.items) {
      setTables(res.items as Table[]);
    }
  }, [getTables]);

  // Fetch tables on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await handleRefresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [handleRefresh]);

  // Handle delete - refresh tables after deletion
  const handleDelete = useCallback(
    async (id: string): Promise<{ success: boolean; message?: string }> => {
      try {
        const result = await deleteTable(id);
        
        // Check if deletion was successful based on API response
        const isSuccess = 
          result?.code === "SUCCESS" ||
          result?.codes === "SUCCESS" ||
          result?.statusCode === 200 ||
          result?.data === true ||
          (result && !result.error && !result.message?.toLowerCase().includes("thất bại"));

        if (isSuccess) {
          await handleRefresh();
          return { success: true };
        } else {
          return { 
            success: false, 
            message: result?.message || "Xoá bàn thất bại." 
          };
        }
      } catch (error: any) {
        return { 
          success: false, 
          message: error?.response?.data?.message || error?.message || "Đã xảy ra lỗi khi xoá bàn." 
        };
      }
    },
    [deleteTable, handleRefresh]
  );

  return (
    <div className="space-y-4">
      <TableDashboard
        tables={tables}
        onDelete={handleDelete}
        onImportSuccess={handleRefresh}
      />
    </div>
  );
};
