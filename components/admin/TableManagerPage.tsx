import React, {useCallback, useEffect, useState} from "react";
import {Loader2, Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {downloadPublicFile} from "@/unit/Unit";
import {RxDownload} from "react-icons/rx";
import {FaFileImport} from "react-icons/fa";
import {useDeleteTable, useGetTableApi, usePostFileExcelTable} from "@/hooks/admin/useAdminHooks";
import {BaseEntity} from "@/entites/BaseEntity";
import {TableCard} from "@/components/admin/item/TableCard";
import {ImportFile} from "@/components/admin/item/ImportFile";
import {Table} from "@/api/admin/adminApi";
import {ConfirmDeleteDialog} from "@/components/admin/item/ConfirmDeleteDialog";


export const TableManagerPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [tables, setTables] = useState<Table[]>([])
    const [filteredTables, setFilteredTables] = useState<Table[]>([])
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [excelFile, setExcelFile] = useState<File | null>(null);


    const {run} = useGetTableApi();
    const {run: runPostExcelTable} = usePostFileExcelTable();
    const {run: deleteTbale} = useDeleteTable();


    const [openDelete, setOpenDelete] = useState(false);
    const [selected, setSelected] = useState<Table | null>(null);

    useEffect(() => {
        (async () => {
            setSearchLoading(true);
            try {
                const res: BaseEntity<Table[]> = await run();
                console.log(res)
                if (res.items) {
                    setTables(res.items as Table[]);
                    setFilteredTables(res.items as Table[]);
                }
            } finally {
                setSearchLoading(false);
            }
        })()
    }, []);


    const handleConfirmImport = useCallback(async () => {
        if (!excelFile) return;
        setLoading(true);
        try {
            await runPostExcelTable(excelFile)
            setOpen(false);
            setExcelFile(null);
        } finally {
            setLoading(false);
        }
    }, [excelFile]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!searchQuery.trim()) {
                setFilteredTables(tables);
            } else {
                const query = searchQuery.toLowerCase();
                const filtered = tables.filter((table) => {
                    const tableName = table.name?.toLowerCase() || "";
                    const tableNumber = table.name?.toString().toLowerCase() || "";

                    return tableName.includes(query) ||
                        tableNumber.includes(query)
                });
                setFilteredTables(filtered);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, tables]);

    const handleDeleteClick = (id: string) => {
        const tb = tables.find(t => t.id === id);
        if (tb) {
            setSelected(tb);
            setOpenDelete(true);
        }
    };

    const handleConfirm = async () => {
        if (!selected) return;
        setLoading(true);
        await deleteTbale(selected.id);
        setLoading(false);
        setOpenDelete(false);
    };

    return (
        <>
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                    <div className="relative flex-1 min-w-[200px]">
                        {searchLoading ? (
                            <Loader2
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin"/>
                        ) : (
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        )}
                        <Input
                            placeholder="Tìm bàn theo tên hoặc số bàn..."
                            className="pl-10 h-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                            <RxDownload className="w-4 h-4"/>
                            Tải template
                        </Button>

                        <Button className="gap-2 h-10"
                                onClick={() => setOpen(true)}
                        >
                            <FaFileImport className="w-4 h-4"/>
                            Nhập dữ liệu
                        </Button>
                    </div>
                </div>

                {searchQuery && (
                    <div className="text-sm text-muted-foreground">
                        Tìm thấy {filteredTables.length} kết quả cho "{searchQuery}"
                    </div>
                )}

                <div className="grid gap-4">
                    {searchLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground"/>
                        </div>
                    ) : filteredTables.length > 0 ? (
                        filteredTables.map((table) => (
                            <TableCard key={table.id} table={table} handle={handleDeleteClick}/>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            {searchQuery
                                ? `Không tìm thấy bàn nào với từ khóa "${searchQuery}"`
                                : "Không có bàn nào"}
                        </div>
                    )}
                </div>

                {!searchLoading && filteredTables.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div>Hiển thị {filteredTables.length} trong {tables.length} bàn</div>
                    </div>
                )}
            </div>
            <ImportFile open={open}
                        conten="Chọn file Excel chứa danh sách bàn"
                        loading={loading}
                        excelFile={excelFile}
                        setExcelFile={setExcelFile}
                        isClose={() => setOpen(false)}
                        handle={handleConfirmImport}/>


            <ConfirmDeleteDialog
                open={openDelete}
                tableName={selected?.name ?? ""}
                loading={loading}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleConfirm}
            />
        </>
    )
}