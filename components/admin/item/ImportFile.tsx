import React, {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Loader2} from "lucide-react";


type Props = {
    open: boolean;
    title?: string;
    conten: string;
    excelFile: File | null;
    setExcelFile: (file: File | null) => void;
    loading: boolean;
    isClose: () => void;
    handle: () => void,
}
export const ImportFile: React.FC<Props> = ({handle, setExcelFile, excelFile, loading, open, isClose, conten, title}) => {


    return (
        <>
            <Dialog open={open} onOpenChange={isClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{title || "Nhập món ăn từ Excel"}</DialogTitle>
                        <DialogDescription>
                            {conten}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="dish-excel">File Excel *</Label>
                            <Input
                                id="dish-excel"
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    setExcelFile(file);
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Hỗ trợ định dạng: .xlsx, .xls
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setExcelFile(null);
                                isClose();
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handle}
                            disabled={!excelFile || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                    Đang nhập...
                                </>
                            ) : (
                                "Xác nhận"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}