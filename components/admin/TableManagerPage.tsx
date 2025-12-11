import React, { useCallback, useEffect, useState } from "react";
import {
  useGetTableApi,
  useDeleteTable,
  usePostFileExcelTable,
} from "@/hooks/admin/useAdminHooks";
import { BaseEntity } from "@/entites/BaseEntity";
import { Table } from "@/api/admin/adminApi";
import { TableDashboard } from "./item/TableDashboard";

export const TableManagerPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { run: getTables } = useGetTableApi();
  const { run: deleteTable } = useDeleteTable();

  // Fetch tables on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res: BaseEntity<Table[]> = await getTables();
        if (res.items) {
          setTables(res.items as Table[]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Handle delete - refresh tables after deletion
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTable(id);
      // Refresh the table list after deletion
      const res: BaseEntity<Table[]> = await getTables();
      if (res.items) {
        setTables(res.items as Table[]);
      }
    },
    [deleteTable, getTables]
  );

  return (
    <div className="space-y-4">
      <TableDashboard tables={tables} onDelete={handleDelete} />
    </div>
  );
};
