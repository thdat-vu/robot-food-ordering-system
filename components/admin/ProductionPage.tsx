import React, {useEffect, useState} from "react";
import {Clock, Edit, Eye, MoreVertical, Plus, Search, TrendingUp, Loader2} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {FaFileImport} from "react-icons/fa";

import {DishCard} from "@/components/admin/item/DishCard";
import {downloadPublicFile} from "@/unit/Unit";
import {RxDownload} from "react-icons/rx";
import {CiExport} from "react-icons/ci";
import {useCategoryApi, useDishsApi, useGetExportExcel, usePostFileExcel} from "@/hooks/admin/useAdminHooks";
import {Category, Production} from "@/api/admin/adminApi";
import {BaseEntity, BaseEntityDataError} from "@/entites/BaseEntity";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ImportFile} from "@/components/admin/item/ImportFile";
import { ToastContainer } from "@/components/admin/item/ToastContainer";
import { useToastAdmin } from "@/hooks/use-toast-admin";

export const ProductionPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [addDishModal, setAddDishModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [categorys, setCategorys] = useState<Category[]>([])
    const [productions, setProductions] = useState<Production[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [search, setSearch] = useState<string>("")
    const { toasts, addToast, removeToast } = useToastAdmin();

    const {run} = usePostFileExcel();
    const {run: runGetFile} = useGetExportExcel();
    const {run: runGetAllCategory} = useCategoryApi();
    const {run: runGetAllDish} = useDishsApi();

    const [excelFile, setExcelFile] = useState<File | null>(null);


    const handleLoadingPriduction = async () => {
        setSearchLoading(true);
        try {
            const resProducts: BaseEntity<Production[]> = await runGetAllDish(selectedCategory, search);
            setProductions(resProducts.items as Production[]);
        } finally {
            setSearchLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            const res: BaseEntity<Category[]> = await runGetAllCategory();
            setCategorys(res.items as Category[]);
            handleLoadingPriduction();
        })()
    }, []);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchQuery);
        }, 2000);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        handleLoadingPriduction();
    }, [search, selectedCategory]);

    const handleConfirmImport = async () => {
        if (!excelFile) {
            addToast("Vui lòng chọn file Excel trước khi import", "error");
            return;
        }
        setLoading(true);
        try {
            const res = await run(excelFile);
            if (res.data === true) {
                addToast("Nhập dữ liệu món ăn thành công!", "success");
                await handleLoadingPriduction();
                setAddDishModal(false);
                setExcelFile(null);
            } else {
                addToast(res.message || "Nhập dữ liệu thất bại", "error");
            }
        } catch (error: any) {
            addToast(error?.message || "Có lỗi xảy ra khi import", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = async () => {
        setLoading(true);
        try {
            const res = await runGetFile();
            if (res.data === true) {
                addToast("Xuất dữ liệu món ăn thành công!", "success");
            } else {
                addToast(res.message || "Xuất dữ liệu thất bại", "error");
            }
        } catch (error: any) {
            addToast(error?.message || "Có lỗi xảy ra khi export", "error");
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <div className="space-y-4">

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                    {/* Ô tìm kiếm */}
                    <div className="relative flex-1 min-w-[200px]">
                        {searchLoading ? (
                            <Loader2
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin"/>
                        ) : (
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        )}
                        <Input
                            placeholder="Tìm món ăn theo tên hoặc danh mục..."
                            className="pl-10 h-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>


                    <Select onValueChange={(value) => {
                        setSelectedCategory(value === "all" ? "" : value);
                    }}>
                        <SelectTrigger className="w-full sm:w-[200px] h-10">
                            <SelectValue placeholder="Chọn danh mục"/>
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">Tất cả danh mục</SelectItem>
                            {categorys.map((c) => (
                                <SelectItem key={c.id} value={c.name}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <Button
                            className="gap-2 h-10"
                            onClick={() =>
                                downloadPublicFile(
                                    "/FileSettingTemplet/ProductionItem.xlsx",
                                    "dish.xlsx"
                                )
                            }
                        >
                            <RxDownload className="w-4 h-4"/>
                            Tải template
                        </Button>

                        {/*<Button className="gap-2 h-10" onClick={() => setAddDishModal(true)}>*/}
                        {/*    <Plus className="w-4 h-4"/>*/}
                        {/*    Thêm Món*/}
                        {/*</Button>*/}

                        <Button className="gap-2 h-10" onClick={() => setAddDishModal(true)}>
                            <FaFileImport className="w-4 h-4"/>
                            Nhập dữ liệu
                        </Button>

                        <Button 
                            className="gap-2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white" 
                            onClick={handleExportExcel}
                            disabled={loading}
                        >
                            <CiExport className="w-4 h-4"/>
                            Xuất dữ liệu
                        </Button>
                    </div>
                </div>


                <div className="grid gap-4">
                    {searchLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground"/>
                        </div>
                    ) : productions.length > 0 ? (
                        productions.map((dish) => (
                            <DishCard key={dish.id} dish={dish}/>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            Không tìm thấy món ăn nào
                        </div>
                    )}
                </div>

                {/*{!searchLoading && productions.length > 0 && (*/}
                {/*    <div className="flex items-center justify-between text-sm text-muted-foreground">*/}
                {/*        <div>Hiển thị {productions.length} món ăn</div>*/}
                {/*        <div className="flex gap-2">*/}
                {/*            <Button variant="outline" size="sm" disabled>*/}
                {/*                Trước*/}
                {/*            </Button>*/}
                {/*            <Button variant="outline" size="sm">*/}
                {/*                Sau*/}
                {/*            </Button>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>


                <ImportFile open={addDishModal}
                            title="Nhập danh sách món ăn từ Excel"
                            conten="Chọn file Excel chứa danh sách món ăn để nhập vào hệ thống"
                            loading={loading}
                            excelFile={excelFile}
                            setExcelFile={setExcelFile}
                            isClose={() => setAddDishModal(false)}
                            handle={handleConfirmImport}/>
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </>
    )
}