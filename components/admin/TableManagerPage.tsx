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
    async (id: string) => {
      await deleteTable(id);
      await handleRefresh();
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
