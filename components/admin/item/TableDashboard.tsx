import React, { useState, useMemo, useCallback } from "react";
import { Table } from "@/api/admin/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MdSearch, MdAdd, MdTableRestaurant } from "react-icons/md";
import { FiUsers, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { TableCard } from "./TableCard";
import { FaFileImport } from "react-icons/fa";
import { RxDownload } from "react-icons/rx";
import { downloadPublicFile } from "@/unit/Unit";
import { ImportFile } from "./ImportFile";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { usePostFileExcelTable } from "@/hooks/admin/useAdminHooks";

type Props = {
  tables: Table[];
  onDelete: (id: string) => void;
  onAddTable?: () => void;
};

export const TableDashboard: React.FC<Props> = ({
  tables,
  onDelete,
  onAddTable,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<Table | null>(null);

  const { run: runPostExcelTable } = usePostFileExcelTable();

  // Calculate statistics
  const stats = useMemo(() => {
    const total = tables.length;
    const available = tables.filter(
      (t) => t.status.toLowerCase() === "available"
    ).length;
    const occupied = tables.filter(
      (t) => t.status.toLowerCase() === "occupied"
    ).length;
    const disabled = tables.filter(
      (t) => t.status.toLowerCase() === "disabled"
    ).length;

    return { total, available, occupied, disabled };
  }, [tables]);

  // Filter tables based on search
  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;

    const query = searchQuery.toLowerCase();
    return tables.filter((table) => table.name.toLowerCase().includes(query));
  }, [tables, searchQuery]);

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    const table = tables.find((t) => t.id === id);
    if (table) {
      setSelected(table);
      setOpenDelete(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await onDelete(selected.id);
    } finally {
      setLoading(false);
      setOpenDelete(false);
      setSelected(null);
    }
  };

  // Handle import confirmation
  const handleConfirmImport = useCallback(async () => {
    if (!excelFile) return;
    setLoading(true);
    try {
      await runPostExcelTable(excelFile);
      setOpen(false);
      setExcelFile(null);
    } finally {
      setLoading(false);
    }
  }, [excelFile, runPostExcelTable]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bảng Điều Khiển Quản Trị
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Quản lý toàn diện tài khoản, thực đơn và cấu hình hệ thống
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <MdTableRestaurant className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng số bàn</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-50">
                <FiCheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Bàn trống</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.available}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <FiUsers className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Đang phục vụ</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.occupied}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gray-50">
                <FiXCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Ngưng hoạt động</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.disabled}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm bàn theo tên hoặc số bàn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            className="gap-2 h-10"
            onClick={() =>
              downloadPublicFile(
                "/FileSettingTemplet/TableSetting.xlsx",
                "tablesFile.xlsx"
              )
            }
          >
            <RxDownload className="w-4 h-4" />
            Tải template
          </Button>

          <Button className="gap-2 h-10" onClick={() => setOpen(true)}>
            <FaFileImport className="w-4 h-4" />
            Nhập dữ liệu
          </Button>
        </div>
      </div>

      {/* Tables Grid */}
      {filteredTables.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredTables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                handle={handleDeleteClick}
              />
            ))}
          </div>

          {/* Results counter */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Hiển thị {filteredTables.length} trong {tables.length} bàn
            </div>
          </div>
        </>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center">
            <MdTableRestaurant className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-1">Không tìm thấy bàn nào</p>
            <p className="text-sm text-gray-500">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác"
                : "Chưa có bàn nào trong hệ thống"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Import File Modal */}
      <ImportFile
        open={open}
        conten="Chọn file Excel chứa danh sách bàn"
        loading={loading}
        excelFile={excelFile}
        setExcelFile={setExcelFile}
        isClose={() => setOpen(false)}
        handle={handleConfirmImport}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={openDelete}
        tableName={selected?.name ?? ""}
        loading={loading}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
